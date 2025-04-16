import { createAccount, createCustomer, createExternalBankAccount, createMandate, createPaymentInstruction, createPortfolio, createSubscription, fetchCustomerByPersonalNumber, fetchExternalBankAccountByCustomerCode, fetchExternalBankAccountByDetails, fetchMandateByExternalBankAccountCode, fetchSubscriptionByPortfolioCode, setupPortalPermission } from "@/lib/cairo"
import { CairoAccountCreationPayload, CairoCustomerCreationPayload, CairoCustomerCreationResponse, CairoAccountCreationResponse, CairoPortfolioCreationPayload, CairoHttpResponse, CairoPortfolioCreationResponse, CairoCustomer, CairoResponseCollection, CairoSubscriptionCreationPayload, CairoSubscriptionCreationResponse, CairoPortalUser, CairoExternalBankAccountCreationPayload, CairoMandateCreationPayload, CairoInstructionCreationPayload, CairoExternalBankAccount, CairoMandate, CairoExternalBankAccountCreationResponse, CairoInstructionCreationResponse } from "@/lib/cairo.type"

export type CairoExercutionResult<P ,T> = {
    status: 'not exercuted' | 'success' | 'error' | 'conflict' | 'failed' | 'skipped' | 'aborted',
    statusCode?: number,
    response?: CairoHttpResponse<T>,
    skippedOn?: any,
    payload: P 
}

export type SequentialCustomerAccountPortfolioCreationResult = {
    customerCreation: CairoExercutionResult<CairoCustomerCreationPayload, CairoCustomerCreationResponse>,
    portalUserRegistration?: CairoExercutionResult<string, CairoPortalUser>,
    accountCreation: CairoExercutionResult<CairoAccountCreationPayload, CairoAccountCreationResponse>,
    portfolioCreation: CairoExercutionResult<CairoPortfolioCreationPayload, CairoPortfolioCreationResponse>,
    subscriptionCreation: CairoExercutionResult<CairoSubscriptionCreationPayload, CairoSubscriptionCreationResponse>[],
    bankAccountCreation?: CairoExercutionResult<CairoExternalBankAccountCreationPayload, CairoExternalBankAccountCreationResponse>,
    mandateCreation?: CairoExercutionResult<CairoMandateCreationPayload, null>,
    instructionCreation?: CairoExercutionResult<CairoInstructionCreationPayload, CairoInstructionCreationResponse>[],
}

export async function getCustomerByPersonalNumber(personalNumber: string, signal: AbortSignal): Promise<CairoExercutionResult<String, CairoResponseCollection<CairoCustomer>>> {
    const result = await fetchCustomerByPersonalNumber(personalNumber, signal)
    return {
        status: result.status,
        statusCode: result.statusCode,
        response: result,
        payload: personalNumber
    }
}


function initSequentialCustomerAccountPortfolioCreationResult(customerCreationPayload: CairoCustomerCreationPayload, 
    accountCreationPayload: CairoAccountCreationPayload, 
    portfolioCreationPayload: CairoPortfolioCreationPayload, 
    subscriptionCreationPayloads:CairoSubscriptionCreationPayload[], 
    bankAccounCreationPayload: CairoExternalBankAccountCreationPayload | null,  
    mandateCreationPayload:CairoMandateCreationPayload | null, 
    instructionCreationPayload:CairoInstructionCreationPayload[] | null
): SequentialCustomerAccountPortfolioCreationResult{
    let result: SequentialCustomerAccountPortfolioCreationResult = {
        customerCreation: {
            status: 'not exercuted',
            statusCode: undefined,
            response: undefined,
            skippedOn: undefined,
            payload: customerCreationPayload
        },
        portalUserRegistration: customerCreationPayload.customerTypeCode === 'PRIVATE' ? {
            status: 'not exercuted',
            statusCode: undefined,
            response: undefined,
            skippedOn: undefined,
            payload: customerCreationPayload.organizationId
        } : undefined,
        accountCreation: {
            status: 'not exercuted',
            statusCode: undefined,
            response: undefined,
            skippedOn: undefined,
            payload: accountCreationPayload
        },
        portfolioCreation: {
            status: 'not exercuted',
            statusCode: undefined,
            response: undefined,
            skippedOn: undefined,
            payload: portfolioCreationPayload
        },
        subscriptionCreation: subscriptionCreationPayloads.map(sub => ({
            status: 'not exercuted',
            statusCode: undefined,
            response: undefined,
            skippedOn: undefined,
            payload: sub 
        })),
        bankAccountCreation: bankAccounCreationPayload ? {
            status: 'not exercuted',
            statusCode: undefined,
            response: undefined,
            skippedOn: undefined,
            payload: bankAccounCreationPayload
        } : undefined,
        mandateCreation: mandateCreationPayload ? {
            status: 'not exercuted',
            statusCode: undefined,
            response: undefined,
            skippedOn: undefined,
            payload: mandateCreationPayload
        } : undefined,
        instructionCreation: instructionCreationPayload ? instructionCreationPayload.map(e => ({
            status: 'not exercuted',
            statusCode: undefined,
            response: undefined,
            skippedOn: undefined,
            payload: e
        })) : undefined
    }
    return result
}

