'use client'
import { useSession } from "next-auth/react"
import Link from "next/link";
import { Button } from "./ui/button";

export default function LoginButton() {
    const { data } = useSession()
    console.log(data)
    console.log(data?.user)
  
    return (
      <>
        {
            data?.user ? (
                <Link href='/dashboard'><Button>Go to Dashboard</Button></Link>
            ) : (
                <Link href='/login'><Button>Login with BankId</Button></Link>
            )
        }
      </>
    );
  }