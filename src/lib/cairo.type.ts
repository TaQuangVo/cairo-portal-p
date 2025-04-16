export type CairoHttpResponse<T> = {
    status: "success" | "conflict" | "error" | "failed" | 'aborted';
    statusCode?: number;
    requestTime?: number;
    body?: string;
    data?: T; // Parsed JSON data (optional)
};

export interface CairoResponseCollection<T> {
    totalCount: number;
    start: number;
    count: number;
    results: T[];
}

// Define the type for a single customer
export interface CairoCustomer {
    customerCode: string
    firstName: string
    surName: string
    dateOfBirth: string
    customerTypeCode: 'PRIVATE' | 'COMPANY'
    customerClassCode: string
    regionCode: string
    languageCode: string
    startDate: string
    organizationId: string
    managerCode: string
    citizenshipRegionCode: string
    customerContacts?: CairoCustomerContact[]; // Via Filter

    customerId: number
    customerDescription: string
    isActive: boolean
    createTime: string
    accounts?: CairoAccount[]; // Via Filter
    portfolios?: CairoPortfolio[]; // Via Filter
}

export type CairoCustomerCreationPayload = Required<Pick<CairoCustomer, 
    'customerCode' | 
    'firstName' | 
    'dateOfBirth' | 
    'surName' | 
    'customerTypeCode' |
    'citizenshipRegionCode' |
    'regionCode' |
    'languageCode' |
    'startDate' |
    'organizationId' |
    'managerCode' |
    'customerContacts'>>;

export type CairoCustomerCreationResponse = Required<Pick<CairoCustomer, 'customerCode'>>;


export interface CairoCustomerContact {
    customerCode: string;
    contactFirstName?: string;
    contactSurName?: string;
    address?: string;
    address2?: string;
    postalCode?: string;
    city?: string;
    mobile?: string;
    emailAddress?: string;
}

export type CairoAccount = {
    accountCode: string
    accountDescription: string
    accountTypeCode: string
    customerCode: string
    currencyCode?: string
    custodianCode: string
    omniAccountCodes: string[]

    startDate: string
    endDate?: string
    isActive: boolean
};

export interface CairoPortalUser {
    customerCode: string
    firstName: string
    surName: string
    customerDescription: string
    nin: string
    customerTypeCode: string
    customerTypeDescription: string
    customerStartDate: string
    customerEndDate: any
    isActive: boolean
    accessCode: string
    accessDescription: string
    updateDate: string
}
  

export type CairoAccountCreationPayload = Required<Pick<CairoAccount,
    'accountCode' |
    'accountDescription' |
    'accountTypeCode' |
    'customerCode' |
    'currencyCode' |
    'startDate' |
    'omniAccountCodes' |
    'custodianCode'>>;

export type CairoAccountCreationResponse = Required<Pick<CairoAccount,'accountCode'>>;


export type CairoPortfolio = {
    portfolioCode: string
    portfolioDescription: string
    portfolioTypeCode: string
    customerCode?: string
    currencyCode: string
    accountCode?: string
    managerCode?: string
    modelPortfolioCode?: string
    bookValueMethodCode: string
    scenarioCode: string
    performanceStartDate: string
    performance: boolean
    targetAccountCode: string
    discountTemplateCode: string
    mifidDistributionStrategyCode: string
    portfolioAuthorities: object[] 

    portfolioId: number
    startDate: string
    endDate?: string
    isActive: boolean
};

export type CairoPortfolioCreationPayload = Required<Pick<CairoPortfolio,
    'portfolioCode' |
    'portfolioDescription' |
    'portfolioTypeCode' |
    'customerCode' |
    'currencyCode' |
    'accountCode' |
    'startDate' |
    'managerCode' |
    'bookValueMethodCode' |
    'performanceStartDate' |
    'targetAccountCode' |
    'performance' |
    'discountTemplateCode' |
    'mifidDistributionStrategyCode' |
    'portfolioAuthorities' |
    'scenarioCode'>> & 
    Partial<Pick<CairoPortfolio, 'modelPortfolioCode'>>;

export type CairoPortfolioCreationResponse = Required<Pick<CairoPortfolio, 'portfolioCode' | 'portfolioDescription'>>;

export type CairoSubscription = {
    subscriptionId: number,
    subscriptionCode: string,
    subscriptionDescription: string,
    portfolioCode: string,
    portfolioDescription: string,
    fromDate: string,
    toDate: string,
    value: number,
    updateDate: string
}

export type CairoSubscriptionCreationPayload = Required<Pick<CairoSubscription,
    'subscriptionCode' |
    'portfolioCode' |
    'fromDate' |
    'value'>> & 
    Partial<Pick<CairoSubscription, 'toDate'>>;

export type CairoSubscriptionCreationResponse = Required<Pick<CairoSubscription, 'subscriptionId'>>;


export interface CairoExternalBankAccount {
    externalBankAccountCode: string
    customerCode: string
    customerDescription: string
    externalBankAccountTypeCode: string
    primaryExternalBankAccount: boolean
    externalBankAccountStatusCode: string
    clearingNumber: string
    accountNumber: string
    iban: any
    validateDate: any
    validateStatusComment: any
    updateDate: string
    mandates?: CairoMandate[]
}

export type CairoExternalBankAccountCreationPayload = Required<Pick<CairoExternalBankAccount, 'externalBankAccountCode' | 'customerCode' | 'externalBankAccountTypeCode' | 'clearingNumber' | 'accountNumber'>>

export type CairoExternalBankAccountCreationResponse = Required<Pick<CairoExternalBankAccount, 'externalBankAccountCode'>>  

export interface CairoMandate {
    mandateCode: string
    externalBankAccountCode: string
    payerNumberTypeCode: string
    mandateStatusCode: 'ACTIVATED' | 'CREATED' | 'CANCELLED' | 'REJECTEDACTIVATED'
    mandateStatusDate: string
    mandateStatusComment: string
    updateDate: string
}

export type CairoMandateCreationPayload = Required<Pick<CairoMandate, 'mandateCode' | 'externalBankAccountCode' | 'payerNumberTypeCode'>>

export interface Allocation {
    allocationId: number
    instructionCode: string
    portfolioCode: string
    portfolioDescription: string
    accountCode: string
    accountDescription: string
    weight: number
    useModel: boolean
    instrumentCode: any
    instrumentDescription: any
    instrumentTypeCode: any
    instrumentClassCode: any
    isin: any
    updateDate: string
}

export type CairoAllocationCreationPayload = Required<Pick<Allocation, 'portfolioCode' | 'accountCode' | 'weight'>>

export interface CairoInstruction {
    instructionCode: string
    instructionDescription: string
    mandateCode: string
    mandateDescription: string
    customerCode: string
    customerDescription: string
    amount: number
    debitDate: string
    frequencyCode: string
    noOfDebitsAllowed: number
    instructionStatusCode: string
    instructionStatusDate: string
    instructionStatusComment: string
    paymentStatusCode: string
    paymentStatusDate: string
    nextPaymentDate: any
    updateDate: string
    allocations: Allocation[]
}

export type CairoInstructionCreationPayload = Required<Pick<CairoInstruction, 'instructionCode' | 'mandateCode' | 'amount' | 'debitDate' | 'frequencyCode'>>  & Partial<Pick<CairoInstruction, 'noOfDebitsAllowed'> & {allocations: CairoAllocationCreationPayload[]}>

export type CairoInstructionCreationResponse = Required<Pick<CairoInstruction, 'instructionCode'>>