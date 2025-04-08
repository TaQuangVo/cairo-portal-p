import { AppSidebar } from "@/components/AppSidebar";
import { SiteHeader } from "@/components/SiteHeader";
import { UserDataTable } from "@/components/UserDateTable";
import { authOptions } from "@/lib/auth";
import { getUsers } from "@/services/userService";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";



export default async function Page() {
    const token = await getServerSession(authOptions);
    if(token === null || token.user === null){
        return redirect("/login");
    }

    if(token.user.role !== 'admin'){
        return redirect("/dashboard");
    }

    let users = await getUsers(0, 3)
    console.log('total: ' + users.total)

    return (
        <>
            <SiteHeader title="Users."/>
            <div className="p-4 md:p-7 h-full relative">
                <UserDataTable users={users}/>
            </div>
        </>
    )
  }