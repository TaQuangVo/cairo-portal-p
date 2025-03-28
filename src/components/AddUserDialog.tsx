"use client"
import { useRouter } from "next/navigation";

import { ErrorOption, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from "@/components/ui/switch"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Separator } from "./ui/separator"
import { convertPersonalNumber } from "@/utils/stringUtils"

const userFormSchema = z.object({
    personalNumber: z.string()
        .min(8, { message: "Personal number must be at least 10 characters." })
        .refine((value) => {
            try {
                convertPersonalNumber(value)
                return true
            }catch (error) {
                return false
            }
        }, {
            message: "Wrong Swedish personal number format.",
        }),
    role: z.enum(["admin", "user"]),
    isActive: z.boolean(),
    email: z.string().email().optional().nullable(),
    givenName: z.string().optional().nullable(),
    surname: z.string().optional().nullable(),
    phoneNumber: z.string().optional().nullable(),
})

type UserFormValues = z.infer<typeof userFormSchema>

export function AddUserDialog() {
    const router = useRouter()
    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            personalNumber: "",
            role: "user",
            isActive: true,
            email: null,
            givenName: null,
            surname: null,
            phoneNumber: null,
        },
        mode: "onChange",
    })


    async function onSubmit(data: UserFormValues): Promise<void> {
        try{
            data.personalNumber = convertPersonalNumber(data.personalNumber)
        } catch (error) {
            return
        }
        const response  = await fetch("/api/users", {
            method: "POST",
            body: JSON.stringify(data),
        })

        if(response.ok){
            toast("User added successfully:", {
                description: (
                    <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                        <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                    </pre>
                ),
            })
            router.refresh()
        }else if (response.status == 409){
            const data = await response.json();
            const error: ErrorOption = {
                message:data.messages
            }
            form.setError('personalNumber', error);
            toast(data.messages, {
                description: (
                    <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                        <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                    </pre>
                ),
            })
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant='default'>Add User</Button>
            </DialogTrigger>
            <DialogContent className="xl:min-w-[700px]">
                <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <Separator />
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                        <FormField
                            control={form.control}
                            name="personalNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Personal Number*</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter personal number" {...field} />
                                    </FormControl>
                                    <FormDescription>Personal number will be used to determin wherether a user can access the system.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex">
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem className="flex">
                                    <FormLabel>Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="user">User</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-2 ml-10">
                                    <FormLabel>Active</FormLabel>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        </div>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>
                                    Additional information(optional).
                                </AccordionTrigger>
                                <AccordionContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="">Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter email" {...field} value={field.value ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="givenName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Given Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter given name" {...field} value={field.value ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="surname"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Surname</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter surname" {...field} value={field.value ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="phoneNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter phone number" {...field} value={field.value ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                        <div className="flex justify-end mt-8">
                            <Button type="submit" disabled={!form.formState.isValid}>Add User</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}