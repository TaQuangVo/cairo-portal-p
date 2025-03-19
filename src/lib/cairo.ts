import { cairoAuthHeader } from "@/utils/cairoAuthUtils";
import { Customer, ResponseCollection } from "./cairoType";

async function makeRequest<T>(
    url: string,
    options?: RequestInit
  ): Promise<T> {
    try {
        const baseUrl = process.env.CAIRO_URL
        console.log(cairoAuthHeader)
      const request = fetch(baseUrl+url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          'Authorization': cairoAuthHeader,
          ...(options?.headers || {}),
        },
      });
      const response = await request
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      return response.json() as Promise<T>;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
}
  
export async function getCustomerBySSN(ssn: string) {
    return makeRequest<ResponseCollection<Customer>>(`/customers/?organizationId=${ssn}`);
}