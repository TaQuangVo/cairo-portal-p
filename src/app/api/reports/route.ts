import { NextRequest, NextResponse } from "next/server"
import { NewPortfolioResponse } from "../submittions/portfolios/helper";
import { getToken } from "next-auth/jwt"
import { sendSubmittionFailureReportMail } from "@/services/emailService";
import { getUserById } from "@/services/userService";


export async function POST (req: NextRequest){
    const token = await getToken({ req })
    if(!token){
        return Response.json({messages:'Not authenticated.'}, {status: 403})
    }

    const body = await req.json()

    const type = body.type;
    const attachmentData = body.attachmentData
    const message = body.message
    const ccMe = body.ccMe

    const user = await getUserById(token.id)

    if(type === 'Create Account Submittion Failure'){
        const isSent = await sendSubmittionFailureReportMail(message, attachmentData as NewPortfolioResponse, token.id, ccMe, user!)
        if(isSent){
            return Response.json({messages:'Mail sent successfully.'}, {status: 200})
        }
        return Response.json({messages:'Failed to send mail.'}, {status: 500})
    }

    return Response.json({messages:'Type not supported.'}, {status: 400})
}