async function createCustomerStep(context: SequentialCustomerAccountPortfolioCreationResult, signal: AbortSignal): Promise<SequentialCustomerAccountPortfolioCreationResult> {
    const customerCreationContext = context.customerCreation
    const customerCreationPayload = customerCreationContext.payload

    const getCustomerResult = await getCustomerByPersonalNumber(customerCreationPayload.organizationId, signal)
    if(getCustomerResult.status === 'aborted'){
        context.customerCreation.status = 'aborted'
        return context
    }

    let customerExist = getCustomerResult.status === 'success' && getCustomerResult.response?.data?.results?.[0]

    if(customerExist){
        let existingCustomerCode = getCustomerResult!.response!.data!.results[0].customerCode

        context.accountCreation.payload.customerCode = existingCustomerCode
        context.portfolioCreation.payload.customerCode = existingCustomerCode
        if(context.portalUserRegistration){
            context.portalUserRegistration.payload = existingCustomerCode
        }
        if(context.bankAccountCreation){
            context.bankAccountCreation.payload.customerCode = existingCustomerCode
        }

        context.customerCreation.status = 'skipped'
        context.customerCreation.skippedOn = getCustomerResult.response!.data!.results[0]

        return context
    }

    if(getCustomerResult.statusCode !== 404){
        context.customerCreation.status = 'error'
        return context
    }


    const customerCreationResponse = await createCustomer(customerCreationPayload, signal)

    context.customerCreation.status = customerCreationResponse.status
    context.customerCreation.statusCode = customerCreationResponse.statusCode
    context.customerCreation.response = customerCreationResponse 

    if(customerCreationResponse.status !== 'success' && customerCreationResponse.status !== 'conflict'){
        return context
    }

    if(customerCreationResponse.status !== 'conflict'){
        context.customerCreation.status = 'skipped'
        context.customerCreation.skippedOn = customerCreationResponse
    }

    return context
}

async function createPortalUserStep (context: SequentialCustomerAccountPortfolioCreationResult, signal: AbortSignal): Promise<SequentialCustomerAccountPortfolioCreationResult>{
    if(!context.portalUserRegistration){
        return context
    }

    const portalRegistrationRes = await setupPortalPermission(context.portalUserRegistration.payload, signal)

    context.portalUserRegistration.status = portalRegistrationRes.status
    context.portalUserRegistration.response = portalRegistrationRes
    context.portalUserRegistration.statusCode = portalRegistrationRes.statusCode

    if(portalRegistrationRes.status === 'conflict'){
        context.portalUserRegistration.status = 'skipped'
        context.portalUserRegistration.skippedOn = portalRegistrationRes 
    }

    return context
}

async function createAccountStep (context: SequentialCustomerAccountPortfolioCreationResult, signal: AbortSignal): Promise<SequentialCustomerAccountPortfolioCreationResult>{

    const accountCreationResponse = await createAccount(context.accountCreation.payload, signal)
    context.accountCreation.status = accountCreationResponse.status
    context.accountCreation.statusCode = accountCreationResponse.statusCode
    context.accountCreation.response = accountCreationResponse

    if(accountCreationResponse.status !== 'success' && accountCreationResponse.status !== 'conflict'){
        return context
    }

    if(accountCreationResponse.status === 'conflict'){
        context.accountCreation.status = 'skipped'
        context.accountCreation.skippedOn = accountCreationResponse
    }
    
    return context
}

