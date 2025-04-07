import { Client } from "@upstash/qstash"

import { NextRequest } from "next/server"
import { CustomerAccountPortfolioCreationPayload, customerAccountPortfolioCreationPayloadSchema, payloadToRequestBodies} from "./helper"
import { ZodError } from "zod"
import { getToken } from "next-auth/jwt"
import { saveResponseToSubmittion } from "@/services/submittionService"
import { NewPortfolioResponse } from "../../portfolios/helper"
import { ObjectId } from "mongodb"

const client = new Client({ token: process.env.QSTASH_TOKEN! })

// POST /api/submittions/portfolios
export async function POST (req: NextRequest){
    let userId = 'TaQuangVoMock';

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

        const result = await client.publishJSON({
          url: "https://lucky-plants-vanish.loca.lt/api/qhandler/portfolio",
          body: {
            ...requestBodies,
            constext: 
                {
                    submitterId: userId,
                    submissionResultId: submissionResultId,
                }
          },
        })

        const resData:NewPortfolioResponse = {
            status: 'pending',
            requestType: 'Create Portfolio',
            requestBody: body,
            messages:'Failed to create portfolio',
            dataType: null,
            data: null
          }

        saveResponseToSubmittion(resData, userId, submissionResultId)

        return Response.json({portfolioCode: requestBodies.portfolio.portfolioDescription}, {status: 201})
    } catch(e){
        return Response.json({message:[(e as Error).message]}, {status: 500})
    }
}