import { z, ZodError } from "zod";
import { v4 as uuidv4 } from 'uuid';
import { CairoAccountCreationPayload, CairoCustomer, CairoCustomerCreationPayload, CairoExternalBankAccountCreationPayload, CairoInstructionCreationPayload, CairoMandateCreationPayload, CairoPortfolioCreationPayload, CairoSubscriptionCreationPayload } from "@/lib/cairo.type";
import { convertOrgNumber, convertPersonalNumber, getBirthdateFromPersonNumber } from "@/utils/stringUtils";
import { getCurrentPortfolioCount } from "@/lib/db";
import { definedPortfolioType } from "@/constant/portfolioType";
import { modelPortfolioMap } from "@/constant/modelPortfolio";
import { SequentialCustomerAccountPortfolioCreationResult } from "@/services/cairoServiceV2";
const {account : validateBankAccount} = require('se-bank-account')

export interface PortfolioCreationMessageBody {
        customer: CairoCustomerCreationPayload,
        account: CairoAccountCreationPayload,
        portfolio: CairoPortfolioCreationPayload,
        subscriptions: CairoSubscriptionCreationPayload[],
        bankAccount: CairoExternalBankAccountCreationPayload|null,
        mandate: CairoMandateCreationPayload | null,
        instruction: CairoInstructionCreationPayload[] | null,
        rawBody: any,
        context:{
            submitterId: string,
            submissionResultId: string,
        }
}

export interface BaseNewPortfolioResponse {
    status: 'pending' | 'failed' | 'partial failure' | 'success' | 'warning' | 'error';
    requestType: 'Create Portfolio';
    requestBody: CustomerAccountPortfolioCreationPayload;
    qMessageIs: string,
    messages: string;
}

export type NewPortfolioResponse =
    | (BaseNewPortfolioResponse & {
          dataType: 'SequentialCustomerAccountPortfolioCreatioResult';
          data: SequentialCustomerAccountPortfolioCreationResult;
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
    })
    | (BaseNewPortfolioResponse & {
        dataType: null;
        data: null;
});

const customerDetailsSchema = z.object({
    firstname: z.string().min(2, "Firstname must be at least 2 characters.").or(z.literal('')).optional().nullable(),
    surname: z.string().min(2, "Surname must be at least 2 characters."),
    personalNumber: z.string().refine((value) => {
        return /^\d{10,12}$|^\d{8}-\d{4}|^\d{6}-\d{4}$/.test(value)
    }, { message: "Social security number must contain only digits and possibly one dash(-)." }),
    address: z.string().min(5, "Address must be at least 5 characters."),
    address2: z.string().optional().nullable(),
    postalCode: z.string().min(4, "Postal code must be at least 4 characters."),
    city: z.string().min(2, "City must be at least 2 characters."),
    mobile: z.string().min(8, "Mobile number must be at least 8 characters.").or(z.literal("")).optional().nullable(),
    emailAddress: z.string().email("Invalid email format.").or(z.literal("")).optional().nullable(),
})

const accountDetailsSchema = z.object({
    portfolioTypeCode: z.string().refine((value) => {
        return definedPortfolioType.get(value) != undefined;
    }, { message: "Invalid portfolio code." }),
    feeSubscription: z.number({ message: 'Account fee is required' })
        .min(0.2, { message: "Subscription fee must be at least 0.2" })
        .max(2.0, { message: "Subscription fee must not exceed 2.0" }),
    modelPortfolioCode: z.string().refine((value) => {
        return modelPortfolioMap.get(value) != undefined;
    }, { message: "Invalid model portfolio code." }).or(z.literal('')).optional().nullable(),
})

const paymentDetailSchema = z.object({
    clearingNumber: z.string().min(4, "Clearing number must be at least 4 digits."),
    accountNumber: z.string().min(6, "Account number must be at least 6 digits."),
    deposit: z.array(z.object({
        amount: z.number({ message: 'Amount is required' })
            .min(20, { message: "Amount must be at least 20 SEK" }),
        isRecurring: z.boolean(),
    }))
})

export const customerAccountPortfolioCreationPayloadSchema = z.object({
    isCompany: z.boolean(),

    mainActor: customerDetailsSchema,
    representor: customerDetailsSchema.optional().nullable(),

    accountDetails: accountDetailsSchema,
    payment: paymentDetailSchema.optional().nullable(),

}).superRefine((data, ctx) => {
    if (!data.isCompany) {
        if(!data.mainActor.firstname || data.mainActor.firstname.length < 2){
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["mainActor.firstname"],
                message: 'Firstname must have atleast 2 charactors.'
            });
        }
        try {
            convertPersonalNumber(data.mainActor.personalNumber)
        } catch (error) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["mainActor.personalNumber"],
                message: (error as Error).message
            });
        }
    }
    if (data.isCompany) {
        try {
            convertOrgNumber(data.mainActor.personalNumber)
        } catch (e) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["mainActor.personalNumber"],
                message: (e as Error).message
            });
        }
    }
    if (data.isCompany && data.representor){
        try {
            convertPersonalNumber(data.representor.personalNumber)
        } catch (error) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["representor.personalNumber"],
                message: (error as Error).message
            });
        }
        if(!data.representor.firstname || data.representor.firstname.length < 2){
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["representor.firstname"],
                message: 'Firstname must have atleast 2 charactors.'
            });
        }
    }
    if (data.payment){
        const validatedBankAccount = validateBankAccount(data.payment.clearingNumber+'-'+data.payment.accountNumber)
        if(validatedBankAccount === false){
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["payment.accountNumber"],
                message: 'Invalid Swedish bankaccount number!.'
            });
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["payment.clearingNumber"],
                message: ''
            });
        }
    }
});

