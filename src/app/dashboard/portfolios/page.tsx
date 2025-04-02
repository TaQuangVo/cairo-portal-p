import { NewPortfolioForm } from "@/components/NewPortfolioForm";
import { SiteHeader } from "@/components/SiteHeader";

export default async function Page() {
    return (
        <div className="">
            <SiteHeader title="Create Account"/>
            <div className="p-7 h-full">
                <div className="w-full rounded-md border p-4">
                    <NewPortfolioForm />
                </div>
            </div>
        </div>
    )
  }