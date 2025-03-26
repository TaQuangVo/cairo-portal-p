import { startTransaction } from "@/lib/scrive";
import { NextRequest, NextResponse } from "next/server"

export async function GET (req: NextRequest, { params }:{ params: Promise<{ transactionId: string }> }){
    const  transactionId  = (await params).transactionId

    const st = await startTransaction(transactionId);

    return Response.json(st, {status: 200})
}