async function createPortfolioStep(context: SequentialCustomerAccountPortfolioCreationResult, signal: AbortSignal): Promise<SequentialCustomerAccountPortfolioCreationResult> {
    const portfolioCreationResponse = await createPortfolio(context.portfolioCreation.payload, signal)
    context.portfolioCreation.status = portfolioCreationResponse.status
    context.portfolioCreation.statusCode = portfolioCreationResponse.statusCode
    context.portfolioCreation.response = portfolioCreationResponse

    if(portfolioCreationResponse.status !== 'success' && portfolioCreationResponse.status !== 'conflict'){
        return context
    }

    if(portfolioCreationResponse.status === 'conflict'){
        context.portfolioCreation.status = 'skipped'
        context.portfolioCreation.skippedOn = portfolioCreationResponse
    }

    return context
}


export async function createSubscriptions(context: SequentialCustomerAccountPortfolioCreationResult, signal: AbortSignal): Promise<SequentialCustomerAccountPortfolioCreationResult>{

    // if revalidate existing, get the subscription from cairo and map it.
    let existingSubscriptions:CairoSubscriptionCreationPayload[] = []
    const fetchResponse = await fetchSubscriptionByPortfolioCode(context.subscriptionCreation[0].payload.portfolioCode, signal)
    if(fetchResponse.status === 'success'){
        existingSubscriptions = fetchResponse.data?.results ?? []
    }

    const existingSubscriptionMaps = new Map(existingSubscriptions.map(sub => [sub.subscriptionCode, sub]));

    // prepare the result array. which one to skipp which one to exercute
    let results: CairoExercutionResult<CairoSubscriptionCreationPayload, CairoSubscriptionCreationResponse>[]= []
    for(let subscriptionContext of context.subscriptionCreation){
        if (existingSubscriptionMaps.has(subscriptionContext.payload.subscriptionCode)) {
            results.push({
                    status: 'skipped',
                    statusCode: undefined,
                    response: undefined,
                    skippedOn: existingSubscriptionMaps.get(subscriptionContext.payload.subscriptionCode),
                    payload: subscriptionContext.payload 
            })
            continue;
        }
        results.push({
                status: 'not exercuted',
                statusCode: undefined,
                response: undefined,
                payload: subscriptionContext.payload 
        })
    }

    // make request to the not exercuted ones
    await Promise.all(
        results.map(async (result) => {
          if (result.status === 'not exercuted') {
            const response = await createSubscription(result.payload, signal);
            result.status = response.status;
            result.statusCode = response.statusCode;
            result.response = response;
          }
        })
    );

    context.subscriptionCreation = results

    return context;
}

async function createBankAccountStep(context: SequentialCustomerAccountPortfolioCreationResult, signal: AbortSignal): Promise<SequentialCustomerAccountPortfolioCreationResult> {
    if(!context.bankAccountCreation){
        return context
    }

    const bankAccounCreationPayload = context.bankAccountCreation.payload
    const bankAccountCreationResponse = await createExternalBankAccount(bankAccounCreationPayload, signal)

    context.bankAccountCreation.status = bankAccountCreationResponse.status
    context.bankAccountCreation.statusCode = bankAccountCreationResponse.statusCode
    context.bankAccountCreation.response = bankAccountCreationResponse

    if(bankAccountCreationResponse.status !== 'success' && bankAccountCreationResponse.status !== 'conflict'){
        return context
    }

    if(bankAccountCreationResponse.status === 'conflict'){
        const existingBankacounts = await fetchExternalBankAccountByDetails(bankAccounCreationPayload.customerCode, bankAccounCreationPayload.accountNumber, bankAccounCreationPayload.clearingNumber, signal)
        if(existingBankacounts.status === 'aborted'){
            context.bankAccountCreation.status = 'aborted'
            return context
        }

        if(existingBankacounts.status !== 'success' || !existingBankacounts.data?.results?.[0]){
            context.bankAccountCreation.status = 'error'
            return context
        }

        context.bankAccountCreation.status = 'skipped'
        context.bankAccountCreation.skippedOn = existingBankacounts.data.results[0]

        if(context.mandateCreation){
            context.mandateCreation.payload.externalBankAccountCode = existingBankacounts.data.results[0].externalBankAccountCode
        }
    }

    return context
}

