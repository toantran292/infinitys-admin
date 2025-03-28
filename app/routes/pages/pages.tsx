import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { instance } from "@/common/api"
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

import { Link } from "react-router"
// import { ProblemForm, type ProblemFormData } from "./problem-form"

export enum PageStatus {
    STARTED = 'started',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export const StatusBadge = ({ status }: { status: PageStatus }) => {
    const colors = {
        [PageStatus.STARTED]: 'bg-yellow-100 text-yellow-800',
        [PageStatus.APPROVED]: 'bg-green-100 text-green-800',
        [PageStatus.REJECTED]: 'bg-red-100 text-red-800'
    }

    const labels = {
        [PageStatus.STARTED]: 'Đang xử lý',
        [PageStatus.APPROVED]: 'Đã duyệt',
        [PageStatus.REJECTED]: 'Từ chối'
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
            {labels[status]}
        </span>
    )
}

export const ProblemHeader = () => {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()

    return (
        <div></div>
    )
}

export default function Pages() {
    const [page, setPage] = useState(1)
    const [take, setTake] = useState(5)

    const { data, isLoading } = useQuery({
        queryKey: ['problems', page, take],
        queryFn: async () => {
            const response = await instance.get('/pages', {
                params: {
                    page,
                    take
                }
            })
            return response.data
        }
    })

    if (isLoading) {
        return (
            <div className="flex h-[200px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    return (
        <div className="mx-4 space-y-4">
            <ProblemHeader />

            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tên pages</TableHead>
                            <TableHead>Địa chỉ</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.items?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">
                                    Chưa có pages nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.items?.map((page: any) => (
                                <TableRow key={page.id}>
                                    <TableCell className="font-medium">{page.name}</TableCell>
                                    <TableCell>
                                        {page.address}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(page.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={page.status as PageStatus} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link to={`/pages/${page.id}`}>
                                            <Button variant="outline" size="sm" className="cursor-pointer">
                                                Chi tiết
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                <div className="py-4 px-6 border-t flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Hiển thị</span>
                            <select
                                className="h-8 w-20 rounded-md border border-input bg-background px-2 text-sm"
                                value={take}
                                onChange={(e) => {
                                    setTake(Number(e.target.value))
                                    setPage(1)
                                }}
                            >
                                {[5, 10, 15, 20, 50].map((value) => (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                            <span className="text-sm text-muted-foreground">mục</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            Tổng số: {data.meta.itemCount} mục
                        </span>
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                        {data.meta.pageCount > 1 && (
                            <Pagination>
                                <PaginationContent>
                                    {data.meta.hasPreviousPage && (
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                            />
                                        </PaginationItem>
                                    )}

                                    <PaginationItem>
                                        <PaginationLink
                                            onClick={() => setPage(1)}
                                            isActive={page === 1}
                                        >
                                            1
                                        </PaginationLink>
                                    </PaginationItem>

                                    {page > 3 && (
                                        <PaginationItem>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    )}

                                    {[...Array(data.meta.pageCount)].map((_, i) => {
                                        const pageNumber = i + 1;
                                        if (
                                            pageNumber !== 1 &&
                                            pageNumber !== data.meta.pageCount &&
                                            (Math.abs(pageNumber - page) <= 1)
                                        ) {
                                            return (
                                                <PaginationItem key={pageNumber}>
                                                    <PaginationLink
                                                        onClick={() => setPage(pageNumber)}
                                                        isActive={page === pageNumber}
                                                    >
                                                        {pageNumber}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            );
                                        }
                                        return null;
                                    })}

                                    {page < data.meta.pageCount - 2 && (
                                        <PaginationItem>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    )}

                                    {data.meta.pageCount > 1 && (
                                        <PaginationItem>
                                            <PaginationLink
                                                onClick={() => setPage(data.meta.pageCount)}
                                                isActive={page === data.meta.pageCount}
                                            >
                                                {data.meta.pageCount}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )}

                                    {data.meta.hasNextPage && (
                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => setPage(p => Math.min(data.meta.pageCount, p + 1))}
                                            />
                                        </PaginationItem>
                                    )}
                                </PaginationContent>
                            </Pagination>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}