import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { instance } from "@/common/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import {Link} from "react-router";
import {Avatar, AvatarImage} from "@/components/ui/avatar";

export default function AdminPages() {
    const queryClient = useQueryClient();

    const [page, setPage] = useState(1);
    const [take, setTake] = useState(5);

    const { data, isLoading } = useQuery({
        queryKey: ["pages", page, take],
        queryFn: async () => {
            const res = await instance.get("/pages", {
                params: {
                    page,
                    take,
                },
            });
            return res.data;
        },
        // keepPreviousData: true,
    });

    const approveMutation = useMutation({
        mutationFn: async (pageId: string) => {
            await instance.post(`/api/pages/${pageId}/approve`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
        },
    });

    const rejectMutation = useMutation({
        mutationFn: async (pageId: string) => {
            await instance.post(`/api/pages/${pageId}/reject`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
        },
    });

    if (isLoading) {
        return (
            <div className="flex h-[200px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!data?.items || data.items.length === 0) {
        return (
            <p className="text-center text-gray-500 mt-8">
                Không có page nào cần duyệt.
            </p>
        );
    }

    return (
        <div className="mx-4 space-y-4">
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tên trang</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Url</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {data.items.map((item: any) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage className="object-cover" src={item?.avatar?.url} alt={item?.name} />
                                    </Avatar>
                                    {item.name}
                                </TableCell>
                                <TableCell>{item.email}</TableCell>
                                <TableCell>{item.url}</TableCell>
                                <TableCell>
                                    {item.status === "approved"
                                        ? "Đã duyệt"
                                        : item.status === "started"
                                            ? "Chờ duyệt"
                                            : "Bị từ chối"}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                        <Link to={`/pages/${item.id}`}>
                                            <Button
                                                variant="outline" size="sm" className="cursor-pointer"
                                            >
                                                Xem chi tiết
                                            </Button>
                                        </Link>
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => approveMutation.mutate(item.id)}
                                        disabled={approveMutation.isLoading}
                                    >
                                        Duyệt
                                    </Button>
                                    <Button
                                        className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => rejectMutation.mutate(item.id)}
                                        disabled={rejectMutation.isLoading}
                                    >
                                        Từ chối
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
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
                                    setTake(Number(e.target.value));
                                    setPage(1);
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
                                                onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                                            Math.abs(pageNumber - page) <= 1
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
                                                onClick={() =>
                                                    setPage((p) =>
                                                        Math.min(data.meta.pageCount, p + 1)
                                                    )
                                                }
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
    );
}
