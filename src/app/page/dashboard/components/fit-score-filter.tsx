"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"

interface FitScoreFilterProps {
    selectedScores: number[]
    onScoreChange: (scores: number[]) => void
    onClose: () => void
}

const scoreRanges = [
    { value: 90, label: "90-100% (Excellent)", color: "text-green-600" },
    { value: 80, label: "80-89% (Good)", color: "text-blue-600" },
    { value: 70, label: "70-79% (Fair)", color: "text-yellow-600" },
    { value: 60, label: "60-69% (Poor)", color: "text-orange-600" },
    { value: 50, label: "Below 60% (Very Poor)", color: "text-red-600" },
]

export function FitScoreFilter({ selectedScores, onScoreChange, onClose }: FitScoreFilterProps) {
    const handleScoreToggle = (score: number) => {
        const newScores = selectedScores.includes(score)
        ? selectedScores.filter((s) => s !== score)
        : [...selectedScores, score]
        onScoreChange(newScores)
    }

    return (
        <Card className="absolute top-full left-0 mt-2 w-64 z-50 shadow-lg">
            <CardContent className="p-4 space-y-3">
                <div className="font-medium text-sm text-slate-900">Filter by Fit Score</div>
                {scoreRanges.map((range) => (
                <div key={range.value} className="flex items-center space-x-2">
                    <Checkbox
                    id={`score-${range.value}`}
                    checked={selectedScores.includes(range.value)}
                    onCheckedChange={() => handleScoreToggle(range.value)}
                    />
                    <label htmlFor={`score-${range.value}`} className={`text-sm cursor-pointer ${range.color}`}>
                    {range.label}
                    </label>
                </div>
                ))}
            </CardContent>
        </Card>
    )
}
