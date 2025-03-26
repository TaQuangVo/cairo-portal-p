import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";

export default function Page() {
  return (
    <>
      <SiteHeader title="Dashboard."/>
      <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                  <div className="flex flex-col justify-center items-center h-full">
                      Välcommen till Din dashboard...
                      <Button className="mt-7">
                        <PlusCircleIcon></PlusCircleIcon>
                        <p className="mr-6">
                          New Portfolio.
                        </p>
                      </Button>
                  </div>
              </div>
          </div>
      </>
  )
}