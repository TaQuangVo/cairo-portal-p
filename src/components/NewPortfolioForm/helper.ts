import { modelPortfolioMap } from "@/constant/modelPortfolio";
import { definedPortfolioType } from "@/constant/portfolioType";
import { convertOrgNumber, convertPersonalNumber } from "@/utils/stringUtils";
import { z } from "zod";



export const formDefaultValues = {
    isCompany: false,
    firstname: "",
    surname: "",
    personalNumber: "",
    address: "",
    address2: "",
    postalCode: "",
    city: "",
    mobile: "",
    emailAddress: "",

    reprecenterPersonalNumber: '',
    reprecenterFirstname: '',
    reprecenterSurname: '',
    reprecenterAddress: '',
    reprecenterAddress2: '',
    reprecenterPostalCode: '',
    reprecenterCity: '',
    reprecenterMobile: '',
    reprecenterEmailAddress: '',

    portfolioTypeCode: undefined,
    modelPortfolioCode: undefined,

    payment: undefined,

}

export const userPortfolioSchema = z.object({
    isCompany: z.boolean(),

    firstname: z.string(),
    surname: z.string(),
    personalNumber: z.string().refine((value) => {
        return /^\d{10,12}$|^\d{8}-\d{4}|^\d{6}-\d{4}$/.test(value)
    }, { message: "Social security number must contain only digits and possibly one dash(-)." }),
    address: z.string().min(5, "Address must be at least 5 characters."),
    address2: z.string().optional().nullable(),
    postalCode: z.string().min(4, "Postal code must be at least 4 characters."),
    city: z.string().min(2, "City must be at least 2 characters."),
    mobile: z.string().min(8, "Mobile number must be at least 8 characters.").or(z.literal("")).optional().nullable(),
    emailAddress: z.string().email("Invalid email format.").or(z.literal("")).optional().nullable(),

    reprecenterPersonalNumber: z.string().optional().nullable(),
    reprecenterFirstname: z.string().optional().nullable(),
    reprecenterSurname: z.string().optional().nullable(),
    reprecenterAddress: z.string().optional().nullable(),
    reprecenterAddress2: z.string().optional().nullable(),
    reprecenterPostalCode: z.string().optional().nullable(),
    reprecenterCity: z.string().optional().nullable(),
    reprecenterMobile: z.string().optional().nullable(),
    reprecenterEmailAddress: z.string().email("Invalid email format.").or(z.literal("")).optional().nullable(),

    portfolioTypeCode: z.string().refine((value) => {
        return definedPortfolioType.get(value) != undefined;
    }, { message: "Invalid portfolio code." }),
    feeSubscription: z.number({ message: 'Account fee is required' })
        .min(0.2, { message: "Subscription fee must be at least 0.2" })
        .max(2.0, { message: "Subscription fee must not exceed 2.0" }),
    modelPortfolioCode: z.string().refine((value) => {
        return modelPortfolioMap.get(value) != undefined;
    }, { message: "Invalid model portfolio code." }).or(z.literal('')).optional().nullable(),

    
    payment: z.object({
        clearingNumber: z.string().min(4, "Clearing number must be at least 4 digits."),
        accountNumber: z.string().min(6, "Account number must be at least 6 digits."),

        deposit: z.array(z.object({
            amount: z.number({ message: 'Amount is required' })
                .min(0.2, { message: "Amount must be at least 20 SEK" }),
            isRecurring: z.boolean(),
        }))
    }).optional().nullable(),

}).superRefine((data, ctx) => {
    if (!data.isCompany) {
        if (!data.firstname || data.firstname.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["firstname"],
                message: "Firstname must be at least 2 characters."
            });
        }
        if (!data.surname || data.surname.length < 2) {
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
        if (!data.surname || data.surname.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["surname"],
                message: "Company name must be at least 2 characters."
            });
        }

        try {
            convertOrgNumber(data.personalNumber)
        } catch (e) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["personalNumber"],
                message: (e as Error).message
            });
        }

        if (definedPortfolioType.get(data.portfolioTypeCode)?.id === 'ISK') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["portfolioTypeCode"],
                message: "Company accounts cannot be Investeringssparkonto accounts."
            });
        }
    }

    if (data.isCompany && data.reprecenterPersonalNumber && data.reprecenterPersonalNumber !== ''){
        try {
            convertPersonalNumber(data.reprecenterPersonalNumber)
        } catch (error) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["personalNumber"],
                message: (error as Error).message
            });
            return
        }

        if (!data.reprecenterFirstname || data.reprecenterFirstname.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["reprecenterFirstname"],
                message: "Firstname must be at least 2 characters."
            });
        }
        if (!data.reprecenterSurname || data.reprecenterSurname.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["reprecenterSurname"],
                message: "Surename must be at least 2 characters."
            });
        }
        if (!data.reprecenterAddress || data.reprecenterAddress.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["reprecenterAddress"],
                message: "Address must be at least 2 characters."
            });
        }
        if (!data.reprecenterPostalCode || data.reprecenterPostalCode.length < 4) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["reprecenterPostalCode"],
                message: "Postal code must be at least 4 characters."
            });
        }
        if (!data.reprecenterCity || data.reprecenterCity.length < 4) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["reprecenterPostalCode"],
                message: "Postal code must be at least 4 characters."
            });
        }
    }
});

export type UserPortfolioFormValues = z.infer<typeof userPortfolioSchema>
