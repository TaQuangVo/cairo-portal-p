import { SiteHeader } from "@/components/SiteHeader"
import { Skeleton } from "@/components/ui/skeleton"

type SearchParams = Promise<{ titleParam: string }>

export default function Loading({ searchParams }: { searchParams: SearchParams }) {
    // You can add any UI inside Loading, including a Skeleton.
    return (
        <>
            <SiteHeader title="Loadning..." />
            <div className="w-full p-7">
                <div className="flex flex-col space-y-5">
                    <div className="flex justify-between">
                        <Skeleton className="w-[380px] h-[36px]" />
                        <Skeleton className="w-[109px] h-[36px]" />
                    </div>
                    <Skeleton className="h-[500px] w-full rounded-md" />
                    <div className="flex justify-end">
                        <Skeleton className="w-[57px] h-[31px]" />
                        <Skeleton className="w-[84px] h-[31px]" />
                    </div>
                </div>
            </div>
        </>)
}