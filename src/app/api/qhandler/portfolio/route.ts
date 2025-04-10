import { createCustomerAccountPortfolio } from "@/services/cairoService"
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs"
import { updateResponseToSubmission } from "@/services/submittionService"
import { NewPortfolioResponse } from "../../submittions/v2/portfolios/helper"

// 👇 Verify that this messages comes from QStash
export const POST = verifySignatureAppRouter(async (req: Request) => {
  const body = await req.json()
  const cairoCustomer = body.customer
  const cairoAccount = body.account
  const cairoPortfolio = body.portfolio
  const cairoPortfolioSubscription = body.subscriptions
  const rawBody = body.rawBody
  const constext = body.constext

  try{
    const response = await createCustomerAccountPortfolio(cairoCustomer, cairoAccount, cairoPortfolio, cairoPortfolioSubscription, ['SKIP CUSTOMER CREATION'])

    const portfolioCreationFailed = response.portfolioCreation.status !== 'success' && response.portfolioCreation.status !== 'skipped'
    const accountCreationFailed = response.accountCreation.status !== 'success' && response.accountCreation.status !== 'skipped'
    const customerCreationFailed = response.customerCreation.status !== 'success' && response.customerCreation.status !== 'skipped'

    const isPartialFailure = (portfolioCreationFailed || accountCreationFailed) && !customerCreationFailed
    const status = isPartialFailure ? 'partial failure' : portfolioCreationFailed ? 'failed' : 'success'

    const resData:Partial<NewPortfolioResponse> = {
      status,
      requestBody: rawBody,
      messages: status === 'success' ? 'Account created successfully' : 'Failed to create account',
      dataType: 'SequentialCustomerAccountPortfolioCreatioResult',
      data: response
    }
    updateResponseToSubmission(resData, constext.submissionResultId as string)
    return new Response(`Image with id "${cairoPortfolio.portfolioDescription}" processed successfully.`, {status: 200})
  }catch(e){
    const resData:Partial<NewPortfolioResponse> = {
        status: 'error',
        messages:'Error while creating portfolio',
        dataType: 'Error',
        data: (e as Error)
    }
    updateResponseToSubmission(resData, constext.submissionResultId as string)

    return Response.json(resData, {status: 500})
  }
})