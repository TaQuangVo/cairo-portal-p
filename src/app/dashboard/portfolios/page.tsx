import { NewPortfolioForm } from "@/components/NewPortfolioForm";
import { SiteHeader } from "@/components/SiteHeader";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserDataTable } from "@/components/UserDateTable";
import { getUsers } from "@/services/userService";

export default async function Page() {
    const users = await getUsers()

    return (
        <div className="">
            <SiteHeader title="Create New Portfolio"/>
            <div className="p-7 h-full">
                <div className="w-full rounded-md border p-4">
                    <NewPortfolioForm />
                </div>
            </div>
        </div>
    )
  }