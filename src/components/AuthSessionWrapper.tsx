'use client'
import { SessionProvider } from "next-auth/react"
import { Suspense } from "react";
import React, { ReactNode } from 'react';
import { SessionRefresher } from "./SessionRefresher";


export default function AuthSessionWraper({children}:{ children: ReactNode}) {

    
    return (
        <SessionProvider>
            <Suspense fallback={<div>Loading session...</div>}>
                <SessionRefresher>
                    {children}
                </SessionRefresher>
            </Suspense>
        </SessionProvider>
    )
}