import { NextRequest } from "next/server"
import { createUser, getUserById, getUserByPersonalNumber, getUsers, searchUsersByPersonalNumber, updateUser } from "@/services/userService"
import { toUserCreate, toUserUpdate, verifyBodyUserCreate, verifyBodyUserUpdate } from "./helper";
import { getToken } from "next-auth/jwt";
import { convertPersonalNumber } from "@/utils/stringUtils";

export async function GET (req: NextRequest){
    console.log('hello')
    let personalNumber = req.nextUrl.searchParams.get('personalNumber');
    let searchPersonalNumber = req.nextUrl.searchParams.get('searchPersonalNumber');
    let id = req.nextUrl.searchParams.get('id');
    const page = parseInt(req.nextUrl.searchParams.get("page") ?? "0");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "10");

    if(id){
        try{
            const user = await getUserById(id)

            if(!user){
                return Response.json({messages:'User not found'}, {status: 404})
            }

            return Response.json(user, {status: 200})
        }catch(e){
            return Response.json({messages:(e as Error).message}, {status: 500})
        }
    }

    if(personalNumber){
        try{
            personalNumber = convertPersonalNumber(personalNumber)
            const user = await getUserByPersonalNumber(personalNumber)
    
            if(!user){
                return Response.json({messages:'User not found'}, {status: 404})
            }
            return Response.json(user, {status: 200})
        }catch(e){
            return Response.json({messages:(e as Error).message}, {status: 400})
        }
    }

    const token = await getToken({ req })
    if(!token || token.role !== 'admin'){
        return Response.json({messages:'Not authenticated.'}, {status: 403})
    }

    if(searchPersonalNumber){
        console.log("Search for: " + searchPersonalNumber)
        console.log("Search for page: " + page)
        console.log("Search for limit: " + limit)
        try{
            const user = await searchUsersByPersonalNumber(searchPersonalNumber, page, limit)
            return Response.json(user, {status: 200})
        }catch(e){
            return Response.json({messages:(e as Error).message}, {status: 500})
        }
    }


    try{
        const users = await getUsers(page, limit)
        return Response.json(users, {status: 200})
    }catch(e){
        return Response.json({messages:(e as Error).message}, {status: 500})
    }

}

export async function POST (req: NextRequest){
    const token = await getToken({ req })
    if(!token || token.role !== 'admin'){
        return Response.json({messages:'Not authenticated.'}, {status: 403})
    }

    const body = await req.json()
    try{
        verifyBodyUserCreate(body)
    }catch(e){
        return Response.json({messages:(e as Error).message}, {status: 400})
    }

    try{
        const personalNumber = convertPersonalNumber(body.personalNumber)
        const user = await getUserByPersonalNumber(personalNumber)
        if(user){
            return Response.json({messages:'User with the same personnal number already exists'}, {status: 409})
        }

        const newUser = toUserCreate(body)
        await createUser(newUser)

        return Response.json({messages:'Data saved successfully!'}, {status: 201})
    }catch(e){
        return Response.json({messages:(e as Error).message}, {status: 500})
    }
}

export async function PATCH (req: NextRequest){
    const token = await getToken({ req })
    if(!token){
        return Response.json({messages:'Not authenticated.'}, {status: 403})
    }

    const body = await req.json()
    try{
        verifyBodyUserUpdate(body)
    }catch(e){
        return Response.json({messages:(e as Error).message}, {status: 400})
    }

    try{
        const user = await getUserById(body._id)
        if(!user){
            return Response.json({messages:'User not found'}, {status: 404})
        }
    
        const userUpdate = toUserUpdate(user, body, token.role === 'admin')

        const updatedUser = await updateUser(userUpdate)
        return Response.json(updatedUser, {status: 200})
    }catch(e){
        return Response.json({messages:(e as Error).message}, {status: 500})
    }
} 