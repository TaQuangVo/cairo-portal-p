import { ObjectId } from "mongodb";
import { getSubmittionCollection } from "../lib/db";
import { DBBasePortfolioSubmittions, DBPortfolioSubmittions } from "../lib/db.type";
import { NewPortfolioResponse } from "@/app/api/submittions/portfolios/helper";


export async function saveResponseToSubmittion(newPortfolioResponse: NewPortfolioResponse, createdBy:string): Promise<void> {
    try {
        const submittionCol = await getSubmittionCollection();

        const newSubmittion: DBPortfolioSubmittions = {
            ...newPortfolioResponse,
            _id: new ObjectId().toHexString(),
            createdAt: new Date(),
            createdBy: createdBy,
        };

        await submittionCol.insertOne(newSubmittion);
    } catch (error) {
        console.log(error)
    }
}

export async function getSubmittionById(submittionId: string): Promise<DBBasePortfolioSubmittions | null> {
    try {
        const submittionCol = await getSubmittionCollection();
        const submittion = await submittionCol.findOne({ _id: submittionId });

        return submittion;
    }catch (error) { 
        throw new Error(`Failed to fetch submittion:  ${error instanceof Error ? error.message : error}`);
    }
}

export async function getSubmittions(
    userId: string | null,
    personalNumber: string | null,
    status: DBBasePortfolioSubmittions["status"] | null,
    page: number = 1, // Default page 1
    limit: number = 20 // Default limit 20
): Promise<DBBasePortfolioSubmittions[]> {
    try {
        const submittionCol = await getSubmittionCollection();

        const query: Record<string, any> = {};
        if (userId) query.createdBy = userId;
        if (personalNumber) query["requestBody.personalNumber"] = personalNumber;
        if (status) query.status = status;

        const skip = (page - 1) * limit;

        const users = await submittionCol
            .find(query) // Apply filters
            .skip(skip)  // Skip documents for pagination
            .limit(limit) // Limit the number of results
            .sort({ createdAt: -1 }) // Sort by creation date (newest first)
            .toArray();

        return users;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error(`Failed to fetch users:  ${error instanceof Error ? error.message : error}`);
    }
}