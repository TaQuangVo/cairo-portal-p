export interface ResponseCollection<T> {
    totalCount: number;
    start: number;
    count: number;
    results: T[];
}

// Define the type for a single customer
export interface Customer {
    customerCode: string;
    customerId: number;
    firstName: string;
    surName: string;
    dateOfBirth: string;
    isActive: boolean;
    organizationId: string;
    createTime: string;
    updateDate: string;

    //customerDescription: string | null;
    //customerTypeCode: string;
    //customerClassCode: string;
    //regionCode: string;
    //languageCode: string;
    //startDate: string | null;
    //endDate: string | null;
    //citizenshipRegionCode: string;
    //vat: string | null;
    //tin: string | null;
    //lei: string | null;
    //managerCode: string;
    //targetPortfolioCode: string | null;
    //targetAccountCode: string | null;
    //lastReportDate: string;
    //mifidLastReportedDrawdown: string | null;
    //mifidInvestorTypeCode: string;
    //mifidKnowledgeAndExperienceCode: string;
    //mifidAbilityToBearLossesCode: string;
    //pepStatusDate: string | null;
}
  
  