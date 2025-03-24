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

import TiptapEditor from "./editor-component"
import { Label } from "@/components/ui/label"
import { useS3Upload } from "@/hooks/use-s3-upload"
import { Link } from "react-router"
export const ProblemHeader = () => {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()
    const filesRef = useRef<File[]>([])

    const { uploadMultipleToS3 } = useS3Upload({
        type: 'images',
        prefix: "problems"
    });

    const { mutate: createProblem, isPending } = useMutation({
        mutationFn: async (data: { content: string, title: string }) => {
            const { content, title } = data
            let imageKeys: { key: string; name: string; content_type: string; size: number }[] = [];

            if (filesRef.current && filesRef.current.length > 0) {
                const results = await uploadMultipleToS3(filesRef.current);
                imageKeys = results.map((result, index) => ({
                    key: result.key,
                    name: filesRef.current[index].name,
                    content_type: filesRef.current[index].type,
                    size: filesRef.current[index].size
                }));
            }

            const response = await instance.post('/problems', {
                title,
                content,
                images: imageKeys
            })

            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['problems'] })
            toast.success('Tạo problem thành công')
            setOpen(false)
            setContent('')
        },
        onError: () => {
            toast.error('Có lỗi xảy ra khi tạo problem')
        }
    })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo Problem
                </Button>
            </DialogTrigger>
            <DialogContent className="p-4">
                <DialogHeader>
                    <DialogTitle>Tạo Problem</DialogTitle>
                </DialogHeader>

                <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                    <div className="mb-4 space-y-2">
                        <Label>Tiêu đề problem</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Nội dung problem</Label>
                        <TiptapEditor content={content} setContent={setContent} filesRef={filesRef} />
                    </div>
                </div>

                <DialogFooter className="border-t border-gray-200">
                    <Button
                        className="bg-primary text-white rounded-full mt-4 px-4 text-sm"
                        onClick={() => createProblem({ content, title })}
                        disabled={isPending}
                    >
                        {isPending ? "Đang tạo..." : "Tạo Problem"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function Problems() {
    const [page, setPage] = useState(1)
    const [take, setTake] = useState(5)

    const { data, isLoading } = useQuery({
        queryKey: ['problems', page, take],
        queryFn: async () => {
            const response = await instance.get('/problems', {
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
                            <TableHead>Tiêu đề</TableHead>
                            <TableHead>Tổng Testcase</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.items?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">
                                    Chưa có problem nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.items?.map((problem: any) => (
                                <TableRow key={problem.id}>
                                    <TableCell className="font-medium">{problem.title}</TableCell>
                                    <TableCell>
                                        {problem.testcases.length || 0}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(problem.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link to={`/problems/${problem.id}`}>
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