import { NextRequest, NextResponse } from "next/server"
import { NewPortfolioResponse } from "../submittions/portfolios/helper";
import { getToken } from "next-auth/jwt"
import { sendSubmittionFailureReportMail } from "@/services/emailService";


export async function POST (req: NextRequest){
    const token = await getToken({ req })
    const userId = '67e3dafa6b27e2b0d662bdad'
    if(!userId){
        throw new Error('User not authenticated')
    }

    const body = await req.json()

    const type = body.type;
    const attachmentData = body.attachmentData

    if(type === 'Create Portfolio Submittion Failure'){
        const isSent = await sendSubmittionFailureReportMail(attachmentData as NewPortfolioResponse, userId)
        if(isSent){
            return Response.json({messages:'Mail sent successfully.'}, {status: 200})
        }
        return Response.json({messages:'Failed to send mail.'}, {status: 500})
    }

    return Response.json({messages:'Type not supported.'}, {status: 400})
}