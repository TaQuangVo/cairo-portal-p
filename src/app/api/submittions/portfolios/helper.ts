import { z, ZodError } from "zod";
import { v4 as uuidv4 } from 'uuid';
import { SequentialCustomerAccountPortfolioCreatioResult } from "@/services/cairoService";
import { CairoAccountCreationPayload, CairoCustomer, CairoCustomerCreationPayload, CairoPortfolioCreationPayload } from "@/lib/cairo.type";
import { convertOrgNumber, convertPersonalNumber, getBirthdateFromPersonNumber } from "@/utils/stringUtils";
import { getCurrentPortfolioCount } from "@/lib/db";
import { definedPortfolioType } from "@/constant/portfolioType";
import { modelPortfolioMap } from "@/constant/modelPortfolio";


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
    isCompany: z.boolean(),
    firstname: z.string(),
    surname: z.string(),
    personalNumber: z.string().refine((value) => {
        return /^\d{10,12}$|^\d{8}-\d{4}|^\d{6}-\d{4}$/.test(value)
    },{message:"Social security number must contain only digits and possibly one dash(-)."}),
    address: z.string().min(5, "Address must be at least 5 characters."),
    address2: z.string().optional().nullable(),
    postalCode: z.string().min(4, "Postal code must be at least 4 characters."),
    city: z.string().min(2, "City must be at least 2 characters."),
    mobile: z.string().min(8, "Mobile number must be at least 8 characters.").or(z.literal("")).optional().nullable(),
    emailAddress: z.string().email("Invalid email format.").or(z.literal("")).optional().nullable(),
    portfolioTypeCode: z.string().refine((value) => {
        return definedPortfolioType.get(value) != undefined;
    }, { message: "Invalid portfolio code." }),
    modelPortfolioCode: z.string().refine((value) => {
        return modelPortfolioMap.get(value) != undefined;
    }, { message: "Invalid model portfolio code." }).or(z.literal('')).optional().nullable(),
}).superRefine((data, ctx) => {
    if (!data.isCompany) {
        if(!data.firstname || data.firstname.length < 2){
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["firstname"],
                message: "Firstname must be at least 2 characters."
            });
        }
        if(!data.surname || data.surname.length < 2){
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["surname"],
                message: "Surname must be at least 2 characters."
            });
        }

        try {
            convertPersonalNumber(data.personalNumber)
        } catch (error) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["personalNumber"],
                message: (error as Error).message
            });
        }
    }

    if (data.isCompany) {
        if(!data.surname || data.surname.length < 2){
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["surname"],
                message: "Company name must be at least 2 characters."
            });
        }

        try{
            convertOrgNumber(data.personalNumber)
        }catch(e){
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["personalNumber"],
                message: (e as Error).message
            });
        }

        if(definedPortfolioType.get(data.portfolioTypeCode)?.id === 'ISK'){
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["portfolioTypeCode"],
                message: "Company accounts cannot be Investeringssparkonto accounts."
            });
        }
    }
});


export async function payloadToRequestBodies(payload: CustomerAccountPortfolioCreationPayload){
    const customerCode = uuidv4();
    const accountCode = uuidv4(); 
    const portfolioCode = uuidv4();

    const formatedPersonalNumber = !payload.isCompany ? convertPersonalNumber(payload.personalNumber) : convertOrgNumber(payload.personalNumber)
    const dateOfBirth = !payload.isCompany ? getBirthdateFromPersonNumber(formatedPersonalNumber) : ''
    const today = new Date().toISOString().split('T')[0]
    const managerCode = 'daniel.johansson'

    let currentCounter:number|null = null
    try{
        currentCounter = await getCurrentPortfolioCount()
    }catch(error){
        throw new Error('Failed to get current portfolio count: ' + error)
    }

    const portType = payload.portfolioTypeCode
    const portfolioTypeData = definedPortfolioType.get(portType);
    const portfolioTypePrefix = portfolioTypeData?.prefix ?? 'U';
    const accountDescription = portfolioTypePrefix + currentCounter.toString()
    const portfolioDescription = portfolioTypePrefix + currentCounter.toString()
    const modelPortfolioCode = payload.modelPortfolioCode && modelPortfolioMap.get(payload.modelPortfolioCode)
    const portfolioTypeCode = portfolioTypeData ? portfolioTypeData.id : '';

    const customerPayload: CairoCustomerCreationPayload = {
        customerCode: customerCode,
        firstName: !payload.isCompany ? payload.firstname : '',
        surName: payload.surname,
        customerTypeCode: payload.isCompany ? 'COMPANY' : 'PRIVATE',
        dateOfBirth: dateOfBirth,
        regionCode: 'SE',
        languageCode: 'SV',
        startDate: today,
        citizenshipRegionCode: 'SE',
        organizationId: formatedPersonalNumber,
        managerCode: managerCode,
        customerContacts: [
            {
                customerCode: customerCode,
                contactFirstName: payload.firstname,
                contactSurName: payload.surname,
                address: payload.address,
                address2: payload.address2 ?? '',
                postalCode: payload.postalCode,
                city: payload.city,
                mobile: payload.mobile ?? '',
                emailAddress: payload.emailAddress ?? '',
            }
        ]
    }

    const accountPayload: CairoAccountCreationPayload = {
        accountCode: accountCode,
        accountDescription: accountDescription,
        accountTypeCode: 'ASSETSCASH',
        customerCode: customerCode,
        currencyCode: 'SEK',
        custodianCode: 'PEAK',
        startDate: today,
        omniAccountCodes: ["901901350081","PEAKPART","PEAKAMSEC"]
    }

    const portfolioPayload: CairoPortfolioCreationPayload = {
        portfolioCode: portfolioCode,
        portfolioDescription: portfolioDescription,
        portfolioTypeCode: portfolioTypeCode,
        customerCode: customerCode,
        currencyCode: 'SEK',
        accountCode: accountCode,
        managerCode: managerCode,
        bookValueMethodCode: 'AVERAGE',
        scenarioCode: 'LAST',
        modelPortfolioCode: modelPortfolioCode ?? '',
        performanceStartDate: today,
        startDate: today,
        performance: true,
        targetAccountCode: accountCode,
        discountTemplateCode: 'MFEX',
        mifidDistributionStrategyCode: payload.modelPortfolioCode && payload.modelPortfolioCode !== '' ? 'PORTFOLIOMANAGEMENT' : '',
        portfolioAuthorities: [
            {
                portfolioCode: portfolioCode,
                reportingInputCode: "TypeOfMandate",
                value: payload.modelPortfolioCode !== 'Diskmandat' ? '33' : '32'
            }
        ]
    }

    return {
        customer: customerPayload,
        account: accountPayload,
        portfolio: portfolioPayload
    }
}

export type CustomerAccountPortfolioCreationPayload = z.infer<typeof customerAccountPortfolioCreationPayloadSchema>;