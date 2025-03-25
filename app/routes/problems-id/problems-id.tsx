import { instance } from "@/common/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { Terminal, Upload, Trash, XCircle, CheckCircle, Pencil } from "lucide-react"
import { Link, useParams } from "react-router"
import { useRef, useState } from "react"
import { useS3Upload } from "@/hooks/use-s3-upload"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
} from "@/components/ui/pagination"
import { ProblemForm, type ProblemFormData } from "../problems/problem-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const getFileName = (file: File) => {
    const result = file.name.trim().replace(/\s+/g, "-");
    if (!result.startsWith('testcase_')) {
        return `testcase_${result}`;
    }
    return result;
}

// Thêm component để hiển thị độ khó với màu sắc tương ứng
const DifficultyBadge = ({ difficulty }: { difficulty: 'EASY' | 'MEDIUM' | 'HARD' }) => {
    const colors = {
        EASY: 'bg-green-100 text-green-800',
        MEDIUM: 'bg-yellow-100 text-yellow-800',
        HARD: 'bg-red-100 text-red-800'
    }

    const labels = {
        EASY: 'Dễ',
        MEDIUM: 'Trung bình',
        HARD: 'Khó'
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[difficulty]}`}>
            {labels[difficulty]}
        </span>
    )
}

export default function ProblemId() {
    const queryClient = useQueryClient()
    const { id } = useParams()
    const testcaseInputRef = useRef<HTMLInputElement>(null)
    const [filter, setFilter] = useState<'all' | 'missing'>('all')
    const [page, setPage] = useState(1)
    const [take, setTake] = useState(5)
    const [editDialogOpen, setEditDialogOpen] = useState(false)

    const { uploadMultipleToS3 } = useS3Upload({
        type: 'testcases',
        prefix: "problems/" + id
    });

    const { data, isLoading } = useQuery({
        queryKey: ['problem', id],
        queryFn: () => instance.get(`/problems/${id}`).then((res) => res.data),
        enabled: !!id
    })

    const { mutate: deleteTestcase, isPending: isDeleting } = useMutation({
        mutationFn: async (testcase: { input_id: string; output_id: string }) => {
            const response = await instance.delete(`/problems/${id}/testcase`, {
                data: {
                    input_id: testcase.input_id,
                    output_id: testcase.output_id
                }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['problem', id] });
            toast.success('Xóa testcase thành công');
        },
        onError: () => {
            toast.error('Có lỗi xảy ra khi xóa testcase');
        }
    });

    const { mutate: updateProblem, isPending: isUpdating } = useMutation({
        mutationFn: async (data: ProblemFormData) => {
            const response = await instance.patch(`/problems/${id}`, data)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['problem', id] })
            toast.success('Cập nhật problem thành công')
            setEditDialogOpen(false)
        },
        onError: () => {
            toast.error('Có lỗi xảy ra khi cập nhật problem')
        }
    })

    const handleTestCaseUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []).map((f) => ({
            ...f,
            name: getFileName(f)
        }));

        if (files && files.length > 0) {
            try {
                const results = await uploadMultipleToS3(files);
                const testcases = results.map((result, index) => ({
                    key: result.key,
                    name: files[index].name,
                    content_type: files[index].type || 'text/plain',
                    size: files[index].size || 0
                }));

                await instance.patch(`/problems/${id}`, {
                    testcases
                })

                queryClient.invalidateQueries({ queryKey: ['problem', id] });
                toast.success('Upload testcase thành công')
            } catch (error) {
                toast.error('Có lỗi xảy ra khi upload testcase')
            }
        }

        if (testcaseInputRef.current) {
            testcaseInputRef.current.value = ''
        }
    };

    const filteredTestcases = data?.testcases?.filter((testcase: any) => {
        if (filter === 'all') return true;
        if (filter === 'missing') {
            return !testcase.input || !testcase.output;
        }
        return true;
    });

    const paginatedTestcases = filteredTestcases?.slice((page - 1) * take, page * take)
    const totalPages = Math.ceil((filteredTestcases?.length || 0) / take)

    // Thêm hàm chuyển đổi đơn vị
    const formatTimeLimit = (ms: number) => (ms / 1000).toFixed(1)
    const formatMemoryLimit = (kb: number) => (kb / 1024).toFixed(1)

    if (isLoading) {
        return (
            <div className="flex h-[200px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    return (
        <div className="mx-4 space-y-8">
            {/* Header với title, difficulty và nút edit */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold">{data?.title}</h1>
                        <DifficultyBadge difficulty={data?.difficulty} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <p>Ngày tạo: {new Date(data?.createdAt).toLocaleDateString()}</p>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <span className="font-medium">Time Limit:</span>
                                <span>{formatTimeLimit(data?.timeLimit || 1000)}s</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="font-medium">Memory Limit:</span>
                                <span>{formatMemoryLimit(data?.memoryLimit || 262144)}MB</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <Pencil className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl p-4">
                        <DialogHeader>
                            <DialogTitle>Chỉnh sửa Problem</DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                            <ProblemForm
                                onSubmit={updateProblem}
                                isSubmitting={isUpdating}
                                initialData={{
                                    title: data?.title || '',
                                    content: data?.content || '',
                                    difficulty: data?.difficulty || 'easy',
                                    timeLimit: data?.timeLimit || 1000,
                                    memoryLimit: data?.memoryLimit || 262144,
                                    examples: data?.examples || [{ input: '', output: '', explanation: '' }],
                                    constraints: data?.constraints || ['']
                                }}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Problem Description */}
            <div className="space-y-6">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: data?.content }} />

                {/* Examples Section */}
                {data?.examples && data.examples.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Examples</h2>
                        <div className="grid gap-4">
                            {data.examples.map((example: any, index: number) => (
                                <div key={index} className="p-4 rounded-lg border space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="font-medium mb-2">Input:</div>
                                            <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                                                {example.input}
                                            </pre>
                                        </div>
                                        <div>
                                            <div className="font-medium mb-2">Output:</div>
                                            <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                                                {example.output}
                                            </pre>
                                        </div>
                                    </div>
                                    {example.explanation && (
                                        <div>
                                            <div className="font-medium mb-2">Explanation:</div>
                                            <p className="text-muted-foreground">{example.explanation}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Constraints Section */}
                {data?.constraints && data.constraints.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Constraints</h2>
                        <ul className="list-disc list-inside space-y-1">
                            {data.constraints.map((constraint: string, index: number) => (
                                <li key={index} className="text-muted-foreground">
                                    {constraint}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Testcases Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Testcases</h2>

                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Chú ý</AlertTitle>
                    <AlertDescription>
                        Vui lòng đặt tên file .in và .out giống nhau, để hệ thống chấm điểm chính xác (Ví dụ: abc.in, abc.out)
                        <br />
                        Nếu không hệ thống sẽ bỏ qua các file .in/.out nếu không có các file .out/.in tương ứng
                    </AlertDescription>
                </Alert>

                <div className="rounded-lg border">
                    <div className="p-4 border-b flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Hiển thị:</span>
                                <select
                                    className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                                    value={filter}
                                    onChange={(e) => {
                                        setFilter(e.target.value as 'all' | 'missing')
                                        setPage(1)
                                    }}
                                >
                                    <option value="all">Tất cả testcases</option>
                                    <option value="missing">Testcases thiếu file</option>
                                </select>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Tổng số: {filteredTestcases?.length || 0} testcase
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                ref={testcaseInputRef}
                                className="hidden"
                                multiple
                                onChange={handleTestCaseUpload}
                            />
                            <Button variant="outline" onClick={() => testcaseInputRef.current?.click()}>
                                <Upload className="mr-2 h-4 w-4" />
                                Tải file testcase
                            </Button>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Testcase</TableHead>
                                <TableHead>Input</TableHead>
                                <TableHead>Output</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedTestcases?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">
                                        {filter === 'missing' ? 'Không có testcase nào thiếu file' : 'Chưa có testcase nào'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedTestcases?.map((testcase: any) => (
                                    <TableRow key={testcase.id}>
                                        <TableCell className="font-medium">{testcase.name}</TableCell>
                                        <TableCell>
                                            {testcase.input ? (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <XCircle className="h-4 w-4 text-red-500" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Thiếu file input</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {testcase.output ? (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <XCircle className="h-4 w-4 text-red-500" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Thiếu file output</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    deleteTestcase({
                                                        input_id: testcase.input?.id,
                                                        output_id: testcase.output?.id
                                                    });

                                                }}
                                                disabled={isDeleting}
                                            >
                                                <Trash className="mr-2 h-4 w-4" />
                                                {isDeleting ? 'Đang xóa...' : 'Xóa'}
                                            </Button>
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
                                Tổng số: {filteredTestcases?.length || 0} testcase
                            </span>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-2 ml-auto">
                                <Pagination>
                                    <PaginationContent>
                                        {page > 1 && (
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                                    isActive={page === 1}
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

                                        {[...Array(totalPages)].map((_, i) => {
                                            const pageNumber = i + 1;
                                            if (
                                                pageNumber !== 1 &&
                                                pageNumber !== totalPages &&
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

                                        {page < totalPages - 2 && (
                                            <PaginationItem>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        )}

                                        {totalPages > 1 && (
                                            <PaginationItem>
                                                <PaginationLink
                                                    onClick={() => setPage(totalPages)}
                                                    isActive={page === totalPages}
                                                >
                                                    {totalPages}
                                                </PaginationLink>
                                            </PaginationItem>
                                        )}

                                        {page < totalPages && (
                                            <PaginationItem>
                                                <PaginationNext
                                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                                    isActive={page === totalPages}
                                                />
                                            </PaginationItem>
                                        )}
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}