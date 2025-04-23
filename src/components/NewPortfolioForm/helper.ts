import { modelPortfolioMap } from "@/constant/modelPortfolio";
import { definedPortfolioType } from "@/constant/portfolioType";
import { convertOrgNumber, convertPersonalNumber } from "@/utils/stringUtils";
import { z } from "zod";
const {account : validateBankAccount} = require('se-bank-account')


export const formDefaultValues = {
    isCompany: false,
    mainActor: {
        firstname: "",
        surname: "",
        personalNumber: "",
        address: "",
        address2: "",
        postalCode: "",
        city: "",
        mobile: "",
        emailAddress: "",
    },

    representor: undefined,

    accountDetails: {
        portfolioTypeCode: undefined,
        feeSubscription: undefined,
        modelPortfolioCode: undefined,
    },

    payment: undefined,
}

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

export const userPortfolioSchema = z.object({
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

export type UserPortfolioFormValues = z.infer<typeof userPortfolioSchema>
