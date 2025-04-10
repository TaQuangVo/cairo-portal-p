'use client'
import { SiteHeader } from '@/components/SiteHeader'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { DBUser } from '@/lib/db.type'
import { convertPersonalNumber } from '@/utils/stringUtils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Session } from 'next-auth'
import { signIn, useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ErrorOption, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { set, z } from 'zod'

const userFormSchema = z.object({
    _id: z.string(),
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
    email: z.string().email().or(z.literal('')).optional().nullable(),
    givenName: z.string().optional().nullable(),
    surname: z.string().optional().nullable(),
    phoneNumber: z.string().optional().nullable(),
})

type UserFormValues = z.infer<typeof userFormSchema>

export default function Page() {
    const router = useRouter()
    const [ sessionData, setSessionData ] = useState<Session | null>(null)
    const session = useSession()
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [originalData, setOriginalData] = useState<DBUser | null>(null) 
    const [error, setError] = useState<string | null>(null)
    const params = useParams()

    useEffect(() => {
        setSessionData(session.data) // prevent hidration error
    }, [sessionData, session])

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            _id:'',
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
        setIsLoading(true)
        try{
            data.personalNumber = convertPersonalNumber(data.personalNumber)
        } catch (error) {
            return
        }
        const response  = await fetch("/api/users", {
            method: "PATCH",
            body: JSON.stringify(data),
        })
        setIsLoading(false)

        if(response.ok){
            toast("User updated successfully:", {
                description: (
                    <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                        <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                    </pre>
                ),
            })
            setIsEditing(false)
            router.refresh()

            // if update own info, revalidate jwt token
            if(session.data && data._id == session.data.user.id){
                await signIn("credentials", {
                    redirect: false,
                    transactionId: ''
                })
            }
        }else{
            const data = await response.json();

            toast(data.messages, {
                description: (
                    <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                        <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                    </pre>
                ),
            })
        }
    }

    async function setEdit(val:boolean) {
        setIsEditing(val)

        if(!val && originalData){
            form.reset({
                _id: originalData.personalNumber,
                personalNumber: originalData.personalNumber,
                role: originalData.role,
                isActive: originalData.isActive,
                email: originalData.email,
                givenName: originalData.givenName,
                surname: originalData.surname,
                phoneNumber: originalData.phoneNumber
            })
        }
    }

    async function getUser(id: string) {
        const response  = await fetch("/api/users?id=" + id, {
            method: "GET",
        })

        if(response.ok){
            const data:DBUser = await response.json()
            setOriginalData(data)
            form.reset({
                _id:data._id,
                personalNumber: data.personalNumber,
                role: data.role,
                isActive: data.isActive,
                email: data.email,
                givenName: data.givenName,
                surname: data.surname,
                phoneNumber: data.phoneNumber
            })
        }else{
            const data = await response.json()
            console.log(data)
            setError(data.messages)
        }
    }


    useEffect(() => {
        if(params.id){
            const id = typeof params.id === 'string' ? params.id : params.id[0]
            getUser(id)
        }else{
            setError("User ID not found")
        }
    }, [])

    if(error){
        return (
            <>
                <SiteHeader title="User."/>
                <div className='mx-auto, my-auto'>
                    <p className='text-center text-red-600'>Error: {error}</p>
                </div>
            </>
        )
    }

    return (
        <>
        <SiteHeader title="User."/>
        <div className='p-4 md:p-7'>
            <div className="w-full md:rounded-md md:border md:p-4">
                <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                            <FormField
                                control={form.control}
                                name="personalNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Personal Number*</FormLabel>
                                        <FormControl>
                                            <Input disabled={(!isEditing || session.data === null || session.data.user.role !== 'admin')} placeholder="Enter personal number" {...field} />
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
                                        <Select onValueChange={field.onChange} value={field.value}  disabled={(!isEditing || session.data === null || session.data.user.role !== 'admin')}>
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
                                            <Switch checked={field.value} onCheckedChange={field.onChange}  disabled={(!isEditing || session.data === null || session.data.user.role !== 'admin')}/>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            </div>
                            <Accordion type="single" collapsible={false} className="w-full" value='item-1'>
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
                                                        <Input disabled={!isEditing} placeholder="Enter email" {...field} value={field.value ?? ""} />
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
                                                        <Input disabled={!isEditing} placeholder="Enter given name" {...field} value={field.value ?? ""} />
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
                                                        <Input disabled={!isEditing} placeholder="Enter surname" {...field} value={field.value ?? ""} />
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
                                                        <Input disabled={!isEditing} placeholder="Enter phone number" {...field} value={field.value ?? ""} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <div className="flex justify-end mt-8">
                                {
                                    isEditing ? (
                                        <>
                                            <Button type="button" variant='outline' onClick={() => setEdit(false)} disabled={isLoading}>Cancel</Button>
                                            <Button className='ml-3' type="submit" disabled={!form.formState.isValid || isLoading}>Save</Button>
                                        </>
                                    ) : (
                                        <Button type="button" onClick={() => setEdit(true)}>Edit</Button>
                                    )
                                }
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
    </>
    );
}