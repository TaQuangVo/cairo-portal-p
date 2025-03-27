'use client'
import { SiteHeader } from "@/components/SiteHeader";

export default function Page() {
  return (
    <>
      <div className="flex flex-1 flex-col">
        <SiteHeader title="Unauthorized"/>
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col justify-center items-center h-full">
                Unauthorized...
                <span onClick={() => history.back()} className="font-semibold underline">Go back</span>
            </div>
        </div>
      </div>
    </>
  )
}