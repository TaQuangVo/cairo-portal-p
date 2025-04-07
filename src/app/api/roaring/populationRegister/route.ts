import { swedishPopulationRegisterSearch } from "@/lib/roaring";
import { convertPersonalNumber } from "@/utils/stringUtils";
import { NextRequest } from "next/server";

export async function GET (req: NextRequest){
    let personalNumber = req.nextUrl.searchParams.get('personalNumber');

    if(!personalNumber){
        return Response.json({messages:'Missing personal number'}, {status: 400})
    }

    try{
        personalNumber = convertPersonalNumber(personalNumber)
        const person = await swedishPopulationRegisterSearch(personalNumber.replaceAll('-', ''))

        if(!person){
            return Response.json({messages:'Person not found'}, {status: 404})
        }
        return Response.json(person, {status: 200})
    }catch(e){
        return Response.json({messages:(e as Error).message}, {status: 400})
    }
}