"use client"

import { useFieldArray, useFormContext, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { capitalize, convertOrgNumber, convertPersonalNumber, formatDecimals } from "@/utils/stringUtils"
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import NewPortfolioSubmittionResult from "../NewPortfolioSubmittionResult"
import { modelPortfolioMap } from "@/constant/modelPortfolio"
import { definedPortfolioType } from "@/constant/portfolioType"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { Percent, Plus, Trash2 } from "lucide-react"
import { RoaringCompanyOverviewRecords, RoaringPopulationRegisterRecord } from "@/lib/roaring.type"
import { useSearchParams } from "next/navigation"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { formDefaultValues, UserPortfolioFormValues, userPortfolioSchema } from "./helper"
import { Checkbox } from "../ui/checkbox"
import { Switch } from "../ui/switch"


export function NewPortfolioForm() {
    const searchParams = useSearchParams();
    const [showSubmittionModule, setShowSubmittionModule] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [fetchingAutoFillValues, setFetchingAutoFillValues] = useState<null | 'reprecentive' | 'private customer' | 'company'>(null)
    const [submittionResult, setSubmittionResult] = useState<{ portfolioCode: string, portfolioType: string, modelPortfolio: string | null } | null>(null)
    const [submittionError, setSubmittionError] = useState<any | null>(null)
    const [showForm, setShowForm] = useState(false)
    const form = useForm<UserPortfolioFormValues>({
        resolver: zodResolver(userPortfolioSchema),
        defaultValues: formDefaultValues,
        mode: "onBlur",
    })

    function resetForm() {
        form.reset({ ...formDefaultValues })
        setShowForm(false)
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
                portfolioType: body.accountDetails.portfolioTypeCode,
                modelPortfolio: body.accountDetails.modelPortfolioCode ?? null,
                portfolioCode: responseData.portfolioCode,
            })
            toast("Portfolio created successfully!")
        } else {
            try {
                let responseData = await response.json();
                setSubmittionError({
                    messages: responseData.messages,
                    requestBody: body,
                })
            } catch (e) {
                setSubmittionError({
                    messages: ['Something gone wrong!', (e as Error).message],
                    requestBody: body,
                })
            }
            toast("Failed to create portfolio!")
        }
        return
    }

    async function prefillCompanyInfo(orgNumber: string) {
        setFetchingAutoFillValues('company')
        const response = await fetch("/api/roaring/companyOverview?orgNumber=" + orgNumber)
        setFetchingAutoFillValues(null)
        if (response.ok) {
            let responseData: RoaringCompanyOverviewRecords[] = await response.json();
            console.log(responseData)
            const name = responseData?.[0]?.companyName
            const adress = responseData?.[0]?.address
            const zip = responseData?.[0]?.zipCode
            const city = responseData?.[0]?.county

            name && form.setValue('mainActor.surname', capitalize(name, 'word'))
            adress && form.setValue('mainActor.address', capitalize(adress, 'word'))
            zip && form.setValue('mainActor.postalCode', zip)
            city && form.setValue('mainActor.city', capitalize(city, 'word'))
            form.trigger('mainActor.surname')
            form.trigger('mainActor.address')
            form.trigger('mainActor.postalCode')
            form.trigger('mainActor.city')
            setShowForm(true)
        } else if (response.status === 400) {
            const res = await response.json();
            form.setError('mainActor.personalNumber', {
                type: 'custom',
                message: res.messages
            })
            setShowForm(false)
        } else if (response.status === 404) {
            form.setError('mainActor.personalNumber', {
                type: 'custom',
                message: 'Company not exist, check for correct organization number'
            })
            setShowForm(false)
        } else {
            toast('Failed to company information.')
            form.setError('mainActor.personalNumber', {
                type: 'custom',
                message: 'Cannot get company infomation, try again later.'
            })
            setShowForm(false)
        }
    }

    async function prefillPersonalInfo(personalNumber: string) {
        setFetchingAutoFillValues('private customer')
        const response = await fetch("/api/roaring/populationRegister?personalNumber=" + personalNumber)
        setFetchingAutoFillValues(null)
        if (response.ok) {
            let responseData: RoaringPopulationRegisterRecord[] = await response.json();
            const firstname = responseData?.[0]?.name?.[0]?.firstName
            const surname = responseData?.[0]?.name?.[0]?.surName
            const adress = responseData?.[0]?.populationRegistrationAddress?.[0].swedishAddress.deliveryAddress1
            const adress2 = responseData?.[0]?.populationRegistrationAddress?.[0].swedishAddress.deliveryAddress2
            const zip = responseData?.[0]?.populationRegistrationAddress?.[0].swedishAddress.zipCode
            const city = responseData?.[0]?.populationRegistrationAddress?.[0].swedishAddress.city

            firstname && form.setValue('mainActor.firstname', capitalize(firstname, 'word'))
            surname && form.setValue('mainActor.surname', capitalize(surname, 'word'))
            adress && form.setValue('mainActor.address2', capitalize(adress, 'word'))
            adress2 && form.setValue('mainActor.address', capitalize(adress2, 'word'))
            zip && form.setValue('mainActor.postalCode', zip)
            city && form.setValue('mainActor.city', capitalize(city, 'word'))
            form.trigger('mainActor.firstname')
            form.trigger('mainActor.surname')
            form.trigger('mainActor.address')
            form.trigger('mainActor.postalCode')
            form.trigger('mainActor.city')
            setShowForm(true)

        } else if (response.status === 404) {
            form.setError('mainActor.personalNumber', {
                type: 'custom',
                message: 'Person not exist, check for correct social security number'
            })
            setShowForm(false)
        } else if (response.status === 400) {
            const res = await response.json();
            form.setError('mainActor.personalNumber', {
                type: 'custom',
                message: res.messages
            })
            setShowForm(false)
        } else {
            toast('Failed to fetch personal information.')
            form.setError('mainActor.personalNumber', {
                type: 'custom',
                message: 'Cannot get person infomation, try again later.'
            })
            setShowForm(false)
        }
    }


    async function prefillRepresentativeInfo(personalNumber: string) {
        setFetchingAutoFillValues('reprecentive')
        const response = await fetch("/api/roaring/populationRegister?personalNumber=" + personalNumber)
        setFetchingAutoFillValues(null)
        if (response.ok) {
            let responseData: RoaringPopulationRegisterRecord[] = await response.json();
            const firstname = responseData?.[0]?.name?.[0]?.firstName
            const surname = responseData?.[0]?.name?.[0]?.surName
            const adress = responseData?.[0]?.populationRegistrationAddress?.[0].swedishAddress.deliveryAddress1
            const adress2 = responseData?.[0]?.populationRegistrationAddress?.[0].swedishAddress.deliveryAddress2
            const zip = responseData?.[0]?.populationRegistrationAddress?.[0].swedishAddress.zipCode
            const city = responseData?.[0]?.populationRegistrationAddress?.[0].swedishAddress.city

            firstname && form.setValue('representor.firstname', capitalize(firstname, 'word'))
            surname && form.setValue('representor.surname', capitalize(surname, 'word'))
            adress && form.setValue('representor.address2', capitalize(adress, 'word'))
            adress2 && form.setValue('representor.address', capitalize(adress2, 'word'))
            zip && form.setValue('representor.postalCode', zip)
            city && form.setValue('representor.city', capitalize(city, 'word'))
        } else if (response.status === 400) {
            const res = await response.json();
            form.setError('representor.personalNumber', {
                type: 'custom',
                message: res.messages
            })
        } else if (response.status === 404) {
            form.setError('representor.personalNumber', {
                type: 'custom',
                message: 'Person not exist, check for correct social security number'
            })
        } else {
            toast('Failed to fetch personal information.')
            form.setError('representor.personalNumber', {
                type: 'custom',
                message: 'Cannot get person infomation, try again later.'
            })
        }
    }

    function onAddPayment(value: string) {
        if (value === 'content') {
            form.setValue('payment', {
                accountNumber: '',
                clearingNumber: '',
                deposit: [],
            })
            form.trigger('payment.deposit')
        } else {
            form.setValue('payment', undefined)
            form.trigger('payment')
        }
    }

    function onAddReprecenterChange(value: string) {
        console.log(value)
        if (value === 'item-1') {
            form.setValue('representor', {
                firstname: '',
                surname: '',
                personalNumber: '',
                address: '',
                address2: '',
                postalCode: '',
                city: '',
                mobile: '',
                emailAddress: '',
            })
        } else {
            form.setValue('representor', undefined)
        }
    }

    useEffect(() => {
        const isCompany = searchParams.get('isCompany')
        const orgNumber = searchParams.get('orgNumber')

        if (isCompany == null || orgNumber == null || !['true', 'false'].includes(isCompany)) {
            return
        }

        try {
            const formatedValue = isCompany === 'true' ? convertOrgNumber(orgNumber) : convertPersonalNumber(orgNumber)
            form.setValue('mainActor.personalNumber', formatedValue)
            isCompany !== 'true' && prefillPersonalInfo(formatedValue)
            isCompany === 'true' && prefillCompanyInfo(formatedValue)

        } catch (e) {
            toast('Cannot prefill values')
        }

    }, [])


    const isCompany = form.watch("isCompany");
    const deposits = form.watch("payment.deposit")
    const accountModel = form.watch("accountDetails.modelPortfolioCode");
    const payment = form.watch("payment");
    const representive = form.watch("representor");

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4">
                    <div className="w-full rounded-md border p-3 lg:p-4 bg-background">
                        <FormField
                            control={form.control}
                            name="isCompany"
                            render={({ field }) => (
                                <FormItem >
                                    <FormControl>
                                        <Tabs value={field.value ? 'company' : 'private'} className=" lg:w-[400px] mx-auto " onValueChange={(value: string) => {
                                            //field.onChange(value === 'company')
                                            form.reset({ ...formDefaultValues, isCompany: value === 'company' })
                                            setShowForm(false)
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

                        <div className="text-sm mb-9 mt-6">
                            <p className="font-semibold">Create a new account for a {isCompany ? 'company' : 'private person'}.</p>
                            <p>(If the customer does not already exist, one will be created automatically before the account is added)</p>
                        </div>

                        <FormField control={form.control} name="mainActor.personalNumber" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{isCompany ? "Organization number*" : "Social Security number*"}</FormLabel>
                                <FormControl>
                                    <Input placeholder={isCompany ? "Enter organization number" : "Enter social security number"} {...field}
                                        disabled={fetchingAutoFillValues === 'private customer' || fetchingAutoFillValues === 'company'}
                                        onBlur={(e => {
                                            const value = e.target.value
                                            try {
                                                const formatedValue = isCompany ? convertOrgNumber(value) : convertPersonalNumber(value)
                                                form.setValue('mainActor.personalNumber', formatedValue)
                                                !isCompany && prefillPersonalInfo(formatedValue)
                                                isCompany && prefillCompanyInfo(formatedValue)
                                            } catch (e) {
                                                form.setError('mainActor.personalNumber', {
                                                    type: 'custom',
                                                    message: (e as Error).message
                                                })
                                                setShowForm(false)
                                            }
                                        })} />
                                </FormControl>
                                <span className="text-xs text-end text-gray-600">Fill in Personal number to continues*</span>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <Accordion type="single" collapsible className="w-full" value={showForm ? 'form' : ''}>
                        <AccordionItem value="form">
                            <AccordionContent className="mt-9">
                                <>
                                    <h3 className="text-lg font-semibold">Contact Information</h3>
                                    <div className="w-full rounded-md border px-3 lg:px-4 py-4 lg:py-6 space-y-6 mt-2">
                                        <span className="flex gap-6">
                                            {!isCompany &&
                                                <FormField
                                                    control={form.control}
                                                    name="mainActor.firstname"
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1/2">
                                                            <FormLabel>First Name*</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Enter first name" {...field} value={field.value ?? ""} disabled={fetchingAutoFillValues === 'private customer'} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            }
                                            <FormField control={form.control} name="mainActor.surname" render={({ field }) => (
                                                <FormItem className="flex-1/2">
                                                    <FormLabel>{isCompany ? "Company Name*" : "Surname*"}</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter surname" {...field} value={field.value} disabled={fetchingAutoFillValues === 'private customer' || fetchingAutoFillValues === 'company'} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </span>
                                        <div className="flex gap-6  flex-col lg:flex-row">
                                            <FormField control={form.control} name="mainActor.address" render={({ field }) => (
                                                <FormItem className="flex-1/2">
                                                    <FormLabel>Address*</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter address" {...field} value={field.value} disabled={fetchingAutoFillValues === 'private customer' || fetchingAutoFillValues === 'company'} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <div className="flex gap-6">
                                                <FormField control={form.control} name="mainActor.postalCode" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Postal Code*</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Enter postal code" {...field} value={field.value} disabled={fetchingAutoFillValues === 'private customer' || fetchingAutoFillValues === 'company'} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <FormField control={form.control} name="mainActor.city" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>City*</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Enter city" {...field} value={field.value} disabled={fetchingAutoFillValues === 'private customer' || fetchingAutoFillValues === 'company'} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </div>
                                        <div className="flex gap-6 flex-col lg:flex-row">
                                            <FormField control={form.control} name="mainActor.mobile" render={({ field }) => (
                                                <FormItem className="flex-1/2">
                                                    <FormLabel>Mobile (Optional)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter mobile number" {...field} value={field.value ? field.value : ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="mainActor.emailAddress" render={({ field }) => (
                                                <FormItem className="flex-1/2">
                                                    <FormLabel>Email (Optional)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter email" {...field} value={field.value ? field.value : ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                    </div>

                                    {isCompany && (
                                        <div className="pt-9">
                                            <h3 className="text-lg font-semibold">Representive</h3>
                                            <div className="w-full rounded-md border p-3 lg:p-4 space-y-6 mt-2 ">
                                                <span>
                                                    <div className="flex items-center gap-2 ">
                                                        <Checkbox
                                                            id="add-representative"
                                                            checked={representive ? true : false}
                                                            onCheckedChange={(checked) =>
                                                                onAddReprecenterChange(checked ? 'item-1' : '')
                                                            }
                                                        />
                                                        <label htmlFor="add-representative" className="text-sm font-medium">
                                                            Include representative (optional)
                                                        </label>
                                                    </div>
                                                    <Accordion type="single" collapsible className="w-full" value={representive ? 'item-1' : ''}>
                                                        <AccordionItem value="item-1">
                                                            <AccordionContent className="space-y-6 mt-6">

                                                                <FormField control={form.control} name="representor.personalNumber" render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Social security number*</FormLabel>
                                                                        <FormControl>
                                                                            <Input placeholder="Social security number" {...field} value={field.value ?? ''}
                                                                                disabled={fetchingAutoFillValues === 'reprecentive'}
                                                                                onBlur={(e => {
                                                                                    const value = e.target.value
                                                                                    try {
                                                                                        const formatedValue = convertPersonalNumber(value)
                                                                                        form.setValue('representor.personalNumber', formatedValue)
                                                                                        prefillRepresentativeInfo(formatedValue)
                                                                                    } catch (e) {
                                                                                        form.setError('representor.personalNumber', {
                                                                                            type: 'custom',
                                                                                            message: (e as Error).message
                                                                                        })
                                                                                    }
                                                                                })} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )} />
                                                                <div className="flex gap-6">
                                                                    <FormField control={form.control} name="representor.firstname" render={({ field }) => (
                                                                        <FormItem className="flex-1/2">
                                                                            <FormLabel>Firstname*</FormLabel>
                                                                            <FormControl>
                                                                                <Input placeholder="Firstname" {...field} value={field.value ?? ''} disabled={fetchingAutoFillValues === 'reprecentive'} />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )} />
                                                                    <FormField control={form.control} name="representor.surname" render={({ field }) => (
                                                                        <FormItem className="flex-1/2">
                                                                            <FormLabel>Surname*</FormLabel>
                                                                            <FormControl>
                                                                                <Input placeholder="Surename" {...field} value={field.value ?? ''} disabled={fetchingAutoFillValues === 'reprecentive'} />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )} />
                                                                </div>
                                                                <div className="flex gap-6 flex-col lg:flex-row">
                                                                    <FormField control={form.control} name="representor.address" render={({ field }) => (
                                                                        <FormItem className="flex-1/2">
                                                                            <FormLabel>Adress*</FormLabel>
                                                                            <FormControl>
                                                                                <Input placeholder="Adress" {...field} value={field.value ?? ''} disabled={fetchingAutoFillValues === 'reprecentive'} />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )} />
                                                                    <div className="flex">
                                                                        <FormField control={form.control} name="representor.postalCode" render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>Portal code*</FormLabel>
                                                                                <FormControl>
                                                                                    <Input placeholder="Portal code" {...field} value={field.value ?? ''} disabled={fetchingAutoFillValues === 'reprecentive'} />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )} />
                                                                        <FormField control={form.control} name="representor.city" render={({ field }) => (
                                                                            <FormItem className="ml-5">
                                                                                <FormLabel>City*</FormLabel>
                                                                                <FormControl>
                                                                                    <Input placeholder="City" {...field} value={field.value ?? ''} disabled={fetchingAutoFillValues === 'reprecentive'} />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )} />
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-6 flex-col lg:flex-row">
                                                                    <FormField control={form.control} name="representor.mobile" render={({ field }) => (
                                                                        <FormItem className="flex-1/2">
                                                                            <FormLabel>Mobile (Optional)</FormLabel>
                                                                            <FormControl>
                                                                                <Input placeholder="Mobile" {...field} value={field.value ?? ''} />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )} />
                                                                    <FormField control={form.control} name="representor.emailAddress" render={({ field }) => (
                                                                        <FormItem className="flex-1/2">
                                                                            <FormLabel>Email (Optional)</FormLabel>
                                                                            <FormControl>
                                                                                <Input placeholder="Email" {...field} value={field.value ?? ''} />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )} />
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-9">
                                        <h3 className="text-lg font-semibold">Account deatails</h3>
                                        <div className="w-full rounded-md border p-3 lg:p-4 space-y-6 mt-2">
                                            <FormField control={form.control} name="accountDetails.portfolioTypeCode" render={({ field }) => (
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
                                            <div className="flex gap-6">
                                                <FormField control={form.control} name="accountDetails.modelPortfolioCode" render={({ field }) => (
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
                                                    <FormField control={form.control} name="accountDetails.feeSubscription" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{accountModel !== '' ? 'Investeringsrådgivningsarvode*' : 'Diskretionärt förvaltningsarvode*'}</FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Input placeholder="Fee value" {...field} value={field.value ?? ''} type="number" onChange={(e) => {
                                                                        const val = e.target.valueAsNumber;
                                                                        field.onChange(Number.isNaN(val) ? '' : formatDecimals(val, 2));
                                                                    }} />
                                                                    <Percent className="absolute right-0 top-1/2 -translate-y-1/2 mr-2" size={16} />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-9">
                                    <h3 className="text-lg font-semibold">Payment method</h3>
                                        <div className="w-full rounded-md border p-3 lg:p-4 space-y-6 mt-2">
                                            <span>
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        id="include-payment"
                                                        checked={payment ? true : false}
                                                        onCheckedChange={(checked) =>
                                                            onAddPayment(checked ? 'content' : '')
                                                        }
                                                    />
                                                    <label htmlFor="include-payment" className="text-sm font-medium">
                                                        Include payment (optional)
                                                    </label>
                                                </div>
                                                <Accordion type="single" collapsible className="w-full" value={payment ? 'content' : ''}>
                                                    <AccordionItem value="content">
                                                        <AccordionContent className="space-y-6 mt-6">
                                                            <div className="flex gap-6 flex-row">
                                                                <FormField control={form.control} name="payment.accountNumber" render={({ field }) => (
                                                                    <FormItem className="flex-3/4">
                                                                        <FormLabel>Bank Account number*</FormLabel>
                                                                        <FormControl>
                                                                            <div className="relative">
                                                                                <Input placeholder="Fee value" {...field} value={field.value ?? ''} type="number" onChange={(e) => {
                                                                                    const val = e.target.value
                                                                                    field.onChange(val);
                                                                                }} />
                                                                            </div>
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )} />
                                                                <FormField control={form.control} name="payment.clearingNumber" render={({ field }) => (
                                                                    <FormItem className="flex-1/4">
                                                                        <FormLabel>Clearing number*</FormLabel>
                                                                        <FormControl>
                                                                            <div className="relative">
                                                                                <Input placeholder="Fee value" {...field} value={field.value ?? ''} type="number" onChange={(e) => {
                                                                                    const val = e.target.value
                                                                                    field.onChange(val);
                                                                                }} />
                                                                            </div>
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )} />
                                                            </div>
                                                            <div className=" flex flex-col gap-2 items-start">
                                                                <FormLabel>Initial deposits</FormLabel>

                                                                {deposits && deposits.map((field, index) => (
                                                                    <div className="p-2 border border-gray-300 rounded-md w-full" key={index}>
                                                                        <div key={index} className="flex items-center gap-2">
                                                                            <FormField
                                                                                control={form.control}
                                                                                name={`payment.deposit.${index}.amount`}
                                                                                render={({ field }) => (
                                                                                    <FormItem className="flex-1/2">
                                                                                        <FormControl>
                                                                                            <Input placeholder="Amount" type="number"
                                                                                                {...field}
                                                                                                onChange={(e) => {
                                                                                                    const val = e.target.valueAsNumber;
                                                                                                    field.onChange(Number.isNaN(val) ? '' : val);
                                                                                                }}
                                                                                            />
                                                                                        </FormControl>
                                                                                        <FormMessage />
                                                                                    </FormItem>
                                                                                )}
                                                                            />
                                                                            <Button type="button" variant="destructive" onClick={() => {
                                                                                const currVal = form.getValues("payment.deposit")
                                                                                const left = currVal.filter(e => e !== field)
                                                                                form.setValue('payment.deposit', left)
                                                                            }}>
                                                                                <Trash2 />
                                                                            </Button>
                                                                        </div>
                                                                        <FormField
                                                                            control={form.control}
                                                                            name={`payment.deposit.${index}.isRecurring`}
                                                                            render={({ field }) => (
                                                                                <FormItem className="mt-2 flex items-center">
                                                                                    <FormControl >
                                                                                        <Switch checked={field.value} onCheckedChange={field.onChange} onBlur={field.onBlur} ref={field.ref} />
                                                                                    </FormControl>
                                                                                    <FormLabel>Recurring</FormLabel>
                                                                                    <FormMessage />
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                    </div>
                                                                ))}

                                                                <Button
                                                                    className=""
                                                                    variant="outline"
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const currVal = form.getValues("payment.deposit")
                                                                        currVal.push({
                                                                            amount: 0,
                                                                            isRecurring: true,
                                                                        })
                                                                        form.setValue('payment.deposit', currVal)
                                                                    }}
                                                                >
                                                                    <Plus />
                                                                    Add deposit
                                                                </Button>
                                                            </div>

                                                        </AccordionContent>
                                                    </AccordionItem>
                                                </Accordion>
                                            </span>
                                        </div>
                                    </div>


                                    <div className="flex flex-col items-end mt-20 mb-9">
                                        <div>
                                            <Button type="button" variant='outline' className="mr-4" disabled={!form.formState.isDirty} onClick={() => resetForm()}>Clear formular</Button>
                                            <Button type="submit" disabled={!form.formState.isValid || Object.keys(form.formState.errors).length > 0}>Create</Button>
                                        </div>
                                        {
                                            !form.formState.isValid &&
                                            <p className="text-sm mt-3">Fill in all required fields to continues!</p>
                                        }
                                    </div>
                                </>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
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
