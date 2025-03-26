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
import { convertPersonalNumber } from "@/utils/stringUtils"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { useState } from "react"
import { NewPortfolioResponse } from "@/app/api/submittions/portfolios/helper"
import NewPortfolioSubmittionResult from "./NewPortfolioSubmittionResult"

const userPortfolioSchema = z.object({
    firstname: z.string().min(2, "Firstname must be at least 2 characters."),
    surname: z.string().min(2, "Surname must be at least 2 characters."),
    personalNumber: z.string()
        .min(10, { message: "Personal number must be at least 10 characters." })
        .refine((value) => {
            try {
                convertPersonalNumber(value)
                return true
            } catch (error) {
                return false
            }
        }, { message: "Invalid Swedish personal number format." }),
    address: z.string().min(5, "Address must be at least 5 characters."),
    address2: z.string().optional().nullable(),
    postalCode: z.string().min(4, "Postal code must be at least 4 characters."),
    city: z.string().min(2, "City must be at least 2 characters."),
    mobile: z.string().min(8, "Mobile number must be at least 8 characters.").or(z.literal("")).optional().nullable(),
    emailAddress: z.string().email("Invalid email format.").or(z.literal("")).optional().nullable(),
    portfolioTypeCode: z.enum(["ISK", "KF", "AF"]),
    modelPortfolioCode: z.string().optional().nullable(),
})

type UserPortfolioFormValues = z.infer<typeof userPortfolioSchema>

export function NewPortfolioForm() {
    const [showSubmittionModule, setShowSubmittionModule] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [submittionResult, setSubmittionResult] = useState<NewPortfolioResponse|null>(null)
    const form = useForm<UserPortfolioFormValues>({
        resolver: zodResolver(userPortfolioSchema),
        defaultValues: {
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
            modelPortfolioCode: "",
        },
        mode: "onChange",
    })

    function onCloseModule(open: boolean) {
        if(isLoading) return

        setShowSubmittionModule(open)
    }

    async function onSubmit(data: UserPortfolioFormValues): Promise<void> {
        setShowSubmittionModule(true)
        setIsLoading(true)

        const response = await fetch("/api/submittions/portfolios", {
            method: "POST",
            body: JSON.stringify(data),
        })

        setIsLoading(false)
        const responseData = await response.json()
        setSubmittionResult(responseData as NewPortfolioResponse)

        if (response.ok) {

            toast("User Portfolio added successfully!", {
                description: (
                    <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                        <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                    </pre>
                ),
            })
        } else {
            toast("Something went wrong!")
        }
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                    {/* Customer Information Section */}
                                <FormField control={form.control} name="firstname" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name*</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter first name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="surname" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Surname*</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter surname" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            <FormField control={form.control} name="personalNumber" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Personal Number*</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter personal number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="address" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address*</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            {/*
                            <FormField control={form.control} name="address2" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address 2 (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter additional address" {...field} value={field.value ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            */}
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
                                        <Input placeholder="Enter mobile number" {...field} value={field.value ?? ''}/>
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

                    {/* Portfolio Configuration Section */}
                            <FormField control={form.control} name="portfolioTypeCode" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Portfolio Type*</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select portfolio type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="ISK">ISK</SelectItem>
                                            <SelectItem value="KF">KF</SelectItem>
                                            <SelectItem value="AF">AF</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="modelPortfolioCode" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Model Portfolio Code (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter model portfolio code" {...field} value={field.value ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                    <div className="flex flex-col items-end mt-20 mb-9">
                        <Button type="submit" disabled={!form.formState.isValid}>Create New Portfolio</Button>
                        {
                            !form.formState.isValid &&
                            <p className="text-sm mt-3">Fill in all required fields to continues!</p>
                        }
                    </div>
                </form>
            </Form>
            <Dialog open={showSubmittionModule} onOpenChange={onCloseModule}>
                <DialogContent className="sm:max-w-[525px]" onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
                    <NewPortfolioSubmittionResult data={submittionResult} onCloseButtonPress={() => setShowSubmittionModule(false)}/>
                </DialogContent>
            </Dialog>
        </>
    )
}
