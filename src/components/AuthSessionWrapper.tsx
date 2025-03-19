'use client'
import { SessionProvider } from "next-auth/react"
import { Suspense } from "react";
import React, { ReactNode } from 'react';


export default function AuthSessionWraper({children}:{ children: ReactNode}) {

    
    return (
        <SessionProvider>
            <Suspense fallback={<div>Loading session...</div>}>
            {children}
            </Suspense>
        </SessionProvider>
    )
}