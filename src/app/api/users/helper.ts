import { DBUser, UserCreate } from "@/lib/db.type"
import { convertPersonalNumber } from "@/utils/stringUtils"

const avalableRoles = ['admin', 'user']

export function verifyBodyUserUpdate(body: any){
    if(!body._id){
        throw new Error('Id is required')
    }
    if(!body.personalNumber){
        convertPersonalNumber(body.personalNumber)
    }
    if(body.role && !avalableRoles.includes(body.role)){
        throw new Error('Role is not valid')
    }
}

export function toUserUpdate(user: DBUser, body: any): DBUser{
    return {
        _id: body._id,
        personalNumber:body.personalNumber ?? convertPersonalNumber(user.personalNumber),
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

export function toUserCreate(body: any): UserCreate{
    return {
        personalNumber:body.personalNumber,
        isActive: body.isActive,
        role: body.role,
    
        email: body.email,
        givenName: body.givenName,
        surname: body.surname,
        phoneNumber: body.phoneNumber,
    }
}


export function verifyBodyUserCreate(body: any){
    if(!body.personalNumber){
        convertPersonalNumber(body.personalNumber)
    }
    if(!body.isActive){
        throw new Error('isActive is required')
    }
    if(!body.role){
        throw new Error('Role is required')
    }
    if(!avalableRoles.includes(body.role)){
        throw new Error('Role is not valid')
    }
}