import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <SiteHeader title="Not implemented"/>
      <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                  <div className="flex flex-col justify-center items-center h-full">
                      Page not implemented... 
                      <Link href='/dashboard' className="font-semibold underline">Go back</Link>
                  </div>
              </div>
          </div>
      </>
  )
}