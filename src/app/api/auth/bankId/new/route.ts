import {newTransaction} from "@/lib/scrive"
import { NextRequest, NextResponse } from "next/server"

export async function GET (req: NextRequest, res: NextResponse){
    try{
        const sc = await newTransaction();
        return NextResponse.json(sc, {status: 200})
    }catch(e:any){
        return NextResponse.json({message: 'Something gone wrong.'}, {status: 500})
    }
}