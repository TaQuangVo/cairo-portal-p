import { NextRequest, NextResponse } from "next/server"
import { CustomerAccountPortfolioCreationPayload, customerAccountPortfolioCreationPayloadSchema, payloadToRequestBodies} from "./helper"
import { createCustomerAccountPortfolio, CreationWaring } from "@/services/cairoService"
import { ZodError } from "zod"

// POST /api/submittions/portfolios
export async function POST (req: NextRequest, res: NextResponse){
    const body = await req.json()

    let payload:CustomerAccountPortfolioCreationPayload
    try{
        payload = customerAccountPortfolioCreationPayloadSchema.parse(body)
    }catch(e){
        return Response.json({
            status: 'failed',
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
        const response = await createCustomerAccountPortfolio(cairoCustomer, cairoAccount, cairoPortfolio, [])

        if(response.customerCreation.status !== 'success'){
            return Response.json({
                status: 'failed',
                messages:'Failed to create customer',
                datatType: 'SequentialCustomerAccountPortfolioCreatioResult',
                data: response
            }, {status: 500})
        }
    
        if(response.accountCreation.status !== 'success'){
            return Response.json({
                status: 'partial failed',
                messages:'Failed to create account',
                datatType: 'SequentialCustomerAccountPortfolioCreatioResult',
                data: response
            }, {status: 500})
        }
    
        if(response.portfolioCreation.status !== 'success'){
            return Response.json({
                status: 'partial failed',
                messages:'Failed to create portfolio',
                datatType: 'SequentialCustomerAccountPortfolioCreatioResult',
                data: response
            }, {status: 500})
        }
    
        return Response.json({
            status: 'success',
            messages:'Customer, Account and Portfolio created successfully',
            datatType: 'SequentialCustomerAccountPortfolioCreatioResult',
            data: response
        }, {status: 201})
    } catch(e){
        if((e as Error).name === 'Creation warning'){
            return Response.json({
                status: 'warning',
                messages: (e as CreationWaring<any>).message,
                datatType: 'CairoCustomer',
                data: (e as CreationWaring<any>).data
            }, {status: 400})
        }

        return Response.json({
            status: 'error',
            messages: 'Something whent wrong.',
            datatType: 'Error',
            data: e
        }, {status: 500})
    }
}