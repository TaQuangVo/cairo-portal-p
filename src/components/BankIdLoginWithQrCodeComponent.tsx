"use client";
import React, { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import { RefreshCw } from "lucide-react";
import { redirect } from "next/navigation";

const MOBILE_BREAKPOINT = 768

export default function BankIdLoginWithQrCodeComponent({ transactionId, onComplete }: { transactionId: string, onComplete:(result:'SUCCESS'|'ERROR'|'CANCEL'|'FAILED'|'RETRY', data:TransactionResponseDTO|null, message: string)=>void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null)
  const [transactionData, setTransactionData] = useState<TransactionResponseDTO|null>(null)
  const [blueQrCode, setBlueQrCode] = useState<boolean>(false)
  const [timerIntervalId, setTimerIntervalId] = useState<NodeJS.Timeout>();
  const transactionIdMem = useRef(''); // used to prevent double rendering, will cause staring transaction faild

  const isUserAgentMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
  const isNarrowScreen = window.innerWidth < MOBILE_BREAKPOINT
  const isMobile = isUserAgentMobile || isNarrowScreen

  useEffect(() => {
    if(isMobile){
      return
    }
    const qr = new QRCodeStyling({
      width: 300,
      height: 300,
      dotsOptions: {
        color: "#171717",
        type: "rounded",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 20,
      },
    });

    setQrCode(qr);

    if (ref.current && qr) {
      qr.append(ref.current);
    }
  }, []);

  const startTransaction = async () => {
    try{
      const response  = await fetch("/api/auth/bankId/"+transactionId+"/start", {
          method: "GET",
      })

      if (!response.ok) {
        complete('ERROR', null, 'Failed to start BankID transaction')
        return null
      }

      const data: TransactionResponseDTO = await response.json();
      return data

    }catch(e){
      complete('ERROR', null, 'Failed to start BankID transaction')
      return null
    }
  }

  const getTransaction = async () => {
    try{
      const response  = await fetch("/api/auth/bankId/"+transactionId, {
          method: "GET",
      })

      if (!response.ok) {
        complete('ERROR', null, 'Failed to get BankID transaction')
        return null
      }

      const data: TransactionResponseDTO = await response.json();
      return data

    }catch(e){
        complete('ERROR', null, 'Failed to get BankID transaction')
      return null
    }
  }

  const complete = ( result:'SUCCESS'|'ERROR'|'CANCEL'|'FAILED'|'RETRY', data:TransactionResponseDTO|null, message:string) => {
    setBlueQrCode(true)

    onComplete(result, data, message)

    if(timerIntervalId){
      clearInterval(timerIntervalId);
    }
  }

  const startLoginProgess = async() => {
    setBlueQrCode(false)

    const startTransactionData = await startTransaction();
    setTransactionData(startTransactionData);

    if(startTransactionData?.status != 'started'){
      complete('ERROR', startTransactionData, 'Something gone wrong, try again later')
      return
    }

    const intervalId = setInterval(async() => {
      const getTransactionData = await getTransaction()
      setTransactionData(getTransactionData)

      if(getTransactionData?.status == 'failed'){
        complete('FAILED', startTransactionData, 'Authorization failed, try again later')
        clearInterval(intervalId);
        return
      }

      if(getTransactionData?.status == 'complete'){
        complete('SUCCESS', startTransactionData, 'Authorization process successed')
        clearInterval(intervalId);
        return
      }
    }, 1000);
    setTimerIntervalId(intervalId)


    if(isMobile){
      redirect(`bankid:///?autostarttoken=${startTransactionData.bankId?.autoStartToken}`)
    }
  }

  useEffect(() => {
    if (transactionIdMem.current != transactionId) {
        transactionIdMem.current = transactionId
        startLoginProgess();
    }
}, [transactionId]);

  useEffect(() => {
    if (!isMobile && qrCode && transactionData?.bankId?.qrData) {
      qrCode.update({
        data: transactionData?.bankId?.qrData,
      });
    }
  }, [transactionData, qrCode]);

  if(isMobile){
    return(
      <div className="text-sm">
        {!transactionData  || transactionData.status == 'new' ?
          <p>Initiating BankID login process...</p>
          : transactionData.status == 'started' ?
              <p>Complete the login in the BankID app...</p>
          : transactionData.status == 'failed' ?
              <p>Obss... Something gone wrong</p>
          : transactionData.status == 'complete' ?
              <p>You are being logged in...</p>
          : 
          <p>Obss... Something gone wrong</p>
        }
    </div>
    )
  }

  return (
    <div>
      <div className="relative">
        <div ref={ref} />
        {
          blueQrCode && 
          <div className="absolute flex justify-center items-center top-0 left-0 w-full h-full backdrop-blur-sm" >
            
            <div  className="cursor-pointer hover:stroke-black flex flex-col items-center">
              <RefreshCw color="#ffffff"/>
            </div>
          </div>
        }
      </div>
      {(transactionData && blueQrCode)
        ? <p className="text-sm">QR code has expired. 
            <span className="cursor-pointer underline ml-0.5">
              <strong onClick={() => complete('RETRY', null, 'Retrying...')}>Retry</strong>
            </span>
          </p> 
        : (transactionData && ! blueQrCode) 
        ? <p className="text-sm">Scan the QR code using bankId app. 
            <span className="cursor-pointer underline ml-0.5">
              <strong onClick={() => complete('CANCEL', null, 'BankID process canceled')}>Cancel</strong>
            </span>
          </p>
        : 
        <span>
        </span>
      }
    </div>
  );
}
