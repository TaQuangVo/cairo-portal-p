import { cairoAuthHeader } from "@/utils/cairoAuthUtils";
import { CairoAccountCreationPayload, CairoAccountCreationResponse, CairoCustomer, CairoCustomerCreationPayload, CairoCustomerCreationResponse, CairoPortfolioCreationPayload, CairoPortfolioCreationResponse, CairoResponseCollection, CairoHttpResponse, CairoAccount, CairoCustomerContact, CairoSubscription, CairoSubscriptionCreationPayload, CairoSubscriptionCreationResponse, CairoPortalUser, CairoExternalBankAccount, CairoExternalBankAccountCreationPayload, CairoExternalBankAccountCreationResponse, CairoMandateCreationPayload, CairoMandate, CairoInstructionCreationPayload, CairoInstructionCreationResponse } from "./cairo.type";



async function makeRequest<T>(
  url: string,
  options?: RequestInit,
): Promise<CairoHttpResponse<T>> {
  const start = performance.now(); // Start timer
  try {
    const baseUrl = process.env.CAIRO_URL;
    const fullUrl = baseUrl + url;

    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: cairoAuthHeader,
        ...(options?.headers || {}),
      },
    });

    const responseBody = await response.text(); // Always get response as text
    const contentType = response.headers.get("Content-Type") || "";
    const duration = performance.now() - start; // End timer
    console.log(`[Request Timer] [${options?.method ? options.method : 'GET'}] ${fullUrl} - ${duration.toFixed(2)} ms`);

    let parsedData: T | undefined;

    if (contentType.includes("application/json")) {
      try {
        parsedData = JSON.parse(responseBody) as T;
      } catch {
        parsedData = undefined; // Keep undefined if JSON parsing fails
      }
    }

    const status = response.ok ? "success" : response.status === 409 ? "conflict" : "error";

    return {
      status: status,
      statusCode: response.status,
      requestTime: duration,
      body: responseBody, // Always store raw response
      data: parsedData, // Store parsed JSON (if applicable)
    };
  } catch (error) {
    const duration = performance.now() - start; // End timer
    //console.error("Error fetching data:", error);

    if (error instanceof DOMException && error.name === 'AbortError') {
      console.log('Fetch aborted');
      return {
        status: "aborted",
        statusCode: undefined,
        requestTime: duration,
        body: 'Request aborted',
        data: undefined,
      };
    }

    return {
      status: "error",
      statusCode: undefined,
      requestTime: duration,
      body: 'Failed to exercute fetch: ' + String(error),
      data: undefined,
    };
  }
}

export async function fetchAccountByCustomerCode(customerCode: string, signal: AbortSignal) {
  return makeRequest<CairoResponseCollection<CairoAccount>>(`/accounts/?customerCode=${customerCode}`, { signal });
}

export async function fetchCustomerContactsByCustomerCode(customerCode: string, signal: AbortSignal) {
  return makeRequest<CairoResponseCollection<CairoCustomerContact>>(`/customerContacts/?customerCode=${customerCode}`, { signal });
}
 
export async function fetchCustomerByPersonalNumber(personalNumber: string, signal: AbortSignal, withAccount:boolean = false, withPortfolio:boolean = false, withContacts:boolean = false,) {
  //`/customers/?organizationId=${personalNumber}&_no_cache=true&_fields=+accounts,+portfolios,+customerContacts`
  let url = `/customers/?organizationId=${personalNumber}&_no_cache=true`
  if(withAccount || withPortfolio || withContacts){
    url += '&_fields='
    if(withAccount){
      url += '+accounts,'
    }
    if(withPortfolio){
      url += '+portfolios,'
    }
    if(withContacts){
      url += '+customerContacts,'
    }
    url = url.slice(0, -1) // remove last comma
  }

  const customer = await makeRequest<CairoResponseCollection<CairoCustomer>>(url, { signal });
  return customer
}

export async function createCustomer(customerCreationPayload: CairoCustomerCreationPayload, signal: AbortSignal) {
  return makeRequest<CairoCustomerCreationResponse>(`/customers`,
    {
      method: "POST",
      body: JSON.stringify(customerCreationPayload),
      signal,
    }
  );
}

