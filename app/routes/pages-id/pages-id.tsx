import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Pencil, Check, X } from "lucide-react"
import { useParams } from "react-router"
import { instance } from "@/common/api"
import { PageStatus, StatusBadge } from "../pages/pages"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { UserTable } from "./user-table"

interface EditableFieldProps {
    value: string
    onSave?: (value: string) => Promise<void>
    label: string
    type?: "input" | "textarea"
    disabledEdit?: boolean
}

const EditableField = ({ value, onSave = () => Promise.resolve(), label, type = "input", disabledEdit = false }: EditableFieldProps) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState(value)
    const [isLoading, setIsLoading] = useState(false)

    const handleSave = async () => {
        try {
            setIsLoading(true)
            await onSave(editValue)
            setIsEditing(false)
            toast.success("Cập nhật thành công")
        } catch (error) {
            toast.error("Có lỗi xảy ra")
        } finally {
            setIsLoading(false)
        }
    }

    if (isEditing) {
        return (
            <div className="space-y-2">
                <div className="font-medium text-sm text-muted-foreground">{label}</div>
                <div className="flex items-center gap-2">
                    {type === "input" ? (
                        <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="max-w-md"
                        />
                    ) : (
                        <Textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="max-w-md"
                        />
                    )}
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleSave}
                        disabled={isLoading}
                    >
                        <Check className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                            setIsEditing(false)
                            setEditValue(value)
                        }}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <div className="font-medium text-sm text-muted-foreground">{label}</div>
            <div className="flex items-center gap-2">
                <div className="text-sm">{value}</div>
                {!disabledEdit && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditing(true)}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}

export default function PageDetail() {
    const { id } = useParams()
    const queryClient = useQueryClient()

    const { data, isLoading } = useQuery({
        queryKey: ['page', id],
        queryFn: () => instance.get(`/pages/${id}`).then(res => res.data)
    })

    const { mutate: approve } = useMutation({
        mutationFn: async () => {
            await instance.post(`/pages/${id}/approve`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['page', id] })
            toast.success('Chấp nhận trang thành công')
        },
        onError: () => {
            toast.error('Có lỗi xảy ra khi chấp nhận trang')
        }
    })

    const { mutate: rejectPage } = useMutation({
        mutationFn: async () => {
            await instance.post(`/pages/${id}/reject`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['page', id] })
            toast.success('Từ chối trang thành công')
        },
        onError: () => {
            toast.error('Có lỗi xảy ra khi từ chối trang')
        }
    })

    const updateField = async (field: string, value: string) => {
        await instance.patch(`/pages/${id}`, { [field]: value })
        queryClient.invalidateQueries({ queryKey: ['page', id] })
    }

    if (isLoading) {
        return <div>Loading...</div>
    }

    return (
        <div className="container px-4 py-6">
            {/* Header Section */}
            <div className="flex flex-col gap-4 mb-8">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{data.name}</h1>
                    <StatusBadge status={data.status as PageStatus} />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        ID: {data.id}
                    </span>

                    {data.status === 'started' && (
                        <div className="flex items-center gap-2">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <X className="mr-2 h-4 w-4" />
                                        Từ chối
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Xác nhận từ chối</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Bạn có chắc chắn muốn từ chối đơn tạo này không?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => rejectPage()}
                                        >
                                            Xác nhận
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="default" size="sm">
                                        <Check className="mr-2 h-4 w-4" />
                                        Chấp nhận
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Xác nhận chấp nhận</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Bạn có chắc chắn muốn chấp nhận đơn tạo này không?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => approve()}
                                        >
                                            Xác nhận
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="space-y-6">

                {/* Additional Information */}
                <div className="rounded-lg border">
                    <div className="px-6 py-3 border-b bg-muted/50">
                        <h2 className="text-lg font-semibold">Thông tin cơ bản</h2>
                    </div>
                    <div className="divide-y">
                        <div className="px-6 py-4 flex justify-between">
                            <span className="text-muted-foreground">Ngày tạo</span>
                            <span>{new Date(data.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="px-6 py-4 flex justify-between">
                            <span className="text-muted-foreground">Cập nhật lần cuối</span>
                            <span>{new Date(data.updatedAt).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Basic Information */}
                <div className="rounded-lg border">
                    <div className="px-6 py-3 border-b bg-muted/50">
                        <h2 className="text-lg font-semibold">Thông tin bổ sung</h2>
                    </div>
                    <div className="divide-y">
                        <div className="px-6 py-4">
                            <EditableField
                                label="Tên trang"
                                value={data.name}
                                onSave={(value) => updateField('name', value)}
                            />
                        </div>
                        <div className="px-6 py-4">
                            <EditableField
                                label="Email"
                                value={data.email}
                                disabledEdit={true}
                            />
                        </div>
                        <div className="px-6 py-4">
                            <EditableField
                                label="Địa chỉ"
                                value={data.address}
                                onSave={(value) => updateField('address', value)}
                            />
                        </div>
                        <div className="px-6 py-4">
                            <EditableField
                                label="URL"
                                value={data.url}
                                onSave={(value) => updateField('url', value)}
                            />
                        </div>
                        <div className="px-6 py-4">
                            <EditableField
                                label="Nội dung"
                                value={data.content}
                                type="textarea"
                                onSave={(value) => updateField('content', value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Users Section */}
                <UserTable pageId={id!} />
            </div>
        </div>
    )
} 