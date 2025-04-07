'use client'
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import ClipLoader from "react-spinners/ClipLoader";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { CircleCheck, Copy, Info } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Switch } from "./ui/switch";
import { Accordion, AccordionContent, AccordionTrigger } from "./ui/accordion";
import { AccordionItem } from "@radix-ui/react-accordion";

function ContactSuportForm({data, defaultOpen, title, onCloseButtonPress}:{data:any | null, defaultOpen: boolean, title: string, onCloseButtonPress: ()=>void}){
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


export default function NewPortfolioSubmittionResult({ data, error, errorData, onCloseButtonPress }: { data: {portfolioCode:string, portfolioType: string|null, modelPortfolio:string|null} | null, error: string[]|null, errorData: any, onCloseButtonPress: () => void }) {
    const [showBareWithMe, setShowBareWithMe] = useState(false);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (!data) {
          timeout = setTimeout(() => {
            setShowBareWithMe(true);
          }, 3000);
        }
    
        return () => clearTimeout(timeout);
      }, [data]);
    
    if (!data && !error) {
        return (
            <>
                <DialogHeader>
                    <DialogTitle>Creating Account</DialogTitle>
                    <DialogDescription>
                        We are creating the Account and if needed the customer
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col justify-center items-center h-50 w-full">
                    <ClipLoader />
                    {showBareWithMe && (
                        <p className="text-sm text-muted-foreground mt-4">
                        Bear with us... this is taking longer than usual.
                        </p>
                    )}
                </div>
            </>
        )
    }

    if(error){
        return (
        <>
            <DialogHeader>
                <DialogTitle>Error</DialogTitle>
                <DialogDescription>
                    An error accured while creating the account.
                </DialogDescription>
            </DialogHeader>
            <div className="w-full mb-6 overflow-x-visible">
                <Alert className="mt-2" variant="destructive">
                    <Info />
                    <AlertTitle>Error Creating Account</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc list-inside">
                            {error.map((e, index) => (
                                <li key={index}>
                                    {e}
                                </li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            </div>
            <ContactSuportForm data={errorData} title="Contact support" defaultOpen={false} onCloseButtonPress={onCloseButtonPress}/>
        </>
        )
    }


    if (data) {
        return (
            <>
                <DialogHeader>
                    <DialogTitle>Done</DialogTitle>
                    <DialogDescription>
                        A new account has been created.
                    </DialogDescription>
                </DialogHeader>
                <div className="w-full">
                    <Alert className="mt-2">
                        <Info />
                        <AlertTitle>Creation info:</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc list-inside">
                                <li>Accounts are attached to a customer.</li>
                                <li>Customer will be created if not already exist.</li>
                                <li>Info of existing customer will not be updated.</li>
                            </ul>
                        </AlertDescription>
                    </Alert>
                    <Alert className="mt-3">
                        <CircleCheck color="green" />
                        <AlertTitle>Success! Account has been created.</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc list-inside">
                                <li>
                                    An <strong> {data.portfolioType} </strong>
                                    account has been created and attached to the customer.
                                </li>
                                {data.modelPortfolio &&
                                    <li>
                                        Account is setting up to follow <strong> {data.modelPortfolio} </strong>
                                    </li>
                                }
                            </ul>
                        </AlertDescription>
                    </Alert>

                    <div className="flex items-end w-full space-x-2 pt-12 pb-4">
                        <div className="flex flex-1 gap-2 flex-col">
                            <Label htmlFor="link">
                                Created Account Id:
                            </Label>
                            <Input
                                id="link"
                                defaultValue={data.portfolioCode}
                                readOnly
                            />
                        </div>
                        <Button type="submit" size="sm" className="px-3" onClick={() => navigator.clipboard.writeText(data.portfolioCode ?? '')}>
                            <span className="sr-only">Copy</span>
                            <Copy />
                        </Button>
                    </div>
                </div>
            </>
        )
    }
}
