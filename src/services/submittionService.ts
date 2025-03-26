import { ObjectId } from "mongodb";
import { getSubmittionCollection } from "../lib/db";
import { DBBasePortfolioSubmittions, DBPortfolioSubmittions } from "../lib/db.type";
import { NewPortfolioResponse } from "@/app/api/submittions/portfolios/helper";


export async function saveResponseToSubmittion(newPortfolioResponse: NewPortfolioResponse, createdBy:string): Promise<void> {
    console.log('try to save')
    try {
        const submittionCol = await getSubmittionCollection();

        const newSubmittion: DBPortfolioSubmittions = {
            ...newPortfolioResponse,
            _id: new ObjectId().toHexString(),
            createdAt: new Date(),
            createdBy: createdBy,
        };

        const result = await submittionCol.insertOne(newSubmittion);
        console.log('saved')

        if (!result.acknowledged) {
            console.log('Failed to save submittion for user')
        }
    } catch (error) {
        console.log('Failed to save submittion for user')
        console.log(error)
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