import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { useCreateProblem } from '@/hooks/use-create-problem'
import { toast } from 'sonner'

export function CreateProblemDialog() {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState('')
    const { mutate: createProblem, isPending } = useCreateProblem()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim()) {
            toast.error('Vui lòng nhập tên problem')
            return
        }

        createProblem(
            { name },
            {
                onSuccess: () => {
                    toast.success('Tạo problem thành công')
                    setOpen(false)
                    setName('')
                },
                onError: (error) => {
                    toast.error('Có lỗi xảy ra khi tạo problem')
                },
            }
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Tạo Problem Mới</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tạo Problem Mới</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                            Tên Problem
                        </label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nhập tên problem..."
                            disabled={isPending}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Đang tạo...' : 'Tạo'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
} 