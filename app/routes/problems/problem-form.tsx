import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import TiptapEditor from "./editor-component"
import { Separator } from "@/components/ui/separator"

interface ProblemFormProps {
    onSubmit: (data: ProblemFormData) => void
    isSubmitting: boolean
    initialData?: ProblemFormData
}

export interface ProblemFormData {
    title: string
    content: string
    difficulty: 'easy' | 'medium' | 'hard'
    timeLimit: number
    memoryLimit: number
    examples: Array<{
        input: string
        output: string
        explanation?: string
    }>
    constraints: string[]
}

export function ProblemForm({ onSubmit, isSubmitting, initialData }: ProblemFormProps) {
    const [formData, setFormData] = useState<ProblemFormData>(
        initialData || {
            title: '',
            content: '',
            difficulty: 'easy',
            timeLimit: 1000,
            memoryLimit: 262144, // 256MB
            examples: [{ input: '', output: '', explanation: '' }],
            constraints: ['']
        }
    )

    const msToSeconds = (ms: number) => (ms / 1000).toFixed(1)
    const kbToMb = (kb: number) => (kb / 1024).toFixed(1)

    const secondsToMs = (s: number) => Math.round(s * 1000)
    const mbToKb = (mb: number) => Math.round(mb * 1024)

    const addExample = () => {
        setFormData(prev => ({
            ...prev,
            examples: [...prev.examples, { input: '', output: '', explanation: '' }]
        }))
    }

    const removeExample = (index: number) => {
        setFormData(prev => ({
            ...prev,
            examples: prev.examples.filter((_, i) => i !== index)
        }))
    }

    const addConstraint = () => {
        setFormData(prev => ({
            ...prev,
            constraints: [...prev.constraints, '']
        }))
    }

    const removeConstraint = (index: number) => {
        setFormData(prev => ({
            ...prev,
            constraints: prev.constraints.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = () => {
        const submissionData = {
            ...formData,
            examples: formData.examples.map(example => ({
                ...example,
                explanation: example.explanation?.trim() || undefined
            }))
        };

        onSubmit(submissionData);
    };

    return (
        <div className="space-y-8">
            {/* Title & Difficulty */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Tiêu đề</Label>
                    <Input
                        placeholder="Nhập tiêu đề bài toán..."
                        value={formData.title}
                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Độ khó</Label>
                    <Select
                        value={formData.difficulty}
                        onValueChange={value => setFormData(prev => ({ ...prev, difficulty: value as any }))}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="easy" className="text-green-500">Dễ</SelectItem>
                            <SelectItem value="medium" className="text-yellow-500">Trung bình</SelectItem>
                            <SelectItem value="hard" className="text-red-500">Khó</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Time & Memory Limits */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Time Limit (seconds)</Label>
                    <Input
                        type="number"
                        min={0.1}
                        step={0.1}
                        placeholder="Time limit in seconds..."
                        value={msToSeconds(formData.timeLimit)}
                        onChange={e => setFormData(prev => ({
                            ...prev,
                            timeLimit: secondsToMs(parseFloat(e.target.value))
                        }))}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Memory Limit (MB)</Label>
                    <Input
                        type="number"
                        min={1}
                        step={1}
                        placeholder="Memory limit in MB..."
                        value={kbToMb(formData.memoryLimit)}
                        onChange={e => setFormData(prev => ({
                            ...prev,
                            memoryLimit: mbToKb(parseFloat(e.target.value))
                        }))}
                    />
                </div>
            </div>

            {/* Problem Description */}
            <div className="space-y-2">
                <Label>Mô tả bài toán</Label>
                <TiptapEditor
                    content={formData.content}
                    setContent={(content) => setFormData(prev => ({ ...prev, content }))}
                />
            </div>

            {/* Examples */}
            <Separator />
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label>Examples</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addExample}
                    >
                        Thêm example
                    </Button>
                </div>
                {formData.examples.map((example, index) => (
                    <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-2"
                            onClick={() => removeExample(index)}
                            disabled={formData.examples.length === 1}
                        >
                            ×
                        </Button>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Input</Label>
                                <Textarea
                                    placeholder="Input..."
                                    value={example.input}
                                    onChange={e => {
                                        const newExamples = [...formData.examples]
                                        newExamples[index].input = e.target.value
                                        setFormData(prev => ({ ...prev, examples: newExamples }))
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Output</Label>
                                <Textarea
                                    placeholder="Output..."
                                    value={example.output}
                                    onChange={e => {
                                        const newExamples = [...formData.examples]
                                        newExamples[index].output = e.target.value
                                        setFormData(prev => ({ ...prev, examples: newExamples }))
                                    }}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Giải thích (không bắt buộc)</Label>
                            <Textarea
                                placeholder="Giải thích..."
                                value={example.explanation || ''}
                                onChange={e => {
                                    const newExamples = [...formData.examples]
                                    newExamples[index] = {
                                        ...newExamples[index],
                                        explanation: e.target.value || undefined
                                    }
                                    setFormData(prev => ({ ...prev, examples: newExamples }))
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Constraints */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label>Ràng buộc</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addConstraint}
                    >
                        Thêm ràng buộc
                    </Button>
                </div>
                {formData.constraints.map((constraint, index) => (
                    <div key={index} className="flex gap-2">
                        <Input
                            placeholder="Nhập ràng buộc..."
                            value={constraint}
                            onChange={e => {
                                const newConstraints = [...formData.constraints]
                                newConstraints[index] = e.target.value
                                setFormData(prev => ({ ...prev, constraints: newConstraints }))
                            }}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeConstraint(index)}
                            disabled={formData.constraints.length === 1}
                        >
                            ×
                        </Button>
                    </div>
                ))}
            </div>

            {/* Submit Button */}
            <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={isSubmitting}
            >
                {isSubmitting ? "Đang tạo..." : "Tạo Problem"}
            </Button>
        </div>
    )
} 