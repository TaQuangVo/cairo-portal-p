import { DBPortfolioSubmittions } from "@/lib/db.type";
import { ColumnDef } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react";
import { SequentialCustomerAccountPortfolioCreationResult } from "@/services/cairoServiceV2";

export const columns: ColumnDef<DBPortfolioSubmittions>[] = [
  {
    header: "Name",
    accessorFn: (row) => (row.requestBody.mainActor.firstname ?? '') + ' ' + row.requestBody.mainActor.surname , // Accessing the nested surname and firstname
    id: "Name" 
    ,
  },
    {
      header: "Personal Number",
      accessorFn: (row) => row.requestBody.mainActor.personalNumber, // Accessing the nested personalNumber
      id: "personalNumber", // Explicitly set the id for the column
      cell(props ) {
        return (
          <p>{props.getValue() as string}</p>
        )
      },
    },
    {
      header: "Status",
      accessorKey: "status", // No change needed for top-level field
      id: "status",
    },
    {
      header: "Type",
      accessorFn: (row) => row.requestBody.isCompany ? 'Company' : 'Private' , // Accessing the nested surname and firstname
      id: "type" 
      ,
    },
    {
      header: "Address",
      accessorFn: (row) => row.requestBody.mainActor.address,
      id: "address",
    },
    {
      header: "Postal Code",
      accessorFn: (row) => row.requestBody.mainActor.postalCode,
      id: "postalCode",
    },
    {
      header: "City",
      accessorFn: (row) => row.requestBody.mainActor.city,
      id: "city",
    },
    {
      header: "Mobile",
      accessorFn: (row) => row.requestBody.mainActor.mobile,
      id: "mobile",
    },
    {
      header: "Email Address",
      accessorFn: (row) => row.requestBody.mainActor.emailAddress,
      id: "emailAddress",
    },
    {
      header: "Account Type",
      accessorFn: (row) => row.requestBody.accountDetails.portfolioTypeCode,
      id: "portfolioTypeCode",
    },
    {
      header: "Account Model",
      accessorFn: (row) => row.requestBody.accountDetails.modelPortfolioCode,
      id: "modelPortfolioCode",
    },
    {
      header: "AccountID",
      accessorFn: (row) => {
        if(row.data){
          const response: SequentialCustomerAccountPortfolioCreationResult = row.data as SequentialCustomerAccountPortfolioCreationResult
          return response.portfolioCreation.payload.portfolioDescription ?? ''
        }else{
          return ''
        }
      },
      id: "createdAccountId" 
    },
    {
      header: "Messages",
      accessorKey: "messages", // No change needed for top-level field
      id: "messages",
    },
    {
      header: "Created time",
      accessorFn: (row) => row.createdAt,
      cell: ({ row }) => {
        return (
          <p>{(row.getValue("createdAt") as Date).toLocaleString()}</p>
        )
      },
      id: "createdAt",
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center justify-end w-full">
                  <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal />
                  </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(JSON.stringify(row.original))}
              >
                Copy JSON data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ];