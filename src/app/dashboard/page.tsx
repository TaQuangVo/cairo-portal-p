import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <SiteHeader title="Dashboard."/>
      <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                  <div className="flex flex-col justify-center items-center h-full text-center space-y-7">
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
                  </div>
              </div>
          </div>
      </>
  )
}