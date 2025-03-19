import { startTransaction } from "@/lib/scrive";
import { NextApiRequest } from "next"

export async function GET (req: NextApiRequest, { params }:{ params: Promise<{ transactionId: string }> }){
    const  transactionId  = (await params).transactionId

    const st = await startTransaction(transactionId);

    return Response.json(st, {status: 200})
}