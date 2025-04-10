import { cairoAuthHeader } from "@/utils/cairoAuthUtils";
import { CairoAccountCreationPayload, CairoAccountCreationResponse, CairoCustomer, CairoCustomerCreationPayload, CairoCustomerCreationResponse, CairoPortfolioCreationPayload, CairoPortfolioCreationResponse, CairoResponseCollection, CairoHttpResponse, CairoAccount, CairoCustomerContact, CairoSubscription, CairoSubscriptionCreationPayload, CairoSubscriptionCreationResponse, CairoPortalUser } from "./cairo.type";



async function makeRequest<T>(
  url: string,
  options?: RequestInit
): Promise<CairoHttpResponse<T>> {
  try {
    const baseUrl = process.env.CAIRO_URL;
    const fullUrl = baseUrl + url;

    const request = fetch(fullUrl, {
      ...options,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: cairoAuthHeader,
        ...(options?.headers || {}),
      },
    });

    const start = performance.now(); // Start timer
    const response = await request;

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

    return {
      status: response.ok ? "success" : "failed",
      statusCode: response.status,
      requestTime: duration,
      body: responseBody, // Always store raw response
      data: parsedData, // Store parsed JSON (if applicable)
    };
  } catch (error) {
    console.error("Error fetching data:", error);

    return {
      status: "error",
      statusCode: undefined,
      requestTime: undefined,
      body: 'Failed to exercute fetch: ' + String(error), // Ensure error message is included
      data: undefined,
    };
  }
}

export async function fetchAccountByCustomerCode(customerCode: string) {
  return makeRequest<CairoResponseCollection<CairoAccount>>(`/accounts/?customerCode=${customerCode}`);
}

export async function fetchCustomerContactsByCustomerCode(customerCode: string) {
  return makeRequest<CairoResponseCollection<CairoCustomerContact>>(`/customerContacts/?customerCode=${customerCode}`);
}
 
export async function fetchCustomerByPersonalNumber(personalNumber: string, withAccount:boolean = false, withPortfolio:boolean = false, withContacts:boolean = false) {
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

  const customer = await makeRequest<CairoResponseCollection<CairoCustomer>>(url);
  return customer
}

export async function createCustomer(customerCreationPayload: CairoCustomerCreationPayload) {
  return makeRequest<CairoCustomerCreationResponse>(`/customers`,
    {
      method: "POST",
      body: JSON.stringify(customerCreationPayload),
    }
  );
}

export async function setupPortalPermission(customerCode: string) {
  return makeRequest<CairoPortalUser>(`/portalusers`,
    {
      method: "POST",
      body: JSON.stringify({customerCode: customerCode}),
    }
  );
}

export async function createAccount(accountCreationPayload: CairoAccountCreationPayload) {
  return makeRequest<CairoAccountCreationResponse>(`/accounts`,
    {
      method: "POST",
      body: JSON.stringify(accountCreationPayload),
    }
  );
}

export async function fetchSubscriptionByPortfolioCode(portfolioCode: string){
  const subscriptions = await makeRequest<CairoResponseCollection<CairoSubscription>>(`/subscriptions/?portfolioCode=${portfolioCode}`);
  return subscriptions
}

export async function createSubscription(subscriptionCreationPayload: CairoSubscriptionCreationPayload){
  const result =  await makeRequest<CairoSubscriptionCreationResponse>(`/subscriptions`,
    {
      method: "POST",
      body: JSON.stringify(subscriptionCreationPayload),
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

export async function createPortfolio(portfolioCreationPayload: CairoPortfolioCreationPayload) {
  const result = await makeRequest<CairoPortfolioCreationResponse>(`/portfolios`,
    {
      method: "POST",
      body: JSON.stringify(portfolioCreationPayload),
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