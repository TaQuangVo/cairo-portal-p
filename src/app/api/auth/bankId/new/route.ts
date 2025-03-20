import {newTransaction} from "@/lib/scrive"
import { NextApiRequest, NextApiResponse } from "next"

export async function GET (req: NextApiRequest, res: NextApiResponse){
    try{
        const sc = await newTransaction();
        return Response.json(sc, {status: 200})
    }catch(e:any){
        return Response.json({message: 'Something gone wrong.'}, {status: 500})
    }
}