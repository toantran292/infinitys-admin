import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { instance } from "@/common/api"
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
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { RoleBadge, RoleTypePage } from "./role-badge"

interface UserTableProps {
    pageId: string
}

interface User {
    id: string
    fullName: string
    firstName: string
    lastName: string
    email: string
    pageRole: RoleTypePage
    createdAt: string
}

export function UserTable({ pageId }: UserTableProps) {
    const [page, setPage] = useState(1)
    const [take, setTake] = useState(5)

    const { data: usersData } = useQuery({
        queryKey: ['page-users', pageId, page, take],
        queryFn: () => instance.get(`/pages/${pageId}/users`, {
            params: { page, take }
        }).then(res => res.data)
    })

    return (
        <div className="rounded-lg border mt-6">
            <div className="px-6 py-3 border-b bg-muted/50">
                <h2 className="text-lg font-semibold">Danh sách người dùng</h2>
            </div>
            <div className="p-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tên</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Vai trò</TableHead>
                            <TableHead>Ngày tham gia</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {usersData?.items?.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="text-center h-24 text-muted-foreground"
                                >
                                    Chưa có người dùng nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            usersData?.items?.map((user: User) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        {user.fullName || user.firstName + ' ' + user.lastName}
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <RoleBadge role={user.pageRole} />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                // Xử lý khi click
                                            }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                Hiển thị
                            </span>
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
                            <span className="text-sm text-muted-foreground">
                                mục
                            </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            Tổng số: {usersData?.meta?.itemCount || 0} người dùng
                        </span>
                    </div>

                    {usersData?.meta?.pageCount > 1 && (
                        <Pagination>
                            <PaginationContent>
                                {page > 1 && (
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                        />
                                    </PaginationItem>
                                )}

                                {[...Array(usersData.meta.pageCount)].map((_, i) => {
                                    const pageNumber = i + 1;
                                    if (
                                        pageNumber === 1 ||
                                        pageNumber === usersData.meta.pageCount ||
                                        (pageNumber >= page - 1 && pageNumber <= page + 1)
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
                                    if (
                                        pageNumber === page - 2 ||
                                        pageNumber === page + 2
                                    ) {
                                        return (
                                            <PaginationItem key={pageNumber}>
                                                ...
                                            </PaginationItem>
                                        );
                                    }
                                    return null;
                                })}

                                {page < usersData.meta.pageCount && (
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setPage(p => Math.min(usersData.meta.pageCount, p + 1))}
                                        />
                                    </PaginationItem>
                                )}
                            </PaginationContent>
                        </Pagination>
                    )}
                </div>
            </div>
        </div>
    )
} 