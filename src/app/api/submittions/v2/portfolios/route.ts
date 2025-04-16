import { Client } from "@upstash/qstash"

import { NextRequest } from "next/server"
import { CustomerAccountPortfolioCreationPayload, customerAccountPortfolioCreationPayloadSchema, NewPortfolioResponse, payloadToRequestBodies, PortfolioCreationMessageBody} from "./helper"
import { ZodError } from "zod"
import { getToken } from "next-auth/jwt"
import { saveResponseToSubmittion } from "@/services/submittionService"
import { ObjectId } from "mongodb"
import { PORTFOLIO_HANDLER_RETRIES } from "@/constant/qstash"
import { tokenValidator } from "@/utils/jwtAuthUtil"
import { creationSequence } from "@/services/cairoServiceV2"

const client = new Client({ token: process.env.QSTASH_TOKEN! })

// POST /api/submittions/portfolios
export async function POST (req: NextRequest){
    const { isLoggedIn, token } = await tokenValidator(req)
    if(!isLoggedIn){
        return Response.json({messages:'Not authenticated.'}, {status: 403})
    }

    let userId = token.id;

    const body = await req.json()

    let payload:CustomerAccountPortfolioCreationPayload
    try{
        payload = customerAccountPortfolioCreationPayloadSchema.parse(body)
    }catch(e){
        return Response.json({
            messages:(e as ZodError).issues.map(issues => (issues.message)),
        }, {status: 400})
    }


    try{
        const requestBodies = await payloadToRequestBodies(payload)
        const submissionResultId = new ObjectId().toHexString()


        //const ares = await creationSequence(requestBodies.customer, requestBodies.account, requestBodies.portfolio, requestBodies.subscriptions, requestBodies.bankAccount, requestBodies.mandate, requestBodies.instruction, req.signal)
        //console.log(JSON.stringify(ares))

        //return

        const qHandlerUrl = process.env.Q_HANDLER_URL
        const qBody: PortfolioCreationMessageBody = {
            ...requestBodies,
            rawBody: body,
            constext: 
                {
                    submitterId: userId,
                    submissionResultId: submissionResultId,
                }
        }
        const result = await client.publishJSON({
          url: qHandlerUrl + "/portfolio",
          body: qBody,
          retries: PORTFOLIO_HANDLER_RETRIES,
        })

        const resData:NewPortfolioResponse = {
            status: 'pending',
            requestType: 'Create Portfolio',
            requestBody: body,
            messages:'Portfolio creation process initiated.',
            qMessageIs: result.messageId,
            dataType: null,
            data: null
        }

        saveResponseToSubmittion(resData, userId, submissionResultId)

        return Response.json({portfolioCode: requestBodies.portfolio.portfolioDescription}, {status: 201})
    } catch(e){
        return Response.json({messages:[(e as Error).message]}, {status: 500})
    }
}