function randomizePayerCode() {
    const min = 100000000000; // Minimum 12-digit number
    const max = 999999999999; // Maximum 12-digit number
  
    const random12DigitNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return random12DigitNumber;
  }

export async function payloadToRequestBodies(payload: CustomerAccountPortfolioCreationPayload){
    const customerCode = uuidv4();
    const accountCode = uuidv4(); 
    const portfolioCode = uuidv4();
    const bankAccountCode = uuidv4();
    const mandateCode = randomizePayerCode().toString()

    const formatedPersonalNumber = !payload.isCompany ? convertPersonalNumber(payload.mainActor.personalNumber) : convertOrgNumber(payload.mainActor.personalNumber)
    const dateOfBirth = !payload.isCompany ? getBirthdateFromPersonNumber(formatedPersonalNumber) : ''
    const today = new Date().toISOString().split('T')[0]
    const managerCode = 'daniel.johansson'

    let currentCounter:number|null = null
    try{
        currentCounter = await getCurrentPortfolioCount()
    }catch(error){
        throw new Error('Failed to get current portfolio count: ' + error)
    }

    const portType = payload.accountDetails.portfolioTypeCode
    const portfolioTypeData = definedPortfolioType.get(portType);
    const portfolioTypePrefix = portfolioTypeData?.prefix ?? 'U';
    const accountDescription = portfolioTypePrefix + currentCounter.toString()
    const portfolioDescription = portfolioTypePrefix + currentCounter.toString()
    const modelPortfolioCode = payload.accountDetails.modelPortfolioCode && modelPortfolioMap.get(payload.accountDetails.modelPortfolioCode)
    const portfolioTypeCode = portfolioTypeData ? portfolioTypeData.id : '';

    const customerPayload: CairoCustomerCreationPayload = {
        customerCode: customerCode,
        firstName: !payload.isCompany ? payload.mainActor.firstname! : '',
        surName: payload.mainActor.surname,
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
                contactFirstName: !payload.isCompany ? payload.mainActor.firstname! : '',
                contactSurName: payload.mainActor.surname,
                address: payload.mainActor.address,
                address2: payload.mainActor.address2 ?? '',
                postalCode: payload.mainActor.postalCode,
                city: payload.mainActor.city,
                mobile: payload.mainActor.mobile ?? '',
                emailAddress: payload.mainActor.emailAddress ?? '',
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
        mifidDistributionStrategyCode: payload.accountDetails.modelPortfolioCode && payload.accountDetails.modelPortfolioCode !== '' ? 'PORTFOLIOMANAGEMENT' : 'INVESTMENTADVICE',
        portfolioAuthorities: [
            {
                portfolioCode: portfolioCode,
                reportingInputCode: "TypeOfMandate",
                value: payload.accountDetails.modelPortfolioCode !== 'Diskmandat' ? '33' : '32'
            }
        ]
    }

    const subscriptions: CairoSubscriptionCreationPayload[] = []
    if(!payload.accountDetails.modelPortfolioCode || payload.accountDetails.modelPortfolioCode === ''){
        subscriptions.push({
            subscriptionCode: 'PORTFOLIOFEE',
            portfolioCode: portfolioCode,
            fromDate: today,
            value: 0.95
        })
        subscriptions.push({
            subscriptionCode: 'CONTRIBUTIONFEE',
            portfolioCode: portfolioCode,
            fromDate: today,
            value: payload.accountDetails.feeSubscription * 0.8
        })
    }else{
        subscriptions.push({
            subscriptionCode: 'PerformanceFeeYear',
            portfolioCode: portfolioCode,
            fromDate: today,
            value: payload.accountDetails.feeSubscription * 0.8
        })
    }

    const bankAccountPayload: CairoExternalBankAccountCreationPayload|null = payload.payment ? {
        externalBankAccountCode: bankAccountCode,
        customerCode: customerCode, 
        externalBankAccountTypeCode:  "DEPOSIT_AND_WITHDRAWAL",
        clearingNumber: payload.payment.clearingNumber,
        accountNumber: payload.payment.accountNumber
    }:null

    const mandatePayload: CairoMandateCreationPayload|null = payload.payment ? {
        mandateCode: mandateCode,
        externalBankAccountCode: bankAccountCode,
        payerNumberTypeCode: "MANDATECODE"
    }:null

    const instructionPayload: CairoInstructionCreationPayload[] | null = payload.payment ? payload.payment.deposit.map((d) => ({
        mandateCode: mandateCode,
        instructionCode: uuidv4(),
        frequencyCode: d.isRecurring ? "MONTHLY" : "MONTHLY",
        amount: d.amount,
        debitDate: "2024-01-27",
        noOfDebitsAllowed: d.isRecurring ? undefined : 1,
        allocations: [
            {
                accountCode: accountCode,
                portfolioCode: portfolioCode,
                weight: 1,
            },
        ],
    })): null;

    return {
        customer: customerPayload,
        account: accountPayload,
        portfolio: portfolioPayload,
        subscriptions: subscriptions,
        bankAccount: bankAccountPayload,
        mandate: mandatePayload,
        instruction: instructionPayload,
    }
}

export type CustomerAccountPortfolioCreationPayload = z.infer<typeof customerAccountPortfolioCreationPayloadSchema>;