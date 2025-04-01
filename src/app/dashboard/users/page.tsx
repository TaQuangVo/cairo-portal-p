import { AppSidebar } from "@/components/AppSidebar";
import { SiteHeader } from "@/components/SiteHeader";
import { UserDataTable } from "@/components/UserDateTable";
import { getUsers } from "@/services/userService";

export default async function Page() {
    let users = await getUsers()

    users = users.map((user) => ({
        ...user,
        _id: user._id.toString(),
        //createdAt: user.createdAt?.toISOString() ?? null,
        //updatedAt: user.updatedAt?.toISOString() ?? null,
    }));

    return (
        <>
            <SiteHeader title="Users."/>
            <div className="p-4 md:p-7 h-full relative">
                <UserDataTable users={users}/>
            </div>
        </>
    )
  }