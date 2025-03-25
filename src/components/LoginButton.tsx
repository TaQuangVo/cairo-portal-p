import { getServerSession } from "next-auth";
import Link from "next/link";
import { Button } from "./ui/button";

export default async function LoginButton() {
  const session = await getServerSession();
  
    return (
      <>
        {
            session?.user ? (
                <Link href='/dashboard'><Button>Go to Dashboard</Button></Link>
            ) : (
                <Link href='/login'><Button>Login with BankId</Button></Link>
            )
        }
      </>
    );
  }