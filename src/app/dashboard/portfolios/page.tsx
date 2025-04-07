import { NewPortfolioForm } from "@/components/NewPortfolioForm";
import { SiteHeader } from "@/components/SiteHeader";

export default async function Page() {
    return (
        <div className="">
            <SiteHeader title="Create Account"/>
            <div className="p-2 lg:p-7 h-full">
                <div className="w-full rounded-md border p-3 lg:p-4">
                    <NewPortfolioForm />
                </div>
            </div>
        </div>
    )
  }