'use client'
import { NewPortfolioResponse } from "@/app/api/submittions/portfolios/helper"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import ClipLoader from "react-spinners/ClipLoader";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { CircleAlert, CircleCheck, CircleX, Copy, Terminal } from "lucide-react";
import { SequentialCustomerAccountPortfolioCreatioResult } from "@/services/cairoService";
import { Textarea } from "./ui/textarea";
import { Separator } from "@/components/ui/separator"
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Switch } from "./ui/switch";


export default function NewPortfolioSubmittionResult({ data, onCloseButtonPress }: { data: NewPortfolioResponse | null, onCloseButtonPress: () => void }) {
    if (!data) {
        return (
            <>
                <DialogHeader>
                    <DialogTitle>Create New Portfolio</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col justify-center items-center h-50 w-full">
                    <ClipLoader />
                </div>
            </>
        )
    }

    const [reportMessage, setReportMessage] = useState('');
    const [sendingReport, setSendingReport] = useState(false);
    const [ccMe, setCcMe] = useState(false);
    

    async function sendReportData() {
        setSendingReport(true);
        const response = await fetch("/api/reports", {
            method: "POST",
            body: JSON.stringify({
                type: 'Create Portfolio Submittion Failure',
                message: reportMessage,
                attachmentData: data,
                ccMe: ccMe 
            }),
        })

        if (response.ok) {
            toast.success("Report sent sussessfully", { icon: <CircleCheck />})  
        } else {
            toast.error("Failed to send report, something went wrong!", { icon: <CircleCheck />})
            setSendingReport(false)
        }
    }


    if (data.status == 'success' || data.status === 'partial failure' || data.status === 'failed') {

        const stepResult = data.data as SequentialCustomerAccountPortfolioCreatioResult
        const customerCreation = stepResult.customerCreation
        const accountCreation = stepResult.accountCreation
        const portfolioCreation = stepResult.portfolioCreation
        console.log(stepResult)

        return (
            <>
                <DialogHeader>
                    <DialogTitle>Create New Portfolio</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="w-full">
                    {
                        stepResult.customerCreation.status === 'success' ?
                            <Alert className="mt-2">
                                <CircleCheck color="green" />
                                <AlertTitle>Success! Customer has been created.</AlertTitle>
                                <AlertDescription>
                                    <span>
                                        <strong>{`${customerCreation.payload.firstName} ${customerCreation.payload.surName} `}</strong>
                                        is added to the system as a customer.
                                    </span>
                                </AlertDescription>
                            </Alert>
                            : stepResult.customerCreation.status === 'skipped' ?
                                <Alert className="mt-2">
                                    <CircleAlert color="orange" />
                                    <AlertTitle>Alert! Customer with the same ssn exist.</AlertTitle>
                                    <AlertDescription>
                                        <ul className="list-disc list-inside">
                                            <li>Customer will not be recreate.</li>
                                            <li>Portfolio will be attached to the existing customer.</li>
                                            <li>Existing customer personal info will not be update.</li>
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                                :
                                <></>
                    }
                    {
                        portfolioCreation.status === 'success' ?
                            <>
                                <Alert className="mt-3">
                                    <CircleCheck color="green" />
                                    <AlertTitle>Success! Portfolio has been created.</AlertTitle>
                                    <AlertDescription>
                                        <span>
                                            An
                                            <strong>{` ${portfolioCreation.payload.portfolioTypeCode} `}</strong>
                                            portfolio has opened and attached to the customer.
                                        </span>
                                    </AlertDescription>
                                </Alert>

                                <div className="flex items-end w-full space-x-2 pt-12 pb-4">
                                    <div className="flex flex-1 gap-2 flex-col">
                                        <Label htmlFor="link">
                                            Created Portfolio Id:
                                        </Label>
                                        <Input
                                            id="link"
                                            defaultValue={portfolioCreation.response?.data?.portfolioDescription}
                                            readOnly
                                        />
                                    </div>
                                    <Button type="submit" size="sm" className="px-3" onClick={() => navigator.clipboard.writeText(portfolioCreation.response?.data?.portfolioCode ? portfolioCreation.response?.data?.portfolioCode : '')}>
                                        <span className="sr-only">Copy</span>
                                        <Copy />
                                    </Button>
                                </div>
                            </>
                            : accountCreation.status === 'success' ?
                                <>
                                    <Alert variant="destructive" className="mt-3">
                                        <CircleX color="red" />
                                        <AlertTitle>Failure! Portfolio failed to create <strong>(Retry not recommended).</strong></AlertTitle>
                                        <AlertDescription>
                                            <>
                                                <span>{portfolioCreation.response?.body}</span>
                                                <span>Portfolio Failed to create.</span>
                                            </>
                                        </AlertDescription>
                                    </Alert>
                                    <Separator className="my-6" />
                                    <h3 className="text-md mt-6 font-semibold">Contact support (Recommended)</h3>
                                    <p className="text-sm">Write some custom message and forward the failure to suport team.
                                        The context of your portfolio creation request will be append to your message automaticly.</p>
                                    <Label htmlFor="message" className="mt-9 mb-2 text-start w-full">Message:</Label>
                                    <Textarea id='message' placeholder="Type your message here." value={reportMessage} onChange={(event)=>setReportMessage(event.currentTarget.value)}/>
                                    <div className="flex items-center space-x-2 mt-4">
                                        <Switch id="ccMe" checked={ccMe} onCheckedChange={(e)=>setCcMe(e)}/>
                                        <Label htmlFor="ccMe">Send me a coppy.</Label>
                                    </div>
                                    <span className="text-sm opacity-60">Email in your user settup will be used.</span>
                                    <DialogFooter>
                                        <Button className="mt-7" onClick={sendReportData} disabled={sendingReport}>Send</Button>
                                    </DialogFooter>
                                </>
                                :
                                <>
                                    <Alert variant="destructive" className="mt-3">
                                        <CircleX color="red" />
                                        <AlertTitle>Failure! Portfolio failed to create  <strong>(Try again later).</strong></AlertTitle>
                                        <AlertDescription>
                                            <>
                                                <span>Portfolio Failed to create, try again later.</span>
                                                <span>{accountCreation.response?.body}</span>
                                            </>
                                        </AlertDescription>
                                    </Alert>
                                    <DialogFooter>
                                        <Button type="button" className="mt-7" onClick={onCloseButtonPress}>Close</Button>
                                    </DialogFooter>
                                </>
                    }
                </div>
            </>
        )
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle>Create New Portfolio</DialogTitle>
                <DialogDescription>
                    Make changes to your profile here. Click save when you're done.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                        Name
                    </Label>
                    <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">
                        Username
                    </Label>
                    <Input id="username" defaultValue="@peduarte" className="col-span-3" />
                </div>
            </div>
            <DialogFooter>
                <Button type="submit">Save changes</Button>
            </DialogFooter>
        </>
    )
}
