import { NextRequest, NextResponse } from "next/server"
import { CustomerAccountPortfolioCreationPayload, customerAccountPortfolioCreationPayloadSchema, NewPortfolioResponse, payloadToRequestBodies} from "./helper"
import { createCustomerAccountPortfolio, CreationWaring } from "@/services/cairoService"
import { ZodError } from "zod"
import { CairoCustomer } from "@/lib/cairo.type"
import { getToken } from "next-auth/jwt"
import { saveResponseToSubmittion } from "@/services/submittionService"


// POST /api/submittions/portfolios
export async function POST (req: NextRequest, res: NextResponse){
    const token = await getToken({ req })
    let userId = token?.id;
    userId = '1234'
    if(userId === undefined){
        throw new Error('User not authenticated')
    }

    const body = await req.json()

    let payload:CustomerAccountPortfolioCreationPayload
    try{
        payload = customerAccountPortfolioCreationPayloadSchema.parse(body)
    }catch(e){
        return Response.json({
            status: 'failed',
            requestType: 'Create Portfolio',
            request: body,
            messages:(e as ZodError).issues.map(issues => (issues.message)),
            dataType: 'ZodError',
            data: e
        }, {status: 400})
    }

    const requestBodies = payloadToRequestBodies(payload)
    const cairoCustomer = requestBodies.customer
    const cairoAccount = requestBodies.account
    const cairoPortfolio = requestBodies.portfolio

    try{
        const response = await createCustomerAccountPortfolio(cairoCustomer, cairoAccount, cairoPortfolio, ['SKIP CUSTOMER CREATION'])

        if(response.customerCreation.status !== 'success' && response.customerCreation.status !== 'skipped'){
            const resData:NewPortfolioResponse = {
                status: 'failed',
                requestType: 'Create Portfolio',
                requestBody: body,
                messages:'Failed to create customer',
                dataType: 'SequentialCustomerAccountPortfolioCreatioResult',
                data: response
            }
            await saveResponseToSubmittion(resData, userId)
            return Response.json(resData, {status: 500})
        }
    
        if(response.accountCreation.status !== 'success'){
            const resData:NewPortfolioResponse = {
                status: 'partial failure',
                requestType: 'Create Portfolio',
                requestBody: body,
                messages:'Failed to create account',
                dataType: 'SequentialCustomerAccountPortfolioCreatioResult',
                data: response
            }
            await saveResponseToSubmittion(resData, userId)
            return Response.json(resData, {status: 500})
        }
    
        if(response.portfolioCreation.status !== 'success'){
            const resData:NewPortfolioResponse = {
                status: 'partial failure',
                requestType: 'Create Portfolio',
                requestBody: body,
                messages:'Failed to create portfolio',
                dataType: 'SequentialCustomerAccountPortfolioCreatioResult',
                data: response
            }
            await saveResponseToSubmittion(resData, userId)
            return Response.json(resData, {status: 500})
        }
    
        const resData:NewPortfolioResponse = {
            status: 'success',
            requestType: 'Create Portfolio',
            requestBody: body,
            messages:'Portfolio created successfully',
            dataType: 'SequentialCustomerAccountPortfolioCreatioResult',
            data: response
        }

        await saveResponseToSubmittion(resData, userId)
        return Response.json(resData, {status: 201})
    } catch(e){
        if((e as Error).name === 'Creation warning'){
            const resData:NewPortfolioResponse = {
                status: 'warning',
                requestType: 'Create Portfolio',
                requestBody: body,
                messages: (e as CreationWaring<any>).message,
                dataType: 'CairoCustomer',
                data: (e as CreationWaring<CairoCustomer>).data
            }
            //await saveResponseToSubmittion(resData, userId)
            return Response.json(resData, {status: 400})
        }

        const resData:NewPortfolioResponse = {
            status: 'error',
            requestType: 'Create Portfolio',
            requestBody: body,
            messages: 'Something whent wrong.',
            dataType: 'Error',
            data: e as Error
        }
        await saveResponseToSubmittion(resData, userId)
        return Response.json(resData, {status: 500})
    }
}