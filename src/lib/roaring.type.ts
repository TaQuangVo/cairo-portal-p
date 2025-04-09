export type RoaringAccessToken = {
    access_token: string
    expires_at: number
    token_type: string
    //scope?: string;
}

export interface RoaringPopulationRegisterResponse {
    records: RoaringPopulationRegisterRecord[]
    status: Status
}


export interface RoaringCompanyOverviewResponse {
    records: RoaringCompanyOverviewRecords[]
    status: Omit<Status, 'responseMode'>
}

export interface RoaringCompanyOverviewRecords {
    address: string
    changeDate: string
    coAddress: string
    commune: string
    communeCode: string
    companyDeregistrationDate: string
    companyHolder: string
    companyId: string
    companyName: string
    companyRegistrationDate: string
    county: string
    email: string
    employerContributionReg: boolean
    faxNumber: string
    industryCode: string
    industryText: string
    legalGroupCode: string
    legalGroupText: string
    numberCompanyUnits: number
    numberEmployeesInterval: string
    phoneNumber: string
    preliminaryTaxReg: boolean
    preliminaryTaxRegDate: string
    severalCompanyName: boolean
    statusCode: string
    statusDateFrom: string
    statusTextDetailed: string
    statusTextHigh: string
    topDirectorFunction: string
    topDirectorName: string
    town: string
    vatReg: boolean
    vatRegDate: string
    visitAddress: string
    visitCommune: string
    visitCounty: string
    visitStreet: string
    visitTown: string
    visitZipCode: string
    webAddress: string
    zipCode: string
}


export interface RoaringPopulationRegisterRecord {
    aggregatedIncome: string
    contactAddress: ContactAddress[]
    details: Detail[]
    foreignAddress: ForeignAddress[]
    incomeYear: string
    name: Name[]
    nationalRegistryChangeDate: string
    personId: string
    personIdType: string
    populationRegistration: PopulationRegistration[]
    populationRegistrationAddress: PopulationRegistrationAddress[]
    protectedRegistration: boolean
    protectedRegistrationDate: string
    realEstate: RealEstate[]
    relation: Relation[]
    secrecy: Secrecy
    secrecyDate: string
    specialPostalAddress: SpecialPostalAddress[]
}

export interface ContactAddress {
    dateFrom: string
    dateTo: string
    internationalAddress: InternationalAddress
    swedishAddress: SwedishAddress
}

export interface InternationalAddress {
    country: string
    deliveryAddress1: string
    deliveryAddress2: string
    deliveryAddress3: string
}

export interface SwedishAddress {
    city: string
    coAddress: string
    deliveryAddress1: string
    deliveryAddress2: string
    zipCode: string
}

export interface Detail {
    birth: Birth
    coordinationNumberInformation: CoordinationNumberInformation
    dateFrom: string
    dateTo: string
    deRegistrationDate: string
    deRegistrationReasonCode: string
    death: Death
    gender: string
    personIdChangeInformation: PersonIdChangeInformation[]
    protectedRegistration: boolean
    secrecy: Secrecy
    swedishCitizen: boolean
}

export interface Birth {
    birthCongregation: string
    birthCountyCode: string
    birthDate: string
}

export interface CoordinationNumberInformation {
    attributionDate: string
    deathDate: string
    expectedInactivationDate: string
    inactivationDate: string
    inactivationReason: string
    renewalDate: string
    status: string
}

export interface Death {
    deathDate: string
    foundDeadDate: string
}

export interface PersonIdChangeInformation {
    referencePersonId: string
    referenceType: string
}

export interface Secrecy {
    secrecy: boolean
    secrecySetBySpar: boolean
}

export interface ForeignAddress {
    dateFrom: string
    dateTo: string
    internationalAddress: InternationalAddress2
}

export interface InternationalAddress2 {
    country: string
    deliveryAddress1: string
    deliveryAddress2: string
    deliveryAddress3: string
}

export interface Name {
    dateFrom: string
    dateTo: string
    firstName: string
    givenNameCode: number
    middleName: string
    shortenedName: string
    surName: string
}

export interface PopulationRegistration {
    countyCode: string
    dateFrom: string
    dateTo: string
    districtCode: string
    municipalityCode: string
    populationRegistrationDate: string
    residenceStatusCode: string
}

export interface PopulationRegistrationAddress {
    dateFrom: string
    dateTo: string
    swedishAddress: SwedishAddress2
}

export interface SwedishAddress2 {
    city: string
    coAddress: string
    deliveryAddress1: string
    deliveryAddress2: string
    zipCode: string
}

export interface RealEstate {
    countyCode: string
    municipalityCode: string
    realEstatePart: RealEstatePart[]
    realEstateTypeCode: string
    taxationUnitIdentificationNumber: string
    taxationValue: string
    taxationYear: string
}

export interface RealEstatePart {
    identification: string
    name: string
    shareDenominator: number
    shareNumerator: number
}

export interface Relation {
    birthDate: string
    dateFrom: string
    dateTo: string
    deRegistrationDate: string
    deRegistrationReasonCode: string
    deathDate: string
    firstName: string
    middleName: string
    personId: string
    relationType: string
    surName: string
}

export interface SpecialPostalAddress {
    dateFrom: string
    dateTo: string
    internationalAddress: InternationalAddress3
    swedishAddress: SwedishAddress3
}

export interface InternationalAddress3 {
    country: string
    deliveryAddress1: string
    deliveryAddress2: string
    deliveryAddress3: string
}

export interface SwedishAddress3 {
    city: string
    coAddress: string
    deliveryAddress1: string
    deliveryAddress2: string
    zipCode: string
}

export interface Status {
    code: number
    responseMode: number
    text: string
}
