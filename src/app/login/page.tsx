"use client"
import { useRouter, useSearchParams } from 'next/navigation'
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
import { FormEvent, useState } from "react";
import Link from 'next/link';
import { convertPersonalNumber } from '@/utils/stringUtils';
import Image from 'next/image';

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
  const searchParams = useSearchParams();


    // Mark async function properly and define return type as Promise<void>
    const onBankIdComplete = async (
      result: 'SUCCESS' | 'ERROR' | 'CANCEL' | 'FAILED' | 'RETRY', 
      data: TransactionResponseDTO | null,
      message: string
    ): Promise<void> => {

      if (result === 'ERROR') {
        setError(message)
      }      
      if (result === 'FAILED' && data) {
        setCurrentTransaction({
          id: data.id,
          status: data.status,
          data: data
        })
        setError(message)
      }
      if (result === 'CANCEL') {
        setError(message)
        setCurrentTransaction(null)
      }
      if (result === 'RETRY') {
        setError(message)
        handleGetLoginSession(null)
      }
      if (result === 'SUCCESS' && data) {
        setCurrentTransaction({
          id: data.id,
          status: data.status,
          data: data
        })
        if (!data?.id) {
          setError('Some error occured')
            return
        }
        const signInResult = await signIn("credentials", {
            redirect: false,
            transactionId: data.id,
        })
        if (signInResult?.error) {
            setError('Sign-in failed')
        }
        if (signInResult?.ok) {
          const redirectTo = decodeURIComponent(searchParams.get('redirect') || '/dashboard');
          router.push(redirectTo)
        }
      }
      setDisableButton(false)
  }

    const handleGetLoginSession = async (e: FormEvent<HTMLFormElement>|null) => {
      if(e){
        e.preventDefault()
      }
      setDisableButton(true)

      let verifiedSSN
      try{
        verifiedSSN = convertPersonalNumber(ssn)
        if(verifiedSSN != ssn){
          setSsn(verifiedSSN)
        }
      }catch(e){
        setError('Invalid swedish social security number.');
        setDisableButton(false)
        return
      }

      setError('');
      try{
        //Check if user is registered in our system
        const userResponse  = await fetch("/api/users?personalNumber=" + verifiedSSN, {
            method: "GET",
        })
        if (userResponse.ok) {
            const data = await userResponse.json();  // This will parse the JSON body
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
          setDisableButton(false)
          return setError('Something gone wrong, try again later.');
        }

        const data: NewTransactionResponse = await response.json();
        setCurrentTransaction({
          id:data.id,
          status: 'new',
          data: null
        })

        }catch(e){
          setDisableButton(false)
        }
    }


  return (
    <div className="w-screen h-svh flex justify-center items-center flex-col relativ">
      <div className='font-semibold mb-7 text-2xl flex items-center'>
        <Image src="/skra_logo.png" alt="Hero" width={30} height={30} />
        <p className='ml-2'>Säkra secure.</p>
      </div>
      <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Login with BankId</CardTitle>
        <CardDescription>Fill in social security number and continue with BankId</CardDescription>
      </CardHeader>
      <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="socialSecurityNumber">Social security number</Label>
                <form onSubmit={e=>handleGetLoginSession(e)} className="flex">
                  <Input id="socialSecurityNumber" type="text"  placeholder="xxxxxxxx-xxxx" value={ssn} onChange={e=>setSsn(e.currentTarget.value)} onBlur={(e => {
                            const value = e.target.value
                            try{
                                const formatedValue = convertPersonalNumber(value)
                                setSsn(formatedValue)
                            }catch(e){
                            }
                        })}/>
                  <Button type='submit' disabled={disableButon} className="ml-2">
                    <Image src="/bankid-icon.svg" alt="Hero" width={28} height={28} />
                    BankId
                  </Button>
                </form>
              <p className="text-sm text-red-600">{error}</p>
              <div className='flex justify-end mt-4'>
                <Link className='inline' href='/'><p className="inline text-sm text-right mt-5 hover:underline cursor-pointer">Back to home page.</p></Link>
              </div>
              {
                (currentTransaction) &&
                <BankIdLoginWithQrCodeComponent onComplete={onBankIdComplete} transactionId={currentTransaction.id}/>
              }
            </div>
          </div>
      </CardContent>
    </Card>
    </div>
  )
}