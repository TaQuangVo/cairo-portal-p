import { createAccount, createCustomer, createPortfolio, createSubscription, fetchCustomerByPersonalNumber, fetchSubscriptionByPortfolioCode, setupPortalPermission } from "@/lib/cairo"
import { CairoAccountCreationPayload, CairoCustomerCreationPayload, CairoCustomerCreationResponse, CairoAccountCreationResponse, CairoPortfolioCreationPayload, CairoHttpResponse, CairoPortfolioCreationResponse, CairoCustomer, CairoResponseCollection, CairoSubscriptionCreationPayload, CairoSubscriptionCreationResponse, CairoPortalUser } from "@/lib/cairo.type"

export type CairoExercutionResult<P ,T> = {
    status: 'not exercuted' | 'success' | 'error' | 'failed' | 'skipped',
    statusCode?: number,
    response?: CairoHttpResponse<T>,
    skippedOn?: any,
    payload: P 
}

export type SequentialCustomerAccountPortfolioCreatioResult = {
    customerCreation: CairoExercutionResult<CairoCustomerCreationPayload, CairoCustomerCreationResponse>,
    portalUserRegistration: CairoExercutionResult<string, CairoPortalUser>,
    accountCreation: CairoExercutionResult<CairoAccountCreationPayload, CairoAccountCreationResponse>,
    portfolioCreation: CairoExercutionResult<CairoPortfolioCreationPayload, CairoPortfolioCreationResponse>,
    subscriptionCreation: CairoExercutionResult<CairoSubscriptionCreationPayload, CairoSubscriptionCreationResponse>[],
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

export async function createSubscriptions(subscriptionCreationPayloads: CairoSubscriptionCreationPayload[], revalidateExisting:boolean): Promise<CairoExercutionResult<CairoSubscriptionCreationPayload, CairoSubscriptionCreationResponse>[]>{
    if(!subscriptionCreationPayloads || subscriptionCreationPayloads.length == 0){
        console.log('Subscription creation payload not found')
        return []
        //throw new Error('Subscription creation payload not found')
    }

    const allSamePortfolioCode = subscriptionCreationPayloads.every(
        (item) => item.portfolioCode === subscriptionCreationPayloads[0].portfolioCode
    );
    if (!allSamePortfolioCode) {
        console.log('All subscription payloads must have the same portfolioCode.')
        return []
        //throw new Error("All subscription payloads must have the same portfolioCode.");
    }

    // if revalidate existing, get the subscription from cairo and map it.
    let existingSubscriptions:CairoSubscriptionCreationPayload[] = []
    if(revalidateExisting){
        const fetchResponse = await fetchSubscriptionByPortfolioCode(subscriptionCreationPayloads[0].portfolioCode)
        if(fetchResponse.status == 'success'){
            existingSubscriptions = fetchResponse.data?.results ?? []
        }
    }
    const existingSubscriptionMaps = new Map(existingSubscriptions.map(sub => [sub.subscriptionCode, sub]));

    // prepare the result array. which one to skipp which one to exercute
    let results: CairoExercutionResult<CairoSubscriptionCreationPayload, CairoSubscriptionCreationResponse>[]= []
    for(let payload of subscriptionCreationPayloads){
        if (existingSubscriptionMaps.has(payload.subscriptionCode)) {
            results.push({
                    status: 'skipped',
                    statusCode: undefined,
                    response: undefined,
                    skippedOn: existingSubscriptionMaps.get(payload.subscriptionCode),
                    payload: payload 
            })
            continue;
        }
        results.push({
                status: 'not exercuted',
                statusCode: undefined,
                response: undefined,
                payload: payload 
        })
    }

    // make request to the not exercuted ones
    await Promise.all(
        results.map(async (result) => {
          if (result.status === 'not exercuted') {
            const response = await createSubscription(result.payload);
            result.status = response.status;
            result.statusCode = response.statusCode;
            result.response = response;
          }
        })
    );

    return results;
}

export async function createCustomerAccountPortfolio(customerCreationPayload: CairoCustomerCreationPayload, accountCreationPayload: CairoAccountCreationPayload, portfolioCreationPayload: CairoPortfolioCreationPayload, subscriptionCreationPayloads:CairoSubscriptionCreationPayload[], muteWarning:createCustomerAccountPortfolioWarning[]): Promise<SequentialCustomerAccountPortfolioCreatioResult>{
    let skipCustomerCreation = false

    let result: SequentialCustomerAccountPortfolioCreatioResult = {
        customerCreation: {
            status: 'not exercuted',
            statusCode: undefined,
            response: undefined,
            payload: customerCreationPayload
        },
        portalUserRegistration: {
            status: 'not exercuted',
            statusCode: undefined,
            response: undefined,
            payload: customerCreationPayload.organizationId
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
        },
        subscriptionCreation: subscriptionCreationPayloads.map(sub => ({
            status: 'not exercuted',
            statusCode: undefined,
            response: undefined,
            payload: sub 
        }))
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
        result.accountCreation.payload.customerCode = existingCustomerCode
        portfolioCreationPayload.customerCode = existingCustomerCode
        result.portfolioCreation.payload.customerCode = existingCustomerCode
        result.portalUserRegistration.payload = existingCustomerCode
        result.customerCreation.status = 'skipped'
        result.customerCreation.skippedOn = getCustomerResult.response!.data!.results[0]
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
            result.customerCreation.skippedOn = customerCreationResponse
        }
    }

    const portalRegistrationRes = await setupPortalPermission(accountCreationPayload.customerCode)
    result.portalUserRegistration.status = portalRegistrationRes.status
    result.portalUserRegistration.response = portalRegistrationRes
    result.portalUserRegistration.statusCode = portalRegistrationRes.statusCode
    if(portalRegistrationRes.statusCode === 409){
        result.portalUserRegistration.status = 'skipped'
        result.portalUserRegistration.skippedOn = portalRegistrationRes 
    }

    // Create account
    const accountCreationResponse = await createAccount(accountCreationPayload)
    result.accountCreation.status = accountCreationResponse.status
    result.accountCreation.payload = accountCreationPayload
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
        result.accountCreation.skippedOn = accountCreationResponse
    }

    // Create portfolio
    const portfolioCreationResponse = await createPortfolio(portfolioCreationPayload)
    result.portfolioCreation.status = portfolioCreationResponse.status
    result.portfolioCreation.payload = portfolioCreationPayload
    result.portfolioCreation.statusCode = portfolioCreationResponse.statusCode
    result.portfolioCreation.response = portfolioCreationResponse

    const portfolioAlreadyExistConflict = portfolioCreationResponse.statusCode === 409
                                        && portfolioCreationResponse.body &&
                                        portfolioCreationResponse.body === `A portfolio with portfolioCode '${portfolioCreationPayload.portfolioCode}' already exist.`
    
    if(portfolioAlreadyExistConflict){
        result.portfolioCreation.status = 'skipped'
        result.portfolioCreation.skippedOn = portfolioCreationResponse
    }

    const shouldRevalidateExisting = result.portfolioCreation.status === 'skipped'
    const submittionCreationResponse = await createSubscriptions(subscriptionCreationPayloads, shouldRevalidateExisting)
    result.subscriptionCreation = submittionCreationResponse

    return result
}