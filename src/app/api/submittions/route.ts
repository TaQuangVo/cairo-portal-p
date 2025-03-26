import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { DBBasePortfolioSubmittions } from "@/lib/db.type";
import { getSubmittions } from "@/services/submittionService";

export async function GET (req: NextRequest, res: NextResponse){
    const token = await getToken({ req })
    const userId = token?.id;
    const userRole = token?.role;
    if(userId === undefined || userRole === undefined){
        throw new Error('User not authenticated')
    }

    const validStatuses: DBBasePortfolioSubmittions["status"][] = [
        "failed",
        "partial failure",
        "success",
        "warning",
        "error",
    ];

    // Extract query parameters and apply defaults
    const { searchParams } = req.nextUrl;
    const personalNumber = searchParams.get("personalNumber");
    const userIdParam = searchParams.get("userId");
    const statusParam = searchParams.get("status") as DBBasePortfolioSubmittions["status"] | null;
    const page = parseInt(searchParams.get("page") || "1", 10); // Default page 1
    const limit = parseInt(searchParams.get("limit") || "20", 10); // Default limit 20

    if(userRole !== 'admin' && userIdParam !== userId){
        return Response.json({
            status: 'success',
            data: [] 
        })
    }

    // Validate the status, ignore if invalid
    const status = validStatuses.includes(statusParam as DBBasePortfolioSubmittions["status"])
    ? (statusParam as DBBasePortfolioSubmittions["status"])
    : null;

    try{
        const submittions = await getSubmittions(userIdParam, personalNumber, status, page, limit)
        return Response.json({
            status: 'success',
            data: submittions
        })
    }catch(e){      
        return Response.json({
            status: 'failed',
            messages: (e as Error).message
        }, {status: 500})
    }
}