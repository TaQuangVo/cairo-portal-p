"use client";
import React, { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";

export default function QrCodeViewer({ transactionId, onComplete }: { transactionId: string, onComplete:(result:'SUCCESS'|'ERROR'|'CANCEL', data:any)=>void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null);
  const [qrData, setQrData] = useState<string>("");
  const [isTimeout, setIsTimeout] = useState<boolean>(false);

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

  useEffect(() => {
    if (isTimeout) return; // Stop updating if timeout is reached

    setQrData(createRandomString());
    const intervalId = setInterval(() => {
      setQrData(createRandomString());
    }, 1000);

    // Timeout after 30 seconds
    const timeoutId = setTimeout(() => {
      setIsTimeout(true);
      clearInterval(intervalId); // Stop updating QR data
    }, 30000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [transactionId, isTimeout]);

  function createRandomString() {
    const chars = "bankid.84407fe2-4ecf-46fc-93d5-c22c41a9055c.49.5381e71a110da4b6d7619aa902c5d9ae6063372fb13e2c0889d8b8780955518b";
    let result = "";
    for (let i = 0; i < chars.length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  useEffect(() => {
    if (qrCode && qrData) {
      qrCode.update({
        data: qrData,
      });
    }
  }, [qrData, qrCode]);

  return (
    <div>
      <div ref={ref} />
      {isTimeout 
        ? <p className="text-sm">QR code has expired. Please refresh.</p> 
        : <p className="text-sm">Scan the QR code using bankId app on your phone.</p>}
    </div>
  );
}
