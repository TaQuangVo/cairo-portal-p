import { getPopulationRegister } from "@/services/roaring";
import { tokenValidator } from "@/utils/jwtAuthUtil";
import { convertPersonalNumber } from "@/utils/stringUtils";
import { NextRequest } from "next/server";

export async function GET (req: NextRequest){
    const { isLoggedIn } = await tokenValidator(req)
    if(!isLoggedIn){
        return Response.json({messages:'Not authenticated.'}, {status: 403})
    }

    let personalNumber = req.nextUrl.searchParams.get('personalNumber');
    if(!personalNumber){
        return Response.json({messages:'Missing personal number'}, {status: 400})
    }

    try{
        personalNumber = convertPersonalNumber(personalNumber)
        const person = await getPopulationRegister(personalNumber)

        if(!person){
            return Response.json({messages:'Person not found'}, {status: 404})
        }
        return Response.json(person, {status: 200})
    }catch(e){
        return Response.json({messages:(e as Error).message}, {status: 400})
    }
}