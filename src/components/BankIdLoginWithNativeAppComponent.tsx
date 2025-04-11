import { useEffect, useState } from "react";
import { redirect } from 'next/navigation'


export default function BankIdLoginWithNativeAppComponent({ transactionId, completedTransactionId, onComplete }: { transactionId: string|null, completedTransactionId: string|null, onComplete:(result:'SUCCESS'|'ERROR'|'CANCEL'|'FAILED'|'RETRY', data:TransactionResponseDTO|null)=>void }) {
    const [transactionData, setTransactionData] = useState<TransactionResponseDTO|null>(null)
    const [error, setError] = useState<string>('')

    const startTransaction = async () => {
        try{
          const response  = await fetch("/api/auth/bankId/"+transactionId+"/start", {
              method: "GET",
          })
    
          if (!response.ok) {
            return null
          }
    
          const data: TransactionResponseDTO = await response.json();
          return data
    
        }catch(e){
            return null
        }
    }


    const getTransaction = async (completedTransactionId:string) => {
        try{
          const response  = await fetch("/api/auth/bankId/"+completedTransactionId, {
              method: "GET",
          })
    
          if (!response.ok) {
            return null
          }
    
          const data: TransactionResponseDTO = await response.json();
          return data
    
        }catch(e){
            return null
        }
    }

  const complete = ( result:'SUCCESS'|'ERROR'|'CANCEL'|'FAILED'|'RETRY', data:TransactionResponseDTO|null) => {
    onComplete(result, data)
    setTransactionData(data)

    if(result == 'CANCEL'){
        console.log('User cancelled')
    }
  }

    const startLoginProgess = async() => {
        setError('') 
        const startTransactionData = await startTransaction();

        if(startTransactionData?.status !== 'started' || !startTransactionData?.bankId?.autoStartToken){
            complete('ERROR', startTransactionData)
            setError('Failed to start BankID session.')
            return
        }

        setTransactionData(startTransactionData);

        console.log('redirect' + startTransactionData.bankId?.autoStartToken)
        redirect(`bankid:///?autostarttoken=${startTransactionData.bankId?.autoStartToken}`)
    }


    const handleCompletedTransaction = async (completedTransactionId:string) => {
        const getTransactionData = await getTransaction(completedTransactionId)
        if(!getTransactionData?.status || getTransactionData?.status !== 'complete'
        ){
            setError('Failed to authenticate, try again later.')
            complete('FAILED', null)
            return
        }

        complete('SUCCESS', getTransactionData)
        return
    }
    
    useEffect(() => {
        if(completedTransactionId){
            handleCompletedTransaction(completedTransactionId)
            return
        }
        startLoginProgess();
    }, [transactionId, completedTransactionId]);

    if(error !== ''){
        return (
            <div>
                <p>{error}</p>
            </div>
        )
    }

    if(transactionId && !completedTransactionId){ //user pressed login button with personal number
        return (
            <>
                {!transactionData  || transactionData.status == 'new' ?
                        <p>Initiating BankID login process...</p>
                    : transactionData.status == 'started' ?
                        <p>Complete the login in the BankID app...</p>
                    : transactionData.status == 'failed' ?
                        <p>Obss... Something gone wrong, FAILED222</p>
                    : transactionData.status == 'complete' ?
                        <p>Obss... Something gone wrong, COMPLETED222</p>
                    : 
                        <p>Obss... Something gone wrong</p>
                }
            </>
        )
    }

    if(completedTransactionId){ //user got redirected from bankId app
        return (
            <>
                {!transactionData ?
                    <p>Please wait...</p>
                : transactionData.status == 'new' ?
                    <p>Obss... Something gone wrong, NEW</p>
                : transactionData.status == 'started' ?
                    <p>Obss... Something gone wrong, STARTED</p>
                : transactionData.status == 'failed' ?
                    <p>Failed to authenticate, try gain later. FAILED</p>
                : transactionData.status == 'complete' ?
                    <p>Authentication process successed, you are being logged in...</p>
                : 
                    <p>Obss... Something gone wrong</p>
                }
            </>
        )
    }

    if(!completedTransactionId && !transactionId){
        return <p>Obss... completedTransactionId and transactionId are null</p>
    }


    return (
        <div>
            <p>Obss... Something gone wrong, try again later.</p>
            <p>transactionId {transactionId}</p>
            <p>completedTransactionId {completedTransactionId}</p>
            <p>data {transactionData === null}</p>
            <p>status {transactionData?.status}</p>
        </div>
    )
}