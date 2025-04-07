import { createAccount, createCustomer, createPortfolio, fetchCustomerByPersonalNumber } from "@/lib/cairo"
import { CairoAccountCreationPayload, CairoCustomerCreationPayload, CairoCustomerCreationResponse, CairoAccountCreationResponse, CairoPortfolioCreationPayload, CairoHttpResponse, CairoPortfolioCreationResponse, CairoCustomer, CairoResponseCollection } from "@/lib/cairo.type"

export type CairoExercutionResult<P ,T> = {
    status: 'not exercuted' | 'success' | 'error' | 'failed' | 'skipped',
    statusCode?: number,
    response?: CairoHttpResponse<T>,
    payload: P 
}

export type SequentialCustomerAccountPortfolioCreatioResult = {
    customerCreation: CairoExercutionResult<CairoCustomerCreationPayload, CairoCustomerCreationResponse>,
    accountCreation: CairoExercutionResult<CairoAccountCreationPayload, CairoAccountCreationResponse>,
    portfolioCreation: CairoExercutionResult<CairoPortfolioCreationPayload, CairoPortfolioCreationResponse>
}

export class CreationWaring<T> extends Error {
    data:T
    warning: createCustomerAccountPortfolioWarning
    constructor(message: string, name: createCustomerAccountPortfolioWarning, data: T) {
        super(message);
        this.name = 'Creation warning'
        this.warning = name
        this.data = data 
    }
}

export type createCustomerAccountPortfolioWarning = 'SKIP CUSTOMER CREATION'

export async function getCustomerByPersonalNumber(personalNumber: string): Promise<CairoExercutionResult<String, CairoResponseCollection<CairoCustomer>>> {
    const result = await fetchCustomerByPersonalNumber(personalNumber)
    return {
        status: result.status,
        statusCode: result.statusCode,
        response: result,
        payload: personalNumber
    }
}

export async function createCustomerAccountPortfolio(customerCreationPayload: CairoCustomerCreationPayload, accountCreationPayload: CairoAccountCreationPayload, portfolioCreationPayload: CairoPortfolioCreationPayload, muteWarning:createCustomerAccountPortfolioWarning[]): Promise<SequentialCustomerAccountPortfolioCreatioResult>{
    let skipCustomerCreation = false

    let result: SequentialCustomerAccountPortfolioCreatioResult = {
        customerCreation: {
            status: 'not exercuted',
            statusCode: undefined,
            response: undefined,
            payload: customerCreationPayload
        },
        accountCreation: {
            status: 'not exercuted',
            statusCode: undefined,
            response: undefined,
            payload: accountCreationPayload
        },
        portfolioCreation: {
            status: 'not exercuted',
            statusCode: undefined,
            response: undefined,
            payload: portfolioCreationPayload
        }
    }

    // get customer by personal number from cairo
    const getCustomerResult = await getCustomerByPersonalNumber(customerCreationPayload.organizationId)
    let existingCustomerCode: string | undefined


    let notSkipCustomerCreationIfExist = getCustomerResult.status === 'success' && getCustomerResult.response?.data?.results[0] && !muteWarning.includes('SKIP CUSTOMER CREATION')
    let skipCustomerCreationIfExist = getCustomerResult.status === 'success' && getCustomerResult.response?.data?.results[0] && muteWarning.includes('SKIP CUSTOMER CREATION')

    if(notSkipCustomerCreationIfExist){
        throw new CreationWaring<CairoCustomer>('Customer with personal number ' + customerCreationPayload.organizationId + ' already exist.', 'SKIP CUSTOMER CREATION', getCustomerResult.response!.data!.results[0])
    }else if(skipCustomerCreationIfExist){
        skipCustomerCreation = true
        existingCustomerCode = getCustomerResult.response!.data!.results[0].customerCode
        if(existingCustomerCode === undefined){
            return result
        }
        accountCreationPayload.customerCode = existingCustomerCode
        portfolioCreationPayload.customerCode = existingCustomerCode
        result.customerCreation.status = 'skipped'
    }

    //create customer if not skipped
    if(!skipCustomerCreation){
        const customerCreationResponse = await createCustomer(customerCreationPayload)

        result.customerCreation.status = customerCreationResponse.status
        result.customerCreation.statusCode = customerCreationResponse.statusCode
        result.customerCreation.response = customerCreationResponse 

        const customerAlreadyExistConflict = customerCreationResponse.statusCode === 409
                                        && customerCreationResponse.body &&
                                        customerCreationResponse.body === `The customer already exist. CustomerCode='${customerCreationPayload.organizationId}'`
        if(customerCreationResponse.status !== 'success' && !customerAlreadyExistConflict){
            return result
        }

        if(customerAlreadyExistConflict){
            result.customerCreation.status = 'skipped'
        }
    }

    // Create account
    const accountCreationResponse = await createAccount(accountCreationPayload)
    result.accountCreation.status = accountCreationResponse.status
    result.accountCreation.statusCode = accountCreationResponse.statusCode
    result.accountCreation.response = accountCreationResponse

    const accountAlreadyExistConflict = accountCreationResponse.statusCode === 409 
                                    && accountCreationResponse.body && 
                                    accountCreationResponse.body === `An account with accountCode '${accountCreationPayload.accountCode}' already exist.`

    if(accountCreationResponse.status !== 'success' && !accountAlreadyExistConflict){
        return result
    }

    if(accountAlreadyExistConflict){
        result.accountCreation.status = 'skipped'
    }

    // Create portfolio
    const portfolioCreationResponse = await createPortfolio(portfolioCreationPayload)
    result.portfolioCreation.status = portfolioCreationResponse.status
    result.portfolioCreation.statusCode = portfolioCreationResponse.statusCode
    result.portfolioCreation.response = portfolioCreationResponse

    const portfolioAlreadyExistConflict = portfolioCreationResponse.statusCode === 409
                                        && portfolioCreationResponse.body &&
                                        portfolioCreationResponse.body === `A portfolio with portfolioCode '${portfolioCreationPayload.portfolioCode}' already exist.`
    
    if(portfolioAlreadyExistConflict){
        result.portfolioCreation.status = 'skipped'
    }

    return result
}