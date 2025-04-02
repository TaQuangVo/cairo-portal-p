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
import { Accordion, AccordionContent, AccordionTrigger } from "./ui/accordion";
import { AccordionItem } from "@radix-ui/react-accordion";
import { UnexpectedErrorType } from "./NewPortfolioForm";

function ContactSuportForm({data, error, defaultOpen, title, onCloseButtonPress}:{data:NewPortfolioResponse | null, error:UnexpectedErrorType | null, defaultOpen: boolean, title: string, onCloseButtonPress: ()=>void}){
    const [reportMessage, setReportMessage] = useState('');
    const [ccMe, setCcMe] = useState(false);
    const [sendingReport, setSendingReport] = useState(false)
    const [shown, setShown] = useState(defaultOpen?'item-1':'');

    async function onSendReportData() {
        const response = await fetch("/api/reports", {
            method: "POST",
            body: JSON.stringify({
                type: 'Create Account Submittion Failure',
                message: reportMessage,
                attachmentData: data ? data : error,
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

    return (
        <Accordion type="single" collapsible className="w-full" value={shown} onValueChange={setShown}>
        <AccordionItem value="item-1">
            <AccordionTrigger>{title}</AccordionTrigger>
            <AccordionContent>
                <p className="text-sm">Add a message for the support team. Information about your portfolio request will be attached automatically.</p>
                <Label htmlFor="message" className="mt-9 mb-2 text-start w-full">Message:</Label>
                <Textarea id='message' placeholder="Type your message here." value={reportMessage} onChange={(event)=>setReportMessage(event.currentTarget.value)}/>
                <div className="flex items-center space-x-2 mt-4">
                    <Switch id="ccMe" checked={ccMe} onCheckedChange={(e)=>setCcMe(e)}/>
                    <Label htmlFor="ccMe">Send me a copy.</Label>
                </div>
                <span className="text-sm opacity-60">The email from your user settings will be used.</span>
                <DialogFooter>
                    <Button type="button" variant="outline" className="mt-7" onClick={onCloseButtonPress}>Close</Button>
                    <Button className="mt-7" onClick={onSendReportData} disabled={sendingReport}>Send report</Button>
                </DialogFooter>
            </AccordionContent>
        </AccordionItem>
    </Accordion>
    )
}


export default function NewPortfolioSubmittionResult({ data, error, onCloseButtonPress }: { data: NewPortfolioResponse | null, error: UnexpectedErrorType | null, onCloseButtonPress: () => void }) {
    if (!data && !error) {
        return (
            <>
                <DialogHeader>
                    <DialogTitle>Create New Portfolio</DialogTitle>
                    <DialogDescription>
                        Create a finnancial portfolio for the customer.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col justify-center items-center h-50 w-full">
                    <ClipLoader />
                </div>
            </>
        )
    }


    if (data && (data.status == 'success' || data.status === 'partial failure' || data.status === 'failed')) {

        const stepResult = data.data as SequentialCustomerAccountPortfolioCreatioResult
        const customerCreation = stepResult.customerCreation
        const accountCreation = stepResult.accountCreation
        const portfolioCreation = stepResult.portfolioCreation

        return (
            <>
                <DialogHeader>
                    <DialogTitle>{data.status == 'success' ? 'Done' : 'Failed!!!'}</DialogTitle>
                    <DialogDescription>
                        {data.status == 'success' ? 'A new account has been created.' : 'Failed to create account.'}
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
                                        <li>Account will be attached to the existing customer.</li>
                                        <li>Personal infomation of existing customer will not be updated.</li>
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        : stepResult.customerCreation.status === 'failed' || stepResult.customerCreation.status === 'error' ?
                        <Alert className="mt-2" variant="destructive">
                            <CircleX color="red" />
                            <AlertTitle>Failure! Failed to create customer <strong>(Try again later).</strong></AlertTitle>
                            <AlertDescription>
                                <span>{stepResult.customerCreation.response?.body}</span>
                            </AlertDescription>
                        </Alert>
                        : <></>
                    }
                    {
                        portfolioCreation.status === 'success' ?
                            <>
                                <Alert className="mt-3">
                                    <CircleCheck color="green" />
                                    <AlertTitle>Success! Account has been created.</AlertTitle>
                                    <AlertDescription>
                                        <span>
                                            An
                                            <strong>{` ${portfolioCreation.payload.portfolioTypeCode} `}</strong>
                                            account has been created and attached to the customer.
                                        </span>
                                    </AlertDescription>
                                </Alert>

                                <div className="flex items-end w-full space-x-2 pt-12 pb-4">
                                    <div className="flex flex-1 gap-2 flex-col">
                                        <Label htmlFor="link">
                                            Created Account Id:
                                        </Label>
                                        <Input
                                            id="link"
                                            defaultValue={portfolioCreation.response?.data?.portfolioDescription}
                                            readOnly
                                        />
                                    </div>
                                    <Button type="submit" size="sm" className="px-3" onClick={() => navigator.clipboard.writeText(portfolioCreation.response?.data?.portfolioDescription ?? '')}>
                                        <span className="sr-only">Copy</span>
                                        <Copy />
                                    </Button>
                                </div>
                            </>
                            : accountCreation.status === 'success' ?
                                <>
                                    <Alert variant="destructive" className="mt-3">
                                        <CircleX color="red" />
                                        <AlertTitle>Failure! Account failed to create <strong>(Retry not recommended).</strong></AlertTitle>
                                        <AlertDescription>
                                            <>
                                                <span>Account Failed to create, please contact suport.</span>
                                                <span>{portfolioCreation.response?.body}</span>
                                            </>
                                        </AlertDescription>
                                    </Alert>
                                    <Separator className="my-6" />
                                    <ContactSuportForm title="Contact support (Recommended)." data={data} error={error} defaultOpen={false} onCloseButtonPress={onCloseButtonPress}/>
                                </>
                            :
                                <>
                                    <Alert variant="destructive" className="mt-3">
                                        <CircleX color="red" />
                                        <AlertTitle>Failure! Account failed to create <strong>(Try again later).</strong></AlertTitle>
                                        <AlertDescription>
                                            <>
                                                <span>Portfolio Failed to create, try again later.</span>
                                                <span>{accountCreation.response?.body}</span>
                                            </>
                                        </AlertDescription>
                                    </Alert>
                                    <Separator className="my-6" />
                                    <ContactSuportForm title="Contact support." data={data} error={error} defaultOpen={true} onCloseButtonPress={onCloseButtonPress}/>
                                </>
                    }
                </div>
            </>
        )
    }

    if (data && data.status == 'error') {
        return (
            <>
                <DialogHeader>
                    <DialogTitle>Failed!!!</DialogTitle>
                    <DialogDescription>
                        Failed to create account.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Alert className="mt-2">
                        <CircleAlert color="orange" />
                        <AlertTitle>Error! Failed to create account.</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc list-inside">
                                {
                                    data.dataType === 'ZodError' 
                                    ? 
                                    <>
                                        {(data.data as z.ZodError).issues.map(issue => (
                                            <li key={issue.path.join('.')}>{issue.message}</li>
                                        ))}
                                    </>
                                    : <li>{data.messages}</li>

                                }
                            </ul>
                        </AlertDescription>
                    </Alert>
                </div>
                <Separator className="my-6" />
                <ContactSuportForm title="Contact support." data={data} error={error} defaultOpen={false} onCloseButtonPress={onCloseButtonPress}/>
            </>
        )
    }

    return (
    <>
        <DialogHeader>
            <DialogTitle>Failed!!!</DialogTitle>
            <DialogDescription>
                Failed to create account.
            </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <Alert className="mt-2">
                <CircleAlert color="orange" />
                <AlertTitle>Error! Failed to create account.</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc list-inside">
                        <li>{error?.messages}</li>
                    </ul>
                </AlertDescription>
            </Alert>
        </div>
        <Separator className="my-6" />
        <ContactSuportForm title="Contact support." data={data} error={error} defaultOpen={false} onCloseButtonPress={onCloseButtonPress}/>
    </>
    )
}
