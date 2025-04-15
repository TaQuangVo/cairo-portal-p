import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { DBBasePortfolioSubmittions } from "@/lib/db.type";
import { getSubmittions } from "@/services/submittionService";
import { tokenValidator } from "@/utils/jwtAuthUtil";

export async function GET (req: NextRequest){
    const { isLoggedIn, token, isAdmin } = await tokenValidator(req)
    if(!isLoggedIn){
        return Response.json({messages:'Not authenticated.'}, {status: 403})
    }

    const userId = token.id;

    const validStatuses: DBBasePortfolioSubmittions["status"][] = [
        "failed",
        "partial failure",
        "success",
        "warning",
        "error",
    ];

    // Extract query parameters and apply defaults
    const { searchParams } = req.nextUrl;
    const personalNumber = searchParams.get("searchPersonalNumber");
    let userIdParam = searchParams.get("userId");
    const statusParam = searchParams.get("status") as DBBasePortfolioSubmittions["status"] | null;
    const page = parseInt(searchParams.get("page") || "1", 0); // Default page 1
    const limit = parseInt(searchParams.get("limit") || "10", 10); // Default limit 20

    // If the user is not an admin, they can only view their own submittions
    if(!isAdmin && userIdParam !== userId){
        return Response.json({
            status: 'success',
            data: [] 
        })
    }
    if(!isAdmin){
        userIdParam = userId;
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