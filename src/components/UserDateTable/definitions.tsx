import { DBUser } from "@/lib/db.type"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "../ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "../ui/dropdown-menu"
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"

export const columns: ColumnDef<DBUser>[] = [

    {
      accessorKey: "_id",
      header: "Id",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("_id")}</div>
      ),
    },
    {
      accessorKey: "personalNumber",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >Personal Number
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => <div className="lowercase px-3">{row.getValue("personalNumber")}</div>,
    },
    {
      accessorKey: "role",
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => {
        return <div className="text-right font-medium">{row.getValue("role")}</div>
      },
    },
    {
      accessorKey: "isActive",
      header: () => <div className="text-right">Active</div>,
      cell: ({ row }) => {
        return <div className="text-right font-medium">{row.getValue("isActive")? 'true' : 'false'}</div>
      },
    },
    {
      accessorKey: "email",
      header: () => <div className="text-right">Email</div>,
      cell: ({ row }) => {
        return <div className="text-right font-medium">{row.getValue("email")}</div>
      },
    },
    {
      accessorKey: "givenName",
      header: () => <div className="text-right">Given name</div>,
      cell: ({ row }) => {
        return <div className="text-right font-medium">{row.getValue("givenName")}</div>
      },
    },
    {
      accessorKey: "surname",
      header: () => <div className="text-right">Sur name</div>,
      cell: ({ row }) => {
        return <div className="text-right font-medium">{row.getValue("surname")}</div>
      },
    },
    {
      accessorKey: "phoneNumber",
      header: () => <div className="text-right">Phone number</div>,
      cell: ({ row }) => {
        return <div className="text-right font-medium">{row.getValue("phoneNumber")}</div>
      },
    },
    {
      accessorKey: "updatedAt",
      header: () => <div className="text-right">Last update</div>,
      cell: ({ row }) => {
        return <div className="text-right font-medium">{(row.getValue("updatedAt") as Date).toLocaleString()}</div>
      },
    },
    {
      accessorKey: "createdAt",
      header: () => <div className="text-right">Create date</div>,
      cell: ({ row }) => {
        return <div className="text-right font-medium">{(row.getValue("createdAt") as Date).toLocaleString()}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const payment = row.original
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
                onClick={() => navigator.clipboard.writeText(payment._id)}
              >
                Copy payment ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View customer</DropdownMenuItem>
              <DropdownMenuItem>View payment details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]