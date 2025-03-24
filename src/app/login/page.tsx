"use client"
import { useRouter } from 'next/navigation'
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
import { X } from 'lucide-react';
import Link from 'next/link';

type CurrentTransaction = {
  id:string,
  status: 'new'|'started'|'complete'|'failed',
  data:any
}

export default function InputWithButton() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [currentTransaction, setCurrentTransaction] = useState<CurrentTransaction|null>(null)
  const [ssn, setSsn] = useState<string>('')
  const [disableButon, setDisableButton] = useState<boolean>(false)

    // Mark async function properly and define return type as Promise<void>
    const onBankIdComplete = async (
      result: 'SUCCESS' | 'ERROR' | 'CANCEL' | 'FAILED' | 'RETRY', 
      data: TransactionResponseDTO | null
    ): Promise<void> => {
      console.log(result)
      console.log(data)

      // Handle different result cases
      if (result === 'CANCEL') {
          setCurrentTransaction(null)
      }
      if (result === 'RETRY') {
          handleGetLoginSession()
      }
      if (result === 'SUCCESS') {
          if (!currentTransaction?.id) {
            setError('Some error occured')
              return
          }
          const signInResult = await signIn("credentials", {
              redirect: false,
              transactionId: currentTransaction.id,
          })
          if (signInResult?.error) {
              setError('Sign-in failed')
          }
          if (signInResult?.ok) {
            console.log('Sign-in success')
            router.push('/')
          }
      }

      setDisableButton(false)
  }

    const handleGetLoginSession = async () => {
      setDisableButton(true)

      const pattern = /^\d{8}-\d{4}$/;
      if(!pattern.test(ssn)){
        console.log('invalidssn' + ssn.length)
        setError('Invalid swedish social security number1.');
        setDisableButton(false)
        return;
      }

      setError('');
      try{

        //Check if user is registered in our system
        const userResponse  = await fetch("/api/users?personalNumber=" + ssn, {
            method: "GET",
        })
        if (userResponse.ok) {
            const data = await userResponse.json();  // This will parse the JSON body
            console.log(data);  // Logs the parsed JSON object
        } else {
            setError('You are not registered in our system.');
            setDisableButton(false)
            return
        }

        //Start new transaction
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
    <div className="w-screen h-svh flex justify-center items-center flex-col">
      <div className='flex items-center font-semibold text-xl mb-10 underline'>
        <Link href='https://peakam.se/'>PEAK</Link>
        <X />
        <Link href='https://sakra.se/sv/'>SÄKRA</Link>
        <X />
        <Link href='https://centevo.se/'>CENTEVO</Link>
      </div>
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
            </div>
          </div>
      </CardContent>
    </Card>
    </div>
  )
}