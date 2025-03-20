'use client'
import { SessionProvider, signIn } from "next-auth/react"
import { Suspense } from "react";
import React, { ReactNode } from 'react';


export default function Test() {
    const onLogin = () => {
        signIn()
    }

    const onGet = async() => {
        const response  = await fetch("/api/auth/test", {
            method: "GET",
        })
    }

    
    return (
        <div>
            <button onClick={onLogin}>login</button>
            <button onClick={onGet}>get</button>
        </div>
    )
}