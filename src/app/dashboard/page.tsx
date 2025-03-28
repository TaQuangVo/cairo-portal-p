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
                  <div className="flex flex-col justify-center items-center h-full">
                      Välcommen till Din dashboard...
                      <Link href='/dashboard/portfolios'>
                        <Button className="mt-7">
                          <PlusCircleIcon></PlusCircleIcon>
                          <p className="mr-6">
                            New Portfolio.
                          </p>
                        </Button>
                      </Link>
                  </div>
              </div>
          </div>
      </>
  )
}