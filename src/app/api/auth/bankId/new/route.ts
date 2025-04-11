import {newTransaction} from "@/lib/scrive"
import { NextRequest, NextResponse } from "next/server"

export async function GET (req: NextRequest){
    console.log('GET new transaction')
    try{
        const sc = await newTransaction();
        return Response.json({...sc}, {status: 200})
    }catch(e:any){
        return Response.json({message: 'Something gone wrong.'}, {status: 500})
    }
}