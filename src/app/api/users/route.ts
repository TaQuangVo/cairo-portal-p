import { NextRequest, NextResponse } from "next/server"
import { createUser, getUserById, getUserByPersonalNumber, getUsers, updateUser } from "@/services/userService"
import { DBUser, UserCreate, UserUpdate } from "@/lib/dbType"

export async function GET (req: NextRequest, res: NextResponse){
    const personalNumber = req.nextUrl.searchParams.get('personalNumber');

    if(personalNumber){
        const user = await getUserByPersonalNumber(personalNumber)
        if(!user){
            return Response.json({messages:'User not found'}, {status: 404})
        }
        return Response.json(user, {status: 200})
    }

    try{
        const users = await getUsers()
        return Response.json(users, {status: 200})
    }catch(e){
        return Response.json({messages:(e as Error).message}, {status: 500})
    }
}

export async function POST (req: NextRequest, res: NextResponse){
    const body = await req.json()
    try{
        verifyBodyUserCreate(body)
    }catch(e){
        return Response.json({messages:(e as Error).message}, {status: 400})
    }

    const newUser = toUserCreate(body)

    try{
        await createUser(newUser)
    }catch(e){
        return Response.json({messages:(e as Error).message}, {status: 500})
    }


    return Response.json({messages:'Data saved successfully!'}, {status: 201})
}

export async function PATCH (req: NextRequest, res: NextResponse){
    const body = await req.json()
    try{
        verifyBodyUserUpdate(body)
    }catch(e){
        return Response.json({messages:(e as Error).message}, {status: 400})
    }

    const user = await getUserById(body._id)

    if(!user){
        return Response.json({messages:'User not found'}, {status: 404})
    }

    const userUpdate = toUserUpdate(user, body)

    try{
        const updatedUser = await updateUser(userUpdate)
        return Response.json(updatedUser, {status: 200})
    }catch(e){
        return Response.json({messages:(e as Error).message}, {status: 500})
    }
} 

function verifyBodyUserCreate(body: any){
    if(!body.personalNumber){
        throw new Error('Personal number is required')
    }
}

function verifyBodyUserUpdate(body: any){
    if(!body._id){
        throw new Error('Id is required')
    }
}

function toUserUpdate(user: DBUser, body: any): DBUser{
    return {
        _id: body._id,
        personalNumber:body.personalNumber ?? user.personalNumber,
        isActive: body.isActive ?? user.isActive,
        role: body.role ?? user.role,
    
        email: body.email ?? user.email,
        givenName: body.givenName ?? user.givenName,
        surname: body.surname ?? user.surname,
        phoneNumber: body.phoneNumber ?? user.phoneNumber,

        createdAt: user.createdAt,
        updatedAt: new Date(),
    }
}

function toUserCreate(body: any): UserCreate{
    return {
        personalNumber:body.personalNumber,
        isActive: true,
        role: 'user',
    
        email: body.email,
        givenName: body.givenName,
        surname: body.surname,
        phoneNumber: body.phoneNumber ?? undefined,
    }
}