import { UUID } from "mongodb";
import { custom, z, ZodError } from "zod";
import { v4 as uuidv4 } from 'uuid';
import { SequentialCustomerAccountPortfolioCreatioResult } from "@/services/cairoService";
import { CairoCustomer } from "@/lib/cairo.type";


export interface BaseNewPortfolioResponse {
    status: 'failed' | 'partial failure' | 'success' | 'warning' | 'error';
    requestType: 'Create Portfolio';
    requestBody: CustomerAccountPortfolioCreationPayload;
    messages: string;
}

export type NewPortfolioResponse =
    | (BaseNewPortfolioResponse & {
          dataType: 'SequentialCustomerAccountPortfolioCreatioResult';
          data: SequentialCustomerAccountPortfolioCreatioResult;
      })
    | (BaseNewPortfolioResponse & {
          dataType: 'CairoCustomer';
          data: CairoCustomer;
      })
    | (BaseNewPortfolioResponse & {
        dataType: 'Error';
        data: Error;
    })
    | (BaseNewPortfolioResponse & {
        dataType: 'ZodError';
        data: ZodError;
    });

export const customerAccountPortfolioCreationPayloadSchema = z.object({
    firstname: z.string({
        required_error: "First name is required",
    }).min(1, { message: "First name cannot be empty" }),

    surname: z.string({
        required_error: "Surname is required",
    }).min(1, { message: "Surname cannot be empty" }),

    personalNumber: z.string({
        required_error: "Personal number is required",
    }).min(1, { message: "Personal number cannot be empty" }),

    portfolioTypeCode: z.string({
        required_error: "Portfolio type code is required",
    }).min(1, { message: "Portfolio type code cannot be empty" }),

    modelPortfolioCode: z.string().optional(),

    address: z.string({
        required_error: "Address is required",
    }).min(1, { message: "Address cannot be empty" }),

    address2: z.string().optional(),

    postalCode: z.string({
        required_error: "Postal code is required",
    }).min(1, { message: "Postal code cannot be empty" }),

    city: z.string({
        required_error: "City is required",
    }).min(1, { message: "City cannot be empty" }),

    mobile: z.string({
        required_error: "Mobile number is required",
    }).min(1, { message: "Mobile number cannot be empty" }),

    emailAddress: z.string({
        required_error: "Email address is required",
    }).email({ message: "Invalid email address format" }),
});


export function payloadToRequestBodies(payload: CustomerAccountPortfolioCreationPayload){
    const customerCode = uuidv4();
    const accountCode = uuidv4(); 
    const portfolioCode = uuidv4();
    return {
        customer: {
            customerCode: customerCode,
            firstName: payload.firstname,
            surName: payload.surname,
            customerTypeCode: 'PRIVATE',
            regionCode: 'SE',
            languageCode: 'SV',
            organizationId: payload.personalNumber,
            managerCode: 'daniel.johansson',
            customerContacts: [
                {
                    customerCode: customerCode,
                    contactFirstName: payload.firstname,
                    contactSurName: payload.surname,
                    address: payload.address,
                    address2: payload.address2,
                    postalCode: payload.postalCode,
                    city: payload.city,
                    mobile: payload.mobile,
                    emailAddress: payload.emailAddress,
                }
            ]
        },
        account: {
            accountCode: accountCode,
            accountDescription: 'Test account',
            accountTypeCode: 'ASSETSCASH',
            customerCode: customerCode,
            currencyCode: 'SEK',
            custodianCode: 'PEAK',
        },
        portfolio: {
            portfolioCode: portfolioCode,
            portfolioDescription: 'Test portfolio',
            portfolioTypeCode: payload.portfolioTypeCode,
            customerCode: customerCode,
            currencyCode: 'SEK',
            accountCode: accountCode,
            managerCode: 'daniel.johansson',
            bookValueMethodCode: 'ROOTAVERAGE',
            scenarioCode: 'LAST',
            modelPortfolioCode: payload.modelPortfolioCode,
        }
    }
}

export type CustomerAccountPortfolioCreationPayload = z.infer<typeof customerAccountPortfolioCreationPayloadSchema>;