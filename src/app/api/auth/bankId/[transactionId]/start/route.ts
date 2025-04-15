import { startTransaction } from "@/lib/scrive";
import { NextRequest, NextResponse } from "next/server"

export async function GET (req: NextRequest, { params }:{ params: Promise<{ transactionId: string }> }){
    const  transactionId  = (await params).transactionId

    if(!transactionId){
        return Response.json({message:'No transactionId provided'}, {status: 400})
    }

    try{
        const st = await startTransaction(transactionId);
        return Response.json(st, {status: 200})
    }catch(e){
        return Response.json({message: (e as Error).message}, {status: 500})
    }
}