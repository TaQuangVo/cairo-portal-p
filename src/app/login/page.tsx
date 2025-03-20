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
import BankIdLoginWithQrCodeComponent from "@/components/BankIdLoginWithQrCodeComponent";
import { useState } from "react";

type CurrentTransaction = {
  id:string,
  status: 'new'|'started'|'complete'|'failed',
  data:any
}

export default function InputWithButton() {
    const [error, setError] = useState('')
    const [currentTransaction, setCurrentTransaction] = useState<CurrentTransaction|null>(null)
    const [ssn, setSsn] = useState<String>('')
    const [disableButon, setDisableButton] = useState<boolean>(false)

    function onBankIdComplete(result:'SUCCESS'|'ERROR'|'CANCEL'|'FAILED'|'RETRY', data:TransactionResponseDTO|null){
        console.log(result)
        console.log(data)
        if(result == 'CANCEL'){
          setCurrentTransaction(null)
        }
        if(result == 'RETRY'){
          handleGetLoginSession()
        }
        setDisableButton(false)
    }

    const handleGetLoginSession = async () => {
      setDisableButton(true)
      if(ssn.length != 13){
        console.log('invalidssn' + ssn.length)
        setError('Invalid swedish social security number.');
        setDisableButton(false)
        return;
      }

      setError('');
      try{
        //check if user can with ssn can login

        const response  = await fetch("/api/auth/bankId/new", {
            method: "GET",
        })

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: NewTransactionResponse = await response.json();
        console.log(data)
        setCurrentTransaction({
          id:data.id,
          status: 'new',
          data: null
        })

        }catch(e){
          console.log('Något gått fell')
          setDisableButton(false)
        }
    }


  return (
    <div className="w-screen h-svh flex justify-center items-center">
        <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Login with BankId</CardTitle>
        <CardDescription>Fill in Social security number and continues with BankId</CardDescription>
      </CardHeader>
      <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="socialSecurityNumber">Social security number</Label>
              <div className="flex">
                <Input id="socialSecurityNumber" type="text"  placeholder="xxxxxxxx-xxxx" onChange={e=>setSsn(e.currentTarget.value)}/>
                <Button disabled={disableButon} onClick={handleGetLoginSession} className="ml-2">BankId</Button>
              </div>
              <p className="text-sm text-red-600">{error}</p>
              <p className="text-sm text-right mt-5 hover:underline cursor-pointer">Back to home page.</p>
              {
                currentTransaction && 
                <BankIdLoginWithQrCodeComponent onComplete={onBankIdComplete} transactionId={currentTransaction.id}/>
              }
              {//<Button onClick={getToken}>test</Button>
              }
            </div>
          </div>
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