export async function setupPortalPermission(customerCode: string, signal: AbortSignal) {
  return makeRequest<CairoPortalUser>(`/portalusers`,
    {
      method: "POST",
      body: JSON.stringify({customerCode: customerCode}),
      signal
    }
  );
}

export async function createAccount(accountCreationPayload: CairoAccountCreationPayload, signal: AbortSignal) {
  return makeRequest<CairoAccountCreationResponse>(`/accounts`,
    {
      method: "POST",
      body: JSON.stringify(accountCreationPayload),
      signal
    }
  );
}

export async function fetchSubscriptionByPortfolioCode(portfolioCode: string, signal: AbortSignal) {
  const subscriptions = await makeRequest<CairoResponseCollection<CairoSubscription>>(`/subscriptions/?portfolioCode=${portfolioCode}`, { signal });
  return subscriptions
}

export async function createSubscription(subscriptionCreationPayload: CairoSubscriptionCreationPayload, signal: AbortSignal) {
  const result =  await makeRequest<CairoSubscriptionCreationResponse>(`/subscriptions`,
    {
      method: "POST",
      body: JSON.stringify(subscriptionCreationPayload),
      signal
    }
  );

    // since cairo return the whole portfolio when create a portfolio and we only interested in the id fields. try to only parse the id
    if(result.status == 'success' && result.data){
      try{
        const responseSimplified = {
          subscriptionId: result.data.subscriptionId,
        }
        result.data = responseSimplified
        result.body = JSON.stringify(responseSimplified)
      } catch(e){
        return result
      }
    }

    return result
}

export async function createPortfolio(portfolioCreationPayload: CairoPortfolioCreationPayload, signal: AbortSignal) {
  const result = await makeRequest<CairoPortfolioCreationResponse>(`/portfolios`,
    {
      method: "POST",
      body: JSON.stringify(portfolioCreationPayload),
      signal
    }
  );

  // since cairo return the whole portfolio when create a portfolio and we only interested in the id fields. try to only parse the id
  if(result.status == 'success' && result.data){
    try{
      const responseSimplified = {
        portfolioCode: result.data.portfolioCode,
        portfolioDescription: result.data.portfolioDescription
      }
      result.data = responseSimplified
      result.body = JSON.stringify(responseSimplified)
    } catch(e){
      return result
    }
  }

  return result
}

export async function fetchExternalBankAccountByCustomerCode(customerCode: string, signal: AbortSignal) {
  return makeRequest<CairoResponseCollection<CairoExternalBankAccount>>(`/payment/externalbankaccounts/?customerCode=${customerCode}`, { signal });
}

export async function fetchExternalBankAccountByDetails(customerCode: string, accountNumber: string, clearingnumber: string, signal: AbortSignal) {
  return makeRequest<CairoResponseCollection<CairoExternalBankAccount>>(`/payment/externalbankaccounts/?customerCode=${customerCode}&accountNumber=${accountNumber}&clearingNumber=${clearingnumber}&_fields=+mandates`, { signal });
}

export async function createExternalBankAccount(externalBankAccountPayload: CairoExternalBankAccountCreationPayload, signal: AbortSignal) {
  return makeRequest<CairoExternalBankAccountCreationResponse>(`/payment/externalbankaccounts`,
    {
      method: "POST",
      body: JSON.stringify(externalBankAccountPayload),
      signal
    }
  );
}

export async function createMandate(mandatePayload: CairoMandateCreationPayload, signal: AbortSignal) {
  return makeRequest<null>(`/payment/mandates`,
    {
      method: "POST",
      body: JSON.stringify(mandatePayload),
      signal
    }
  );
}

export async function fetchMandateByExternalBankAccountCode(externalBankAccountCode: string, signal: AbortSignal) {
  return makeRequest<CairoResponseCollection<CairoMandate>>(`/payment/mandates/?externalBankAccountCode=${externalBankAccountCode}`, { signal });
}

export async function createPaymentInstruction(instructionPayload: CairoInstructionCreationPayload, signal: AbortSignal) {
  return makeRequest<CairoInstructionCreationResponse>(`/payment/instructions`,
    {
      method: "POST",
      body: JSON.stringify(instructionPayload),
      signal
    }
  );
}