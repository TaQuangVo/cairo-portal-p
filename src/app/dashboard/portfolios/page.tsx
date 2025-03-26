import { NewPortfolioForm } from "@/components/NewPortfolioForm";
import { SiteHeader } from "@/components/SiteHeader";
import { UserDataTable } from "@/components/UserDateTable";
import { getUsers } from "@/services/userService";

export default async function Page() {
    const users = await getUsers()

    return (
        <div className="">
            <SiteHeader title="Create New Portfolio"/>
            <div className="p-7">
                <NewPortfolioForm />
            </div>
        </div>
    )
  }