async function createMandateStep(context: SequentialCustomerAccountPortfolioCreationResult, signal: AbortSignal): Promise<SequentialCustomerAccountPortfolioCreationResult> {
    if(!context.mandateCreation){
        return context
    }

    const existingMandates = await fetchMandateByExternalBankAccountCode(context.mandateCreation.payload.externalBankAccountCode, signal)

    if(existingMandates.status === 'aborted'){
        context.mandateCreation.status = 'aborted'
        return context
    }

    if(existingMandates.status !== 'success' && existingMandates.statusCode !== 404){
        context.mandateCreation.status = 'error'
        return context
    }

    if(existingMandates.status === 'success' && existingMandates.data?.results?.[0]){
        const existingMandate = existingMandates.data.results.find(m => m.mandateStatusCode === 'ACTIVATED' || m.mandateStatusCode === 'CREATED')

        if(existingMandate){
            context.mandateCreation.status = 'skipped'
            context.mandateCreation.skippedOn = existingMandate

            if(context.instructionCreation){
                context.instructionCreation.forEach(e => e.payload.mandateCode = existingMandate!.mandateCode)
            }
            return context
        }
    }

    const mandateCreationResponse = await createMandate(context.mandateCreation.payload, signal)
    context.mandateCreation.status = mandateCreationResponse.status
    context.mandateCreation.statusCode = mandateCreationResponse.statusCode
    context.mandateCreation.response = mandateCreationResponse

    if(mandateCreationResponse.status !== 'success' && mandateCreationResponse.status !== 'conflict'){
        return context
    }

    if(mandateCreationResponse.status === 'conflict'){
        context.mandateCreation.status = 'skipped'
        context.mandateCreation.skippedOn = mandateCreationResponse
    }

    return context
}

async function createPaymentInstructionStep(context: SequentialCustomerAccountPortfolioCreationResult, signal: AbortSignal): Promise<SequentialCustomerAccountPortfolioCreationResult> {
    if(!context.instructionCreation){
        return context
    }

    await Promise.all(
        context.instructionCreation.map(async (e) => {
            const instructionCreation = await createPaymentInstruction(e.payload, signal)

            e.status = instructionCreation.status
            e.statusCode = instructionCreation.statusCode
            e.response = instructionCreation

            if(instructionCreation.status === 'conflict'){
                e.status = 'skipped'
                e.skippedOn = instructionCreation
            }
        })
    )

    return context
}


export async function creationSequence(customerCreationPayload: CairoCustomerCreationPayload, 
    accountCreationPayload: CairoAccountCreationPayload, 
    portfolioCreationPayload: CairoPortfolioCreationPayload, 
    subscriptionCreationPayloads:CairoSubscriptionCreationPayload[], 
    bankAccounCreationPayload: CairoExternalBankAccountCreationPayload | null,
    mandateCreationPayload:CairoMandateCreationPayload | null,
    instructionCreationPayload:CairoInstructionCreationPayload[] | null,
    signal: AbortSignal
): Promise<SequentialCustomerAccountPortfolioCreationResult> {

    let context: SequentialCustomerAccountPortfolioCreationResult = initSequentialCustomerAccountPortfolioCreationResult(customerCreationPayload, accountCreationPayload, portfolioCreationPayload, subscriptionCreationPayloads, bankAccounCreationPayload, mandateCreationPayload, instructionCreationPayload)

    await createCustomerStep(context, signal)
    if(context.customerCreation.status !== 'success' && context.customerCreation.status !== 'skipped'){
        return context
    }

    await createPortalUserStep(context, signal)
    if(context.portalUserRegistration && context.portalUserRegistration.status !== 'success' && context.portalUserRegistration.status !== 'skipped'){
        return context
    }

    await createAccountStep(context, signal)
    if(context.accountCreation.status !== 'success' && context.accountCreation.status !== 'skipped'){
        return context
    }

    await createPortfolioStep(context, signal)
    if(context.portfolioCreation.status !== 'success' && context.portfolioCreation.status !== 'skipped'){
        return context
    }

    await createSubscriptions(context, signal)
    if(context.subscriptionCreation.some(res => res.status !== 'success' && res.status !== 'skipped')){
        return context
    }

    await createBankAccountStep(context, signal)
    if(!context.bankAccountCreation || (context.bankAccountCreation.status !== 'success' && context.bankAccountCreation.status !== 'skipped')){
        return context
    }

    await createMandateStep(context, signal)
    if(!context.mandateCreation || (context.mandateCreation.status !== 'success' && context.mandateCreation.status !== 'skipped')){
        return context
    }

    await createPaymentInstructionStep(context, signal)
    if(!context.instructionCreation || (context.instructionCreation.some(e => e.status !== 'success' && e.status !== 'conflict'))){
        return context
    }
    return context
}