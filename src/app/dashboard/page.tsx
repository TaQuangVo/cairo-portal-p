import { SiteHeader } from "@/components/SiteHeader";

export default function Page() {
  return (
    <>
      <SiteHeader title="Users"/>
      <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                  <div className="flex flex-col justify-center items-center h-full">
                      Välcommen till Din dashboard...
                  </div>
              </div>
          </div>
      </>
  )
}