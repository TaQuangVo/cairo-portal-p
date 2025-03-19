"use client"
import { signIn } from "next-auth/react";
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import QrCodeViewer from "@/components/QrCodeViewer";
import { FormEvent } from "react";

export default function InputWithButton() {

    function onBankIdComplete(result:'SUCCESS'|'ERROR'|'CANCEL', data:any){
        console.log(result)
        console.log(data)
    }
    const getToken = async () => {
        const response  = await fetch("/api/auth/test", {
            method: "GET",
        })
        console.log(response)
    }

  return (
    <div className="w-screen h-svh flex justify-center items-center">
        <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Login with BankId</CardTitle>
        <CardDescription>Fill in Social security number and continues with BankId</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="socialSecurityNumber">Social security number</Label>
              <div className="flex">
                <Input id="socialSecurityNumber" placeholder="xxxxxxxx-xxxx" />
                <Button className="ml-2">BankId</Button>
              </div>
              <QrCodeViewer onComplete={onBankIdComplete} transactionId='bankid.84407fe2-4ecf-46fc-93d5-c22c41a9055c.49.5381e71a110da4b6d7619aa902c5d9ae6063372fb13e2c0889d8b8780955518b'></QrCodeViewer>
              <Button onClick={getToken}>test</Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
    </div>
  )
}


    
/*
"use client";

import { signIn, signOut } from "next-auth/react";
import { FormEvent } from "react";
import { useState } from "react";
import { useSession } from "next-auth/react"
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginForm() {
    const { data: session, status } = useSession()
    const pathname = usePathname()

    const [input, setInput] = useState({
        ssn:'',
        pwd:''
    });

    console.log(session);

    const onSubmit = async (e:FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const result = await signIn("credentials", {
            redirect: false,
            username: input.ssn,
            password: input.pwd,
          });
      
          if (result?.error) {
            console.log('res'+result.error)
          } else {
            console.log('hmmm....')
          }

          console.log(session);
    }
    
    const getToken = async () => {
        const response  = await fetch("/api/auth/test", {
            method: "GET",
        })

        console.log(response)
    }

    const onChange = (e: React.ChangeEvent<HTMLInputElement >) => {
        const newValue = e.currentTarget.value;
        const name = e.currentTarget.name;

        setInput({
            ...input,
            [name]:newValue,
        })
      }

    return (

        
        export function InputWithButton() {
          return (
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input type="email" placeholder="Email" />
              <Button type="submit">Subscribe</Button>
            </div>
          )
        }
        
    )
}*/