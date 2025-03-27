import { fetchCustomerByPersonalNumber } from "@/lib/cairo"
import { getTransaction, newTransaction, startTransaction } from "@/lib/scrive"
import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

const secret = process.env.NEXTAUTH_SECRET


export async function GET (req: NextRequest){
    const token = await getToken({ req })

    const me = await fetchCustomerByPersonalNumber('20000507-4018')

    const sc = await newTransaction();
    const st = await startTransaction(sc.id);
    const ge = await getTransaction(sc.id);

    return Response.json({messages:'Data saved successfully!'}, {status: 201})
}
//19460201-3213