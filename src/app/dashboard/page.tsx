import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { PlusCircleIcon, UserCircleIcon } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page() {
  const token = await getServerSession(authOptions);
  if(token === null || token.user === null){
      return redirect("/login");
  }
  
  return (
    <>
      <SiteHeader title="Dashboard."/>
      <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                  <div className="flex flex-col justify-center items-center h-full text-center space-y-4">
                      <Link href='/dashboard/portfolios'>
                        <Button>
                          <PlusCircleIcon></PlusCircleIcon>
                          <p className="mr-6">
                            Create Account.
                          </p>
                        </Button>
                      </Link>
                      <span className="text-sm text-center">
                        <span className="opacity-100 font-semibold">Click to create a new account.</span><br/> 
                        <span className="opacity-65">(If the customer does not already exist, <br/> 
                        one will be created automatically before the account is added)</span>
                      </span>
                      {token.user.email === null || token.user.email === '' &&
                        <span className=" pt-7 space-y-4 flex flex-col items-center">
                          <Link href='/dashboard/portfolios'>
                            <Button variant='outline'>
                              <UserCircleIcon></UserCircleIcon>
                              <p className="mr-6">
                                Update Profile.
                              </p>
                            </Button>
                          </Link>
                          <div className="text-sm text-center">
                            <span className="opacity-65">(<strong>Email is important!!!</strong>, update your account <br/> 
                            with your email. In case suport team want to contact you.)</span>
                          </div>
                        </span>
                      }
                  </div>
              </div>
          </div>
      </>
  )
}