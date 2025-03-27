export type CairoHttpResponse<T> = {
    status: "success" | "error" | "failed";
    statusCode?: number;
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
    customerTypeCode: string
    regionCode: string
    languageCode: string
    organizationId: string
    managerCode: string
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
    'surName' | 
    'customerTypeCode' |
    'regionCode' |
    'languageCode' |
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

    startDate: string
    endDate?: string
    isActive: boolean
};

export type CairoAccountCreationPayload = Required<Pick<CairoAccount,
    'accountCode' |
    'accountDescription' |
    'accountTypeCode' |
    'customerCode' |
    'currencyCode' |
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
    'managerCode' |
    'bookValueMethodCode' |
    'scenarioCode'>> & 
    Partial<Pick<CairoPortfolio, 'modelPortfolioCode'>>;

export type CairoPortfolioCreationResponse = Required<Pick<CairoPortfolio, 'portfolioCode' | 'portfolioDescription'>>;

