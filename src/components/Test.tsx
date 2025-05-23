'use client'
import { signIn } from "next-auth/react"
import React from 'react';


export default function Test() {
    const onLogin = () => {
        signIn()
    }

    const onGet = async() => {
        const response  = await fetch("/api/auth/test", {
            method: "GET",
        })
    }

    const onGetBySSN = async() => {
        const response  = await fetch("/api/users?personalNumber=20000507-4018", {
            method: "GET",
        })
        if (response.ok) {
            const data = await response.json();  // This will parse the JSON body
        } else {
            console.error('Error:', response.status);
        }
    }

    const onCreateUser = async() => {
        const user = {
            personalNumber: '19460201-3213',
            givenName: 'Ta Quang',
            surname: 'Vo'
        }
        const response  = await fetch("/api/users", {
            method: "POST",
            body: JSON.stringify(user),
        })
    }
    
    return (
        <div>
            <button onClick={onLogin}>login</button>
            <button onClick={onGet}>get</button>
            <button onClick={onCreateUser}>CreateUser</button>
            <button onClick={onGetBySSN}>GetbySSN</button>
        </div>
    )
}