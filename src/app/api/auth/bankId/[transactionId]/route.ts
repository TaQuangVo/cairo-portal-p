import { getTransaction } from "@/lib/scrive";
import { NextApiRequest } from "next"

export async function GET (req: NextApiRequest, { params }:{ params: Promise<{ transactionId: string }> }){
    const  transactionId  = (await params).transactionId

    try{
        const st = await getTransaction(transactionId);
        return Response.json(st, {status: 200})
    }catch(e){
        return Response.json({'message': 'Something gone wrong.'}, {status: 500})
    }
}