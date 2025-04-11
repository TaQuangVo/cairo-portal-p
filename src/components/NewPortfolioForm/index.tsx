"use client"

import { useForm } from "react-hook-form"
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
import { Percent } from "lucide-react"
import { RoaringCompanyOverviewRecords, RoaringPopulationRegisterRecord } from "@/lib/roaring.type"
import { useSearchParams } from "next/navigation"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { formDefaultValues, UserPortfolioFormValues, userPortfolioSchema } from "./helper"
import { Checkbox } from "../ui/checkbox"



export function NewPortfolioForm() {
    const searchParams = useSearchParams();
    const [showSubmittionModule, setShowSubmittionModule] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [fetchingAutoFillValues, setFetchingAutoFillValues] = useState<null|'reprecentive'|'private customer'|'company'>(null)
    const [submittionResult, setSubmittionResult] = useState<{ portfolioCode: string, portfolioType: string, modelPortfolio: string | null } | null>(null)
    const [submittionError, setSubmittionError] = useState<any | null>(null)
    const [addReprecentive, setAddReprecentive] = useState(false)
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

            name && form.setValue('surname', capitalize(name, 'word'))
            adress && form.setValue('address', capitalize(adress, 'word'))
            zip && form.setValue('postalCode', zip)
            city && form.setValue('city', capitalize(city, 'word'))
            form.trigger('surname')
            form.trigger('address')
            form.trigger('postalCode')
            form.trigger('city')
        } else if(response.status === 400) {
            const res = await response.json();
            form.setError('personalNumber', {
                type: 'custom',
                message: res.messages
            })
        } else if(response.status === 404) {
            form.setError('personalNumber', {
                type: 'custom',
                message: 'Company not exist, check for correct organization number'
            })
        } else {
            toast('Failed to company information.')
            form.setError('personalNumber', {
                type: 'custom',
                message: 'Cannot get company infomation, try again later.'
            })

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

            firstname && form.setValue('firstname', capitalize(firstname, 'word'))
            surname && form.setValue('surname', capitalize(surname, 'word'))
            adress && form.setValue('address2', capitalize(adress, 'word'))
            adress2 && form.setValue('address', capitalize(adress2, 'word'))
            zip && form.setValue('postalCode', zip)
            city && form.setValue('city', capitalize(city, 'word'))
            form.trigger('firstname')
            form.trigger('surname')
            form.trigger('address')
            form.trigger('postalCode')
            form.trigger('city')
            
        } else if(response.status === 404) {
            form.setError('personalNumber', {
                type: 'custom',
                message: 'Person not exist, check for correct social security number'
            })
        } else if(response.status === 400) {
            const res = await response.json();
            form.setError('personalNumber', {
                type: 'custom',
                message: res.messages
            })
        } else {
            toast('Failed to fetch personal information.')
            form.setError('personalNumber', {
                type: 'custom',
                message: 'Cannot get person infomation, try again later.'
            })

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

            firstname && form.setValue('reprecenterFirstname', capitalize(firstname, 'word'))
            surname && form.setValue('reprecenterSurname', capitalize(surname, 'word'))
            adress && form.setValue('reprecenterAddress2', capitalize(adress, 'word'))
            adress2 && form.setValue('reprecenterAddress', capitalize(adress2, 'word'))
            zip && form.setValue('reprecenterPostalCode', zip)
            city && form.setValue('reprecenterCity', capitalize(city, 'word'))
            form.trigger('reprecenterFirstname')
            form.trigger('reprecenterSurname')
            form.trigger('reprecenterAddress2')
            form.trigger('reprecenterAddress')
            form.trigger('reprecenterCity')
        } else if(response.status === 400) {
            const res = await response.json();
            form.setError('reprecenterPersonalNumber', {
                type: 'custom',
                message: res.messages
            })
        } else if(response.status === 404) {
            form.setError('reprecenterPersonalNumber', {
                type: 'custom',
                message: 'Person not exist, check for correct social security number'
            })
        } else {
            toast('Failed to fetch personal information.')
            form.setError('personalNumber', {
                type: 'custom',
                message: 'Cannot get person infomation, try again later.'
            })
        }
    }

    function onAddReprecenterChange(value: string){
        setAddReprecentive(value === 'item-1')
        if(value === ''){
            form.resetField('reprecenterPersonalNumber')
            form.resetField('reprecenterFirstname')
            form.resetField('reprecenterSurname')
            form.resetField('reprecenterAddress')
            form.resetField('reprecenterAddress2')
            form.resetField('reprecenterPostalCode')
            form.resetField('reprecenterCity')
            form.resetField('reprecenterMobile')
            form.resetField('reprecenterEmailAddress')
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
            form.setValue('personalNumber', formatedValue)
            isCompany !== 'true' && prefillPersonalInfo(formatedValue)
            isCompany === 'true' && prefillCompanyInfo(formatedValue)

        } catch (e) {
            toast('Cannot prefill values')
        }

    }, [])


    const isCompany = form.watch("isCompany");
    const accountModel = form.watch("modelPortfolioCode");

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
                                        form.reset({ ...formDefaultValues, portfolioTypeCode: undefined, isCompany: value === 'company' })
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
                                <Input placeholder={isCompany ? "Enter organization number" : "Enter social security number"} {...field}
                                 disabled={fetchingAutoFillValues === 'private customer' || fetchingAutoFillValues === 'company'}
                                 onBlur={(e => {
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

                    <span className="flex gap-6">
                        {!isCompany && 
                            <FormField
                                control={form.control}
                                name="firstname"
                                render={({ field }) => (
                                    <FormItem  className="flex-1/2">
                                        <FormLabel>First Name*</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter first name" {...field} value={field.value ?? ""} disabled={fetchingAutoFillValues === 'private customer'}/>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        }
                        <FormField control={form.control} name="surname" render={({ field }) => (
                            <FormItem className="flex-1/2">
                                <FormLabel>{isCompany ? "Company Name*" : "Surname*"}</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter surname" {...field} value={field.value ?? ""} disabled={fetchingAutoFillValues === 'private customer' || fetchingAutoFillValues === 'company'}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </span>
                    <div className="flex gap-6  flex-col lg:flex-row">
                        <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem className="flex-1/2">
                                <FormLabel>Address*</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter address" {...field} disabled={fetchingAutoFillValues === 'private customer' || fetchingAutoFillValues === 'company'}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="flex gap-6">
                            <FormField control={form.control} name="postalCode" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Postal Code*</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter postal code" {...field} value={field.value ?? ""} disabled={fetchingAutoFillValues === 'private customer' || fetchingAutoFillValues === 'company'}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="city" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>City*</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter city" {...field} disabled={fetchingAutoFillValues === 'private customer' || fetchingAutoFillValues === 'company'}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </div>
                    <div className="flex gap-6 flex-col lg:flex-row">
                        <FormField control={form.control} name="mobile" render={({ field }) => (
                            <FormItem className="flex-1/2">
                                <FormLabel>Mobile (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter mobile number" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="emailAddress" render={({ field }) => (
                            <FormItem className="flex-1/2">
                                <FormLabel>Email (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter email" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                {isCompany && (
                    <span>
                    <Separator />
                    <div className="flex items-center gap-2 mt-4 mb-6">
                        <Checkbox
                            id="add-representative"
                            checked={addReprecentive}
                            onCheckedChange={(checked) =>
                            onAddReprecenterChange(checked ? 'item-1' : '')
                            }
                        />
                        <label htmlFor="add-representative" className="text-sm font-medium">
                            Include representative (optional)
                        </label>
                    </div>
                    <Accordion type="single" collapsible className="w-full" value={addReprecentive ? 'item-1' : ''} onValueChange={(value) => onAddReprecenterChange(value)}>
                        <AccordionItem value="item-1">
                            <AccordionContent className="space-y-6">

                                <FormField control={form.control} name="reprecenterPersonalNumber" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Social security number*</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Social security number" {...field} value={field.value ?? ''}  
                                            disabled={fetchingAutoFillValues === 'reprecentive'} 
                                            onBlur={(e => {
                                                const value = e.target.value
                                                try {
                                                    const formatedValue =convertPersonalNumber(value)
                                                    form.setValue('reprecenterPersonalNumber', formatedValue)
                                                    prefillRepresentativeInfo(formatedValue)
                                                } catch (e) {
                                                    form.setError('reprecenterPersonalNumber', {
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
                                    <FormField control={form.control} name="reprecenterFirstname" render={({ field }) => (
                                        <FormItem className="flex-1/2">
                                            <FormLabel>Firstname*</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Firstname" {...field} value={field.value ?? ''} disabled={fetchingAutoFillValues === 'reprecentive'}/>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="reprecenterSurname" render={({ field }) => (
                                        <FormItem className="flex-1/2">
                                            <FormLabel>Surname*</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Surename" {...field} value={field.value ?? ''} disabled={fetchingAutoFillValues === 'reprecentive'}/>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                <div className="flex gap-6 flex-col lg:flex-row">
                                    <FormField control={form.control} name="reprecenterAddress" render={({ field }) => (
                                        <FormItem className="flex-1/2">
                                            <FormLabel>Adress*</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Adress" {...field} value={field.value ?? ''} disabled={fetchingAutoFillValues === 'reprecentive'}/>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <div className="flex">
                                        <FormField control={form.control} name="reprecenterPostalCode" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Portal code*</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Portal code" {...field} value={field.value ?? ''} disabled={fetchingAutoFillValues === 'reprecentive'}/>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="reprecenterCity" render={({ field }) => (
                                            <FormItem className="ml-5">
                                                <FormLabel>City*</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="City" {...field} value={field.value ?? ''} disabled={fetchingAutoFillValues === 'reprecentive'}/>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                                <div className="flex gap-6 flex-col lg:flex-row">
                                    <FormField control={form.control} name="reprecenterMobile" render={({ field }) => (
                                        <FormItem className="flex-1/2">
                                            <FormLabel>Mobile (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Mobile" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="reprecenterEmailAddress" render={({ field }) => (
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
                )}

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
                    <div className="flex gap-6">
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
                                    <FormLabel>{accountModel !== '' ? 'Investeringsrådgivningsarvode*' : 'Diskretionärt förvaltningsarvode*'}</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input placeholder="Fee value" {...field} value={field.value ?? ''} type="number" onChange={(e) => {
                                                const val = e.target.valueAsNumber;
                                                field.onChange(Number.isNaN(val) ? undefined : formatDecimals(val, 2));
                                            }} />
                                            <Percent className="absolute right-0 top-1/2 -translate-y-1/2 mr-2" size={16} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
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
