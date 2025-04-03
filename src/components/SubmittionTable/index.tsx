"use client"

import * as React from "react";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DBBasePortfolioSubmittions } from "@/lib/db.type";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

export const columns: ColumnDef<DBBasePortfolioSubmittions>[] = [
    {
      header: "Personal Number",
      accessorFn: (row) => row.requestBody?.personalNumber, // Accessing the nested personalNumber
      id: "personalNumber", // Explicitly set the id for the column
    },
    {
      header: "Name",
      accessorFn: (row) => row.requestBody?.firstname + ' ' + row.requestBody?.surname , // Accessing the nested surname and firstname
      id: "name" 
      ,
    },
    {
      header: "Type",
      accessorFn: (row) => row.requestBody.isCompany ? 'Company' : 'Private' , // Accessing the nested surname and firstname
      id: "type" 
      ,
    },
    {
      header: "Address",
      accessorFn: (row) => row.requestBody?.address,
      id: "address",
    },
    {
      header: "Postal Code",
      accessorFn: (row) => row.requestBody?.postalCode,
      id: "postalCode",
    },
    {
      header: "City",
      accessorFn: (row) => row.requestBody?.city,
      id: "city",
    },
    {
      header: "Mobile",
      accessorFn: (row) => row.requestBody?.mobile,
      id: "mobile",
    },
    {
      header: "Email Address",
      accessorFn: (row) => row.requestBody?.emailAddress,
      id: "emailAddress",
    },
    {
      header: "Portfolio Type",
      accessorFn: (row) => row.requestBody?.portfolioTypeCode,
      id: "portfolioTypeCode",
    },
    {
      header: "Model Portfolio Code",
      accessorFn: (row) => row.requestBody?.modelPortfolioCode,
      id: "modelPortfolioCode",
    },
    {
      header: "Status",
      accessorKey: "status", // No change needed for top-level field
      id: "status",
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
  
  export function PortfolioDataTable({ portfolios }: { portfolios: DBBasePortfolioSubmittions[] }) {
    const [jsonDataView, setJsonDataView] = React.useState<string | null>(null);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
        personalNumber: true,
        name: true,
        address: false,
        postalCode: false,
        city: false,
        mobile: false,
        emailAddress: false,
        portfolioTypeCode: false,
        modelPortfolioCode: false,
        status: true,
        messages: true,
        createdAt: false,
    });
    const [rowSelection, setRowSelection] = React.useState({});
  
    const table = useReactTable<DBBasePortfolioSubmittions>({
      data: portfolios,
      columns,
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      onColumnVisibilityChange: setColumnVisibility,
      onRowSelectionChange: setRowSelection,
      state: { sorting, columnFilters, columnVisibility, rowSelection },
    });

    function onJsonViewChange(open:boolean) {
      setJsonDataView(null);
    }
  
    return (
      <div className="w-full">
        <div className="flex items-center py-4">
          <Input
            placeholder="Filter by Personal Number..."
            value={(table.getColumn("personalNumber")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("personalNumber")?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table.getAllColumns().map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} onClick={() => setJsonDataView(JSON.stringify(row.original, null, 2))}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>



        {
          jsonDataView &&
            <Dialog open={true} onOpenChange={onJsonViewChange}>
              <DialogContent  className="md:min-w-[600px] lg:min-w-[900px] xl:min-w-[1200px]">
                <DialogHeader>
                  <DialogTitle>Json Viewer</DialogTitle>
                  <DialogDescription>
                    Show the relevant context of the request.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <pre className="p-4 bg-gray-100 rounded-md overflow-auto">{jsonDataView}</pre>
                </div>

                <DialogFooter>
                  <Button type="button" onClick={() => navigator.clipboard.writeText(JSON.stringify(jsonDataView))}>Copy JSON</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        }
      </div>
    );
  }
  