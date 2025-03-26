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
  DropdownMenuSeparator,
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

export const columns: ColumnDef<DBBasePortfolioSubmittions>[] = [
    {
      header: "Personal Number",
      accessorFn: (row) => row.requestBody?.personalNumber, // Accessing the nested personalNumber
      id: "personalNumber", // Explicitly set the id for the column
    },
    {
      header: "First Name",
      accessorFn: (row) => row.requestBody?.firstname,
      id: "firstname", // Explicitly set the id for the column
    },
    {
      header: "Surname",
      accessorFn: (row) => row.requestBody?.surname,
      id: "surname",
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
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
        personalNumber: true,
        firstname: true,
        surname: true,
        address: false,
        postalCode: false,
        city: false,
        mobile: false,
        emailAddress: false,
        portfolioTypeCode: false,
        modelPortfolioCode: false,
        status: true,
        messages: true,
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
                  <TableRow key={row.id}>
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
      </div>
    );
  }
  