import { AppSidebar } from "@/components/AppSidebar";
import { SiteHeader } from "@/components/SiteHeader";
import { UserDataTable } from "@/components/UserDateTable";
import { getUsers } from "@/services/userService";

export default async function Page() {
    const users = await getUsers()

    return (
        <>
            <SiteHeader title="Users."/>
            <div className="p-7 h-full relative">
                <UserDataTable users={users}/>
            </div>
        </>
    )
  }