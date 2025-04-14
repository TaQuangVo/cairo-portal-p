import { createCustomerAccountPortfolio, initSequentialCustomerAccountPortfolioCreationResult } from "@/services/cairoService"
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs"
import { updateResponseToSubmission } from "@/services/submittionService"
import { NewPortfolioResponse } from "../../submittions/v2/portfolios/helper"
import { PORTFOLIO_HANDLER_RETRIES } from "@/constant/qstash"

// 👇 Verify that this messages comes from QStash
export const POST = verifySignatureAppRouter(async (req: Request) => {
  const controller = new AbortController();
  const signal = controller.signal;

    // 1. Abort if client disconnects
    req.signal.addEventListener('abort', () => {
      console.warn('Client disconnected, aborting...');
      controller.abort();
    });

    // 2. Abort after a timeout (e.g. 10 seconds)
    const timeoutId = setTimeout(() => {
      console.warn('Timeout reached, aborting...');
      controller.abort();
    }, 50000); // 50s

  const body = await req.json()
  const cairoCustomer = body.customer
  const cairoAccount = body.account
  const cairoPortfolio = body.portfolio
  const cairoPortfolioSubscription = body.subscriptions
  const rawBody = body.rawBody
  const constext = body.constext

  try{
    const response = await createCustomerAccountPortfolio(cairoCustomer, cairoAccount, cairoPortfolio, cairoPortfolioSubscription, ['SKIP CUSTOMER CREATION'], signal)

    const customerCreationFailed = response.customerCreation.status !== 'success' && response.customerCreation.status !== 'skipped'
    const portfolioCreationFailed = response.portfolioCreation.status !== 'success' && response.portfolioCreation.status !== 'skipped'
    const accountCreationFailed = response.accountCreation.status !== 'success' && response.accountCreation.status !== 'skipped'
    const portalUserRegistrationFailed = response.portalUserRegistration.status !== 'success' && response.portalUserRegistration.status !== 'skipped'
    const subscriptionCreationFailed = response.subscriptionCreation.every(res => res.status === 'success' || res.status === 'skipped')

    const isPartialFailure = (portfolioCreationFailed || accountCreationFailed || portalUserRegistrationFailed || subscriptionCreationFailed) && !customerCreationFailed
    const isSuccess = !(portfolioCreationFailed || accountCreationFailed || portalUserRegistrationFailed || subscriptionCreationFailed || customerCreationFailed)
    const status = isPartialFailure ? 'partial failure' : !isSuccess ? 'failed' : 'success'

    let retried = 10000
    let message = ''
    let returnStatus: NewPortfolioResponse['status'] = 'error'
    try{
      const retriedHeader = req.headers.get('Upstash-Retried')
      if(retriedHeader){
        retried = parseInt(retriedHeader) + 1
      }
    }catch(e){
      message = 'Error while parsing retried header'
    }

    if(isSuccess){
      returnStatus = 'success'
      message = 'Account create successfully'
    }else if(retried < PORTFOLIO_HANDLER_RETRIES){
      returnStatus = 'pending'
      message = 'Failed to create account, Retries left: ' + (PORTFOLIO_HANDLER_RETRIES - retried)
    }else if(retried === PORTFOLIO_HANDLER_RETRIES){
      if(isPartialFailure){
        returnStatus = 'partial failure'
      }else{
        returnStatus = 'failed'
      }
      message = 'Failed to create account, Out of retries, This will be handled by a support team member.'
    }

    const resData:Partial<NewPortfolioResponse> = {
      status: returnStatus,
      requestBody: rawBody,
      messages: message,
      dataType: 'SequentialCustomerAccountPortfolioCreatioResult',
      data: response
    }
    updateResponseToSubmission(resData, constext.submissionResultId as string)

    if(isSuccess){
      return new Response(`Image with id "${cairoPortfolio.portfolioDescription}" processed successfully.`, {status: 200})
    }

    return new Response(`Image with id "${cairoPortfolio.portfolioDescription}" processed successfully.`, {status: 500})
  }catch(e){
    const resData:Partial<NewPortfolioResponse> = {
        status: 'error',
        requestBody: rawBody,
        messages:'Error while creating portfolio',
        dataType: 'Error',
        data: (e as Error)
    }
    updateResponseToSubmission(resData, constext.submissionResultId as string)

    return Response.json(resData, {status: 500})
  }
})