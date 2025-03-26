import { NextRequest, NextResponse } from "next/server"
import { createUser, getUserById, getUserByPersonalNumber, getUsers, updateUser } from "@/services/userService"
import { DBUser, UserCreate, UserUpdate } from "@/lib/db.type"
import { toUserCreate, toUserUpdate, verifyBodyUserUpdate } from "./helper";

export async function GET (req: NextRequest){
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

export async function POST (req: NextRequest){
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

export async function PATCH (req: NextRequest){
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
    if(!body.isActive){
        throw new Error('isActive is required')
    }
    if(!body.role){
        throw new Error('Role is required')
    }
}
