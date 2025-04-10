"use client"

import * as React from "react";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, RotateCcw, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import { DBPortfolioSubmittions } from "@/lib/db.type";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { columns } from "./definition";
import { useDebounce } from "@/hooks/useDebounce";

  
  export function PortfolioDataTable({ submissions: defaultSubmittions }: {submissions:{submissions: DBPortfolioSubmittions[], total: number}}) {
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
        portfolioTypeCode: true,
        modelPortfolioCode: true,
        createdAccountId:true,
        status: true,
        messages: false,
        createdAt: false,
    });
    const [rowSelection, setRowSelection] = React.useState({});


    const [searchQuery, setSearchQuery] = React.useState("");
    const debouncedQuery = useDebounce(searchQuery, 500);
    const [submittions, setSubmittions] = React.useState<DBPortfolioSubmittions[]>(defaultSubmittions.submissions);
    const [loading, setLoading] = React.useState(false);
    const [pageIndex, setPageIndex] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(10);
    const [totalCount, setTotalCount] = React.useState(defaultSubmittions.total);

      
    const table = useReactTable<DBPortfolioSubmittions>({
      data: submittions,
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

    function onJsonViewChange(open:boolean) {
      setJsonDataView(null);
    }

    const reloadTableData = async (query:string, page:number, limit:number) => {
      setLoading(true)
      const res = await fetch(`/api/submittions?searchPersonalNumber=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      setLoading(false)
      const data = await res.json();
      setSubmittions(data.data.submissions);
      setTotalCount(data.data.total);
      if(debouncedQuery === '' && pageIndex === 0){
        defaultSubmittions.submissions = data.data.submissions;
      }
    }

    const fetchSubmittions = async (query:string, page:number, limit:number) => {
      if(debouncedQuery !== '' || pageIndex !== 0){
        setLoading(true);
        try {
            const res = await fetch(`/api/submittions?searchPersonalNumber=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
            const data = await res.json();
            setSubmittions(data.data.submissions);
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoading(false);
        }
      }else {
        setSubmittions(defaultSubmittions.submissions)
      }
    };

    React.useEffect(() => {
      let isNewSearch = false;
      // Detect if query has changed and reset page index
      if (pageIndex !== 0 && debouncedQuery !== "") {
        setPageIndex(0);
        isNewSearch = true;
        return; // Wait for state update, don't fetch yet
      }

      fetchSubmittions(debouncedQuery, pageIndex, pageSize);
    }, [debouncedQuery, pageIndex, pageSize]);
  
    return (
      <div className="w-full">
        <div className="flex items-center py-4">
          <Input
            placeholder="Filter by Personal Number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            //value={(table.getColumn("personalNumber")?.getFilterValue() as string) ?? ""}
            //onChange={(event) => table.getColumn("personalNumber")?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
          
          <Button variant="outline" className="ml-auto" onClick={() => reloadTableData(debouncedQuery, pageIndex, pageSize)}>
              <RotateCw className={loading ? "animate-spin" : ""}/>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-3">
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
                  {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
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
  