import { CustomerAccountPortfolioCreationPayload } from "@/app/api/submittions/portfolios/helper";
import { SequentialCustomerAccountPortfolioCreatioResult } from "@/services/cairoService";
import { CairoCustomer } from "./cairo.type";
import { ZodError } from "zod";
import { RoaringCompanyOverviewRecords, RoaringPopulationRegisterRecord } from "./roaring.type";

export type DBUser = {
    _id: string
    personalNumber: string
    role: "admin" | "user";
    isActive: boolean;

    email?: string | null
    givenName?: string | null
    surname?: string | null
    phoneNumber?: string | null

    createdAt: Date;
    updatedAt: Date;
};

export type UserCreate = Omit<DBUser, "_id" | "createdAt" | "updatedAt">;
export type UserUpdate = Omit<DBUser, "createdAt" | "updatedAt">;


export interface DBBasePortfolioSubmittions {
    _id: string;
    status: 'pending' | 'failed' | 'partial failure' | 'success' | 'warning' | 'error';
    requestType: 'Create Portfolio';
    requestBody: CustomerAccountPortfolioCreationPayload;
    messages: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export type DBPortfolioSubmittions =
    | (DBBasePortfolioSubmittions & {
          dataType: 'SequentialCustomerAccountPortfolioCreatioResult';
          data: SequentialCustomerAccountPortfolioCreatioResult;
      })
    | (DBBasePortfolioSubmittions & {
        dataType: 'CairoCustomer';
        data: CairoCustomer;
    })
    | (DBBasePortfolioSubmittions & {
        dataType: 'Error';
        data: Error;
    })
    | (DBBasePortfolioSubmittions & {
        dataType: 'ZodError';
        data: ZodError;
    })
    | (DBBasePortfolioSubmittions & {
        dataType: null;
        data: null;
    });


export interface DBCounter {
    _id: string;
    counter: number;
    type: 'portfolio';
}

export interface DBRoaringPopulationRegister {
    _id: string;
    personalNumber: string;
    records: RoaringPopulationRegisterRecord[];
    createdAt: Date;
}


export interface DBRoaringCompanyOverview {
    _id: string;
    orgNumber: string;
    records: RoaringCompanyOverviewRecords[];
    createdAt: Date;
}