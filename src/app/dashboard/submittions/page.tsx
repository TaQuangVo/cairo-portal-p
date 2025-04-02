import { SiteHeader } from "@/components/SiteHeader";
import { PortfolioDataTable } from "@/components/SubmittionTable";
import { authOptions } from "@/lib/auth";
import { DBBasePortfolioSubmittions } from "@/lib/db.type";
import { getSubmittions } from "@/services/submittionService";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

type Params = Promise<{ id: string }>

type SearchParams = Promise<{personalNumber?: string, userId?: string, status?: string, page?: number, limit?: number}>


const validStatuses: DBBasePortfolioSubmittions["status"][] = [
    "failed",
    "partial failure",
    "success",
    "warning",
    "error",
];

export default async function Page({ searchParams }: { params: Params, searchParams: SearchParams }) {
    const token = await getServerSession(authOptions);
    if(token === null || token.user === null){
        return redirect("/login");
    }

    const userId = token.user.id;
    const userRole = token.user.role;

    const searchParamsWaited = await searchParams;
    const personalNumber = searchParamsWaited.personalNumber || null;
    let userIdParam = searchParamsWaited.userId || null;
    const statusParam = searchParamsWaited.status as DBBasePortfolioSubmittions["status"] | null;
    const page = searchParamsWaited.page || 1;
    const limit = searchParamsWaited.limit || 20;

    if(userRole !== 'admin'){
        userIdParam = userId;
    }

    // Validate the status, ignore if invalid
    const status = validStatuses.includes(statusParam as DBBasePortfolioSubmittions["status"])
        ? (statusParam as DBBasePortfolioSubmittions["status"])
        : null;

    
    const users = await getSubmittions(userIdParam, personalNumber, status, page, limit)

    return (
        <>
            <SiteHeader title="Submittions."/>
            <div className="p-4 md:p-7 h-full relative">
                <PortfolioDataTable portfolios={users}/>
            </div>
        </>
    )
  }
  //