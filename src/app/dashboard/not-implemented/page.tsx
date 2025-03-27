import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

type SearchParams = Promise<{titleParam: string}>

async function HeaderWithDynamicParams({searchParams}: {searchParams: SearchParams}){
  const { titleParam } = await searchParams
  const title = titleParam ? `${titleParam}` : 'Not Implemented'

  return (
    <SiteHeader title={title}/>
  )
}

export default function Page({searchParams}: {searchParams: SearchParams}) {
  

  return (
    <>
      <div className="flex flex-1 flex-col">
        <Suspense fallback={<div>Loading...</div>}>
          <HeaderWithDynamicParams searchParams={searchParams}/>
        </Suspense>
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