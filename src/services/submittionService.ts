import { ObjectId } from "mongodb";
import { getSubmittionCollection } from "../lib/db";
import { DBBasePortfolioSubmittions, DBPortfolioSubmittions } from "../lib/db.type";
import { NewPortfolioResponse } from "@/app/api/submittions/v2/portfolios/helper";


export async function saveResponseToSubmittion(newPortfolioResponse: NewPortfolioResponse, createdBy:string, id: string| null): Promise<string | null> {
    try {
        const submittionCol = await getSubmittionCollection();

        const newSubmittion: DBPortfolioSubmittions = {
            ...newPortfolioResponse,
            _id: id ? id : new ObjectId().toHexString(),
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: createdBy,
        };

        const save = await submittionCol.insertOne(newSubmittion);
        return save.insertedId;
    } catch (error) {
        return null
    }
}

export async function updateResponseToSubmission(
    updatedPortfolioResponse: Partial<NewPortfolioResponse>, 
    id: string
  ): Promise<boolean> {
    try {
      const submissionCol = await getSubmittionCollection();

      const submittion = await submissionCol.findOne({ _id: id });
      if(!submittion) {
        return false;
      }
  
      const updateData: Partial<DBPortfolioSubmittions> = {
        ...updatedPortfolioResponse,
        updatedAt: new Date(),
      };
  
      const result = await submissionCol.updateOne(
        { _id: id },
        { $set: updateData }
      );
  
      return result.modifiedCount > 0;
    } catch (error) {
      return false;
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
    status: DBPortfolioSubmittions["status"] | null,
    page: number = 0, // Default page 1
    limit: number = 10 // Default limit 20
): Promise<{submissions:DBPortfolioSubmittions[], total:number}> {
    try {
        const submittionCol = await getSubmittionCollection();

        const query: Record<string, any> = {};
        if (userId) query.createdBy = userId;
        if (status) query.status = status;
        if (personalNumber) {
          query["requestBody.personalNumber"] = { $regex: personalNumber, $options: "i" }; // partial match
        }

        const total = await submittionCol.countDocuments(query);
        const submissions = await submittionCol
            .find(query) // Apply filters
            .skip(page * limit)  // Skip documents for pagination
            .limit(limit) // Limit the number of results
            .sort({ createdAt: -1 }) // Sort by creation date (newest first)
            .toArray();

        return {submissions, total};
    } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error(`Failed to fetch users:  ${error instanceof Error ? error.message : error}`);
    }
}