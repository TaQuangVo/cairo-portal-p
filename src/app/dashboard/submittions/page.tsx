import { SiteHeader } from "@/components/SiteHeader";
import { PortfolioDataTable } from "@/components/SubmittionTable";
import { getSubmittions } from "@/services/submittionService";

export default async function Page() {
    const users = await getSubmittions(null, null, null, 1, 20)

    return (
        <>
            <SiteHeader title="Submittions."/>
            <div className="p-7 h-full relative">
                <PortfolioDataTable portfolios={users}/>
            </div>
        </>
    )
  }
  //