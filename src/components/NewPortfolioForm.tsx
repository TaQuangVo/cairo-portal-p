"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { capitalize, convertOrgNumber, convertPersonalNumber } from "@/utils/stringUtils"
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import NewPortfolioSubmittionResult from "./NewPortfolioSubmittionResult"
import { modelPortfolioMap } from "@/constant/modelPortfolio"
import { definedPortfolioType } from "@/constant/portfolioType"
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs"
import { Percent } from "lucide-react"
import { RoaringCompanyOverviewRecords, RoaringPopulationRegisterRecord } from "@/lib/roaring.type"
import { useSearchParams } from "next/navigation"


const userPortfolioSchema = z.object({
    isCompany: z.boolean(),
    firstname: z.string(),
    surname: z.string(),
    feeSubscription: z.number({message:'Account fee is required'})
        .min(0.2, { message: "Subscription fee must be at least 0.2" })
        .max(2.0, { message: "Subscription fee must not exceed 2.0" }),
    personalNumber: z.string().refine((value) => {
        return /^\d{10,12}$|^\d{8}-\d{4}|^\d{6}-\d{4}$/.test(value)
    }, { message: "Social security number must contain only digits and possibly one dash(-)." }),
    address: z.string().min(5, "Address must be at least 5 characters."),
    address2: z.string().optional().nullable(),
    postalCode: z.string().min(4, "Postal code must be at least 4 characters."),
    city: z.string().min(2, "City must be at least 2 characters."),
    mobile: z.string().min(8, "Mobile number must be at least 8 characters.").or(z.literal("")).optional().nullable(),
    emailAddress: z.string().email("Invalid email format.").or(z.literal("")).optional().nullable(),
    portfolioTypeCode: z.string().refine((value) => {
        return definedPortfolioType.get(value) != undefined;
    }, { message: "Invalid portfolio code." }),
    modelPortfolioCode: z.string().refine((value) => {
        return modelPortfolioMap.get(value) != undefined;
    }, { message: "Invalid model portfolio code." }).or(z.literal('')).optional().nullable(),
}).superRefine((data, ctx) => {
    if (!data.isCompany) {
        if (!data.firstname || data.firstname.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["firstname"],
                message: "Firstname must be at least 2 characters."
            });
        }
        if (!data.surname || data.surname.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["surname"],
                message: "Surname must be at least 2 characters."
            });
        }

        try {
            convertPersonalNumber(data.personalNumber)
        } catch (error) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["personalNumber"],
                message: (error as Error).message
            });
        }
    }
    if (data.isCompany) {
        if (!data.surname || data.surname.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["surname"],
                message: "Company name must be at least 2 characters."
            });
        }

        try {
            convertOrgNumber(data.personalNumber)
        } catch (e) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["personalNumber"],
                message: (e as Error).message
            });
        }

        if (definedPortfolioType.get(data.portfolioTypeCode)?.id === 'ISK') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["portfolioTypeCode"],
                message: "Company accounts cannot be Investeringssparkonto accounts."
            });
        }
    }
});

type UserPortfolioFormValues = z.infer<typeof userPortfolioSchema>

const formDefaultValues = {
    isCompany: false,
    firstname: "",
    surname: "",
    personalNumber: "",
    address: "",
    address2: "",
    postalCode: "",
    city: "",
    mobile: "",
    emailAddress: "",
    portfolioTypeCode: undefined,
    modelPortfolioCode: undefined,
}

export type UnexpectedErrorType = {
    messages: string
    requestBody: UserPortfolioFormValues
    response: any
    responseBody: any
}

