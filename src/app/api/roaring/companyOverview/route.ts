import { getCompanyOverview } from "@/services/roaring";
import { convertOrgNumber } from "@/utils/stringUtils";
import { NextRequest } from "next/server";

export async function GET (req: NextRequest){
    let orgNumber = req.nextUrl.searchParams.get('orgNumber');

    if(!orgNumber){
        return Response.json({messages:'Missing personal number'}, {status: 400})
    }

    try{
        orgNumber = convertOrgNumber(orgNumber)
        const company = await getCompanyOverview(orgNumber)

        if(!company){
            return Response.json({messages:'Company not found'}, {status: 404})
        }
        return Response.json(company, {status: 200})
    }catch(e){
        return Response.json({messages:(e as Error).message}, {status: 400})
    }
}