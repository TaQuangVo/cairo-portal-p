import { fetCustomerByPersonalNumber } from "@/lib/cairo"
import { getTransaction, newTransaction, startTransaction } from "@/lib/scrive"
import { NextApiRequest, NextApiResponse } from "next"
import { getToken } from "next-auth/jwt"

const secret = process.env.NEXTAUTH_SECRET


export async function GET (req: NextApiRequest, res: NextApiResponse){
    const token = await getToken({ req })

    const me = await fetCustomerByPersonalNumber('20000507-4018')
    console.log(me)

    const sc = await newTransaction();
    const st = await startTransaction(sc.id);
    const ge = await getTransaction(sc.id);

    console.log('GETGE');
    console.log(token);

    return Response.json({messages:'Data saved successfully!'}, {status: 201})
}
//19460201-3213