export function NewPortfolioForm() {
    const searchParams = useSearchParams();
    const [showSubmittionModule, setShowSubmittionModule] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [submittionResult, setSubmittionResult] = useState<{portfolioCode:string, portfolioType: string, modelPortfolio:string|null} | null>(null)
    const [submittionError, setSubmittionError] = useState<any|null>(null)
    const form = useForm<UserPortfolioFormValues>({
        resolver: zodResolver(userPortfolioSchema),
        defaultValues: formDefaultValues,
        mode: "onChange",
    })

    function resetForm() {
        form.reset({ ...formDefaultValues, portfolioTypeCode: undefined })
    }

    function onCloseModule(open: boolean) {
        if (isLoading) return

        resetForm()
        setSubmittionResult(null)
        setShowSubmittionModule(open)
        setSubmittionError(null)
    }

    async function onSubmit(data: UserPortfolioFormValues): Promise<void> {
        setShowSubmittionModule(true)
        setSubmittionError(null)
        setSubmittionResult(null)
        setIsLoading(true)

        const body = {
            ...data,
            personalNumber: !data.isCompany ? convertPersonalNumber(data.personalNumber) : convertOrgNumber(data.personalNumber)
        }

        const response = await fetch("/api/submittions/v2/portfolios", {
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            method: "POST",
            body: JSON.stringify(body),
        })

        setIsLoading(false)

        if (response.ok) {
            let responseData: { portfolioCode: string } = await response.json();
            setSubmittionResult({
                portfolioType: body.portfolioTypeCode,
                modelPortfolio: body.modelPortfolioCode ?? null,
                portfolioCode: responseData.portfolioCode,
            })
            toast("Portfolio created successfully!")
        } else {
            try{
                let responseData = await response.json();
                setSubmittionError({
                    messages: responseData.messages,
                    requestBody: body,
                })
            }catch(e){
                setSubmittionError({
                    messages: ['Something gone wrong!', (e as Error).message],
                    requestBody: body,
                })
            }
            toast("Failed to create portfolio!")
        }
        return
    }

    async function prefillCompanyInfo(orgNumber: string){
        orgNumber = "5401109565"
        const response = await fetch("/api/roaring/companyOverview?orgNumber=" + orgNumber) 
        if(response.ok){
            let responseData: RoaringCompanyOverviewRecords[] = await response.json();
            console.log(responseData)
            const name = responseData?.[0]?.companyName
            const adress = responseData?.[0]?.address
            const zip = responseData?.[0]?.zipCode
            const city = responseData?.[0]?.county

            name && form.setValue('surname', capitalize(name, 'word'))
            adress && form.setValue('address', capitalize(adress, 'word'))
            zip && form.setValue('postalCode', zip)
            city && form.setValue('city', capitalize(city, 'word'))
        }else{
            toast('Failed to fetch personal information.')
        }
    }
    
    useEffect(()=>{
        const isCompany = searchParams.get('isCompany')
        const orgNumber = searchParams.get('orgNumber')
        console.log('isCompany: ' + isCompany)
        console.log('orgNumber: ' + orgNumber)

        if(isCompany == null || orgNumber == null || !['true', 'false'].includes(isCompany)){
            return
        }

        try{
            const formatedValue = isCompany==='true' ? convertOrgNumber(orgNumber) : convertPersonalNumber(orgNumber)
            form.setValue('personalNumber', formatedValue)
            isCompany!=='true' && prefillPersonalInfo(formatedValue)
            isCompany==='true' && prefillCompanyInfo(formatedValue)

        }catch(e){
            toast('Cannot prefill values')
        }

    },[])

    async function prefillPersonalInfo(personalNumber: string){
        personalNumber = "198604069883"
        const response = await fetch("/api/roaring/populationRegister?personalNumber=" + personalNumber) 
        if(response.ok){
            let responseData: RoaringPopulationRegisterRecord[] = await response.json();
            const firstname = responseData?.[0]?.name?.[0]?.firstName
            const surname = responseData?.[0]?.name?.[0]?.surName
            const adress = responseData?.[0]?.populationRegistrationAddress?.[0].swedishAddress.deliveryAddress1
            const adress2 = responseData?.[0]?.populationRegistrationAddress?.[0].swedishAddress.deliveryAddress2
            const zip = responseData?.[0]?.populationRegistrationAddress?.[0].swedishAddress.zipCode
            const city = responseData?.[0]?.populationRegistrationAddress?.[0].swedishAddress.city

            firstname && form.setValue('firstname', capitalize(firstname, 'word')) 
            surname && form.setValue('surname', capitalize(surname, 'word'))
            adress && form.setValue('address2', capitalize(adress, 'word'))
            adress2 && form.setValue('address', capitalize(adress2, 'word'))
            zip && form.setValue('postalCode', zip)
            city && form.setValue('city', capitalize(city, 'word'))
        }else{
            toast('Failed to fetch personal information.')
        }
    }

    const isCompany = form.watch("isCompany");

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">

                    <FormField
                        control={form.control}
                        name="isCompany"
                        render={({ field }) => (
                            <FormItem >
                                <FormControl>
                                    <Tabs value={field.value ? 'company' : 'private'} className=" lg:w-[400px] mx-auto " onValueChange={(value: string) => {
                                        //field.onChange(value === 'company')
                                        form.reset({ ...formDefaultValues, portfolioTypeCode: undefined, isCompany: value === 'company'})
                                    }}>
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="private">Private Person</TabsTrigger>
                                            <TabsTrigger value="company">Organization</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <div className="text-sm mb-9">
                        <p className="font-semibold">Create a new account for a {isCompany ? 'company' : 'private person'}.</p>
                        <p>(If the customer does not already exist, one will be created automatically before the account is added)</p>
                    </div>

                    <FormField control={form.control} name="personalNumber" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{isCompany ? "Organization number*" : "Social Security number*"}</FormLabel>
                            <FormControl>
                                <Input placeholder={isCompany ? "Enter organization number" : "Enter social security number"} {...field} onBlur={(e => {
                                    const value = e.target.value
                                    try {
                                        const formatedValue = isCompany ? convertOrgNumber(value) : convertPersonalNumber(value)
                                        form.setValue('personalNumber', formatedValue)
                                        !isCompany && prefillPersonalInfo(formatedValue)
                                        isCompany && prefillCompanyInfo(formatedValue)
                                    } catch (e) {
                                        form.setError('personalNumber', {
                                            type: 'custom',
                                            message: (e as Error).message
                                        })
                                    }
                                })} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <Separator />

                    {!isCompany && (
                        <FormField
                            control={form.control}
                            name="firstname"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name*</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter first name" {...field} value={field.value ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                    <FormField control={form.control} name="surname" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{isCompany ? "Company Name*" : "Surname*"}</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter surname" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address*</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter address" {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <div className="flex">
                        <FormField control={form.control} name="postalCode" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Postal Code*</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter postal code" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="city" render={({ field }) => (
                            <FormItem className="ml-5">
                                <FormLabel>City*</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter city" {...field}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                    <FormField control={form.control} name="mobile" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mobile (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter mobile number" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="emailAddress" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter email" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <Separator />
                    <FormField control={form.control} name="portfolioTypeCode" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Account Type*</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value ? field.value : ""}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select account type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {
                                        [...definedPortfolioType.entries()].map(([key, value]) => {
                                            if (isCompany && value.id === 'ISK') {
                                                return null
                                            }
                                            return <SelectItem key={value.id} value={key}>{key}</SelectItem>
                                        })
                                    }
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="modelPortfolioCode" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Account Model</FormLabel>
                            <Select onValueChange={(value) => {
                                if (value === "__clear__") {
                                    field.onChange("");
                                } else {
                                    field.onChange(value);
                                }
                            }}
                                value={field.value ?? ""}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="No Model" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-70">
                                    <SelectItem value="__clear__">No Model</SelectItem>
                                    {
                                        [...modelPortfolioMap.entries()].map(([key, value]) => {
                                            return <SelectItem key={value} value={key}>{key}</SelectItem>
                                        })
                                    }
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <div className="flex">
                        <FormField control={form.control} name="feeSubscription" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Account Fee*</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input placeholder="Fee value" {...field} value={field.value ?? ''} type="number" onChange={(e) => {
                                            const val = e.target.valueAsNumber;
                                            field.onChange(Number.isNaN(val) ? undefined : val);
                                        }}/>
                                        <Percent className="absolute right-0 top-1/2 -translate-y-1/2 mr-2" size={16}/>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                        

                    <div className="flex flex-col items-end mt-20 mb-9">
                        <div>
                            <Button type="button" variant='outline' className="mr-4" disabled={!form.formState.isDirty} onClick={() => resetForm()}>Clear formular</Button>
                            <Button type="submit" disabled={!form.formState.isValid}>Create</Button>
                        </div>
                        {
                            !form.formState.isValid &&
                            <p className="text-sm mt-3">Fill in all required fields to continues!</p>
                        }
                    </div>
                </form>
            </Form>
            <Dialog open={showSubmittionModule} onOpenChange={onCloseModule}>
                <DialogContent className="lg:max-w-[525px] overflow-x-visible" onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()} onOpenAutoFocus={(e) => e.preventDefault()}>
                    <NewPortfolioSubmittionResult data={submittionResult} error={submittionError?.messages} errorData={submittionError} onCloseButtonPress={() => onCloseModule(false)} />
                </DialogContent>
            </Dialog>
        </>
    )
}
