import { CreateProblemDialog } from '@/components/create-problem-dialog'

export default function ProblemsPage() {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Problems</h1>
                <CreateProblemDialog />
            </div>

            {/* Danh sách problems */}
        </div>
    )
} 