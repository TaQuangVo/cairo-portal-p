"use client"

import * as React from "react"
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
} from "@tanstack/react-table"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DBUser } from "@/lib/db.type"
import { columns } from "./definitions"
import { AddUserDialog } from "../AddUserDialog"
import { useRouter } from 'next/navigation'
import { useDebounce } from "@/hooks/useDebounce"


export function UserDataTable({users: defaultUsers}:{users: {users:DBUser[],total:number}}) {
  const router = useRouter()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
        _id: false,
        personalNumber: true,
        role: true,
        isActive: true,
        email: false,
        givenName: true,
        surname: true,
        phoneNumber: false,
        updatedAt: false,
        createdAt: false,
        actions: true,
    })
  const [rowSelection, setRowSelection] = React.useState({})
  const [firstRender, setFirstRender] = React.useState(true);

  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedQuery = useDebounce(searchQuery, 500);
  const [users, setUsers] = React.useState<DBUser[]>(defaultUsers.users);
  const [loading, setLoading] = React.useState(false);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(3);
  const [totalCount, setTotalCount] = React.useState(defaultUsers.total);




  React.useEffect(() => {
    if(firstRender){
        setFirstRender(false)
        return
    }

    let isNewSearch = false;
    // Detect if query has changed and reset page index
    if (pageIndex !== 0 && debouncedQuery !== "") {
      setPageIndex(0);
      isNewSearch = true;
      return; // Wait for state update, don't fetch yet
    }

    const fetchUsers = async () => {
        if(debouncedQuery !== '' || pageIndex !== 0){
          setLoading(true);
          try {
              const res = await fetch(`/api/users?searchPersonalNumber=${encodeURIComponent(debouncedQuery)}&page=${pageIndex}&limit=${pageSize}`);
              const data = await res.json();
              console.log(data)
              setUsers(data.users);
          } catch (err) {
              console.error("Failed to fetch users", err);
          } finally {
              setLoading(false);
          }
        }else {
          setUsers(defaultUsers.users)
        }
      };

    fetchUsers();
  }, [debouncedQuery, pageIndex, pageSize]);

  const table = useReactTable<DBUser>({
    data: users,
    columns,
    pageCount: Math.ceil(totalCount / pageSize),
    manualPagination: true,
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater;
      setPageIndex(newPagination.pageIndex);
      setPageSize(newPagination.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                placeholder="Filter personal number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                //value={(table.getColumn("personalNumber")?.getFilterValue() as string) ?? ""}
                //onChange={(event) =>
                //    table.getColumn("personalNumber")?.setFilterValue(event.target.value)
                //}
                className="max-w-sm"
                />
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                    Columns <ChevronDown />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                        return (
                        <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                            }
                        >
                            {column.id}
                        </DropdownMenuCheckboxItem>
                        )
                    })}
                </DropdownMenuContent>
                </DropdownMenu>
                <div className="ml-3">
                    <AddUserDialog />
                </div>
            </div>
            <div className="rounded-md border">
                <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                        return (
                            <TableHead key={header.id}>
                            {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                )}
                            </TableHead>
                        )
                        })}
                    </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                        <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        onClick={() => {router.push('/dashboard/users/'+row.original._id)}}
                        >
                        {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                            {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                            )}
                            </TableCell>
                        ))}
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                        >
                        No results.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
            {
                loading ? 
                <span className="text-sm text-muted-foreground">Loading...</span>
                :
                <div className="text-sm text-muted-foreground">
                    Page {pageIndex + 1} of {Math.ceil(totalCount / pageSize)}
                </div>
            }
                <div className="space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage() || loading}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage() || loading}
                >
                    Next
                </Button>
                </div>
            </div>
        </div>
    </div>
  )
}
