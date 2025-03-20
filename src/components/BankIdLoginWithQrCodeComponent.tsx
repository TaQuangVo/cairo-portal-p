"use client";
import React, { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import { RefreshCw } from "lucide-react";

export default function BankIdLoginWithQrCodeComponent({ transactionId, onComplete }: { transactionId: string, onComplete:(result:'SUCCESS'|'ERROR'|'CANCEL'|'FAILED'|'RETRY', data:TransactionResponseDTO|null)=>void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null)
  //const [qrData, setQrData] = useState<string>("");
  const [transactionData, setTransactionData] = useState<TransactionResponseDTO|null>(null)
  const [blueQrCode, setBlueQrCode] = useState<boolean>(false)
  const [timerIntervalId, setTimerIntervalId] = useState<NodeJS.Timeout>();
  const transactionIdMem = useRef('');

  useEffect(() => {
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
    console.log('start transction')
    try{
      const response  = await fetch("/api/auth/bankId/"+transactionId+"/start", {
          method: "GET",
      })

      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: TransactionResponseDTO = await response.json();
      return data

    }catch(e){
      return null
    }
  }

  const getTransaction = async () => {
    console.log('get transction')
    try{
      const response  = await fetch("/api/auth/bankId/"+transactionId, {
          method: "GET",
      })

      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: TransactionResponseDTO = await response.json();
      return data

    }catch(e){
      return null
    }
  }

  const complete = ( result:'SUCCESS'|'ERROR'|'CANCEL'|'FAILED'|'RETRY', data:TransactionResponseDTO|null) => {
    setBlueQrCode(true)

    onComplete(result, data)

    if(result == 'CANCEL'){
      clearInterval(timerIntervalId);
    }
  }

  const startLoginProgess = async() => {
    setBlueQrCode(false)

    const startTransactionData = await startTransaction();
    setTransactionData(startTransactionData);

    if(startTransactionData?.status != 'started'){
      console.log('error here')
      complete('ERROR', startTransactionData)
      return
    }

    const intervalId = setInterval(async() => {
      const getTransactionData = await getTransaction()
      console.log(getTransactionData)
      setTransactionData(getTransactionData)

      if(getTransactionData?.status == 'failed'){
        complete('FAILED', getTransactionData)
        clearInterval(intervalId);
        return
      }

      if(getTransactionData?.status == 'complete'){
        complete('SUCCESS', getTransactionData)
        clearInterval(intervalId);
        return
      }
    }, 1000);
    setTimerIntervalId(intervalId)
  }

  useEffect(() => {
    if (transactionIdMem.current != transactionId) {
        transactionIdMem.current = transactionId
        startLoginProgess();
    }
}, [transactionId]);

  useEffect(() => {
    if (qrCode && transactionData?.bankId?.qrData) {
      qrCode.update({
        data: transactionData?.bankId?.qrData,
      });
    }
  }, [transactionData, qrCode]);

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
      {blueQrCode 
        ? <p className="text-sm">QR code has expired. 
            <span className="cursor-pointer underline ml-0.5">
              <strong onClick={() => complete('RETRY', null)}>Retry</strong>
            </span>
          </p> 
        : <p className="text-sm">Scan the QR code using bankId app. 
            <span className="cursor-pointer underline ml-0.5">
              <strong onClick={() => complete('CANCEL', null)}>Cancel</strong>
            </span>
          </p>}
    </div>
  );
}
