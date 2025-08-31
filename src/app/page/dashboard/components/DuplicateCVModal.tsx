import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useState } from "react"

export function DuplicateModal({
    duplicates,
    open,
    onClose,
    onSubmit,
    }: {
    duplicates: DuplicateProcess[]
    open: boolean
    onClose: () => void
    onSubmit: (items: DuplicateProcess[]) => void
}) {
    const [itemsWithMode, setItemsWithMode] = useState<DuplicateProcess[]>([])

    useEffect(() => {
        if (open) {
        setItemsWithMode(duplicates.map((d) => ({ ...d, mode: "merge" })))
        }
    }, [duplicates, open])

    const handleModeChange = (index: number, mode: DuplicateProcess["mode"]) => {
        setItemsWithMode((prev) => {
        const newArr = [...prev]
        newArr[index].mode = mode
        return newArr
        })
    }

    const handleApplyToAll = (mode: DuplicateProcess["mode"]) => {
        setItemsWithMode((prev) =>
        prev.map((item) => ({
            ...item,
            mode,
        }))
        )
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
        <DialogContent
            className="!max-w-none !w-[95vw] !p-6 !max-h-[90vh] overflow-y-auto"
            style={{ width: "95vw", maxWidth: "none" }}
        >
            <DialogHeader>
            <DialogTitle>Duplicate Resumes</DialogTitle>
            </DialogHeader>

            {itemsWithMode.length === 0 ? (
            <p className="text-center text-gray-500 mt-6">No duplicate CVs found</p>
            ) : (
            <>
                <div className="flex items-center gap-4 mb-4 text-sm">
                <span className="font-medium">Apply mode to all:</span>
                {["merge", "replace", "create_new"].map((mode) => (
                    <label key={mode} className="flex items-center gap-1">
                    <input
                        type="radio"
                        name="global-mode"
                        value={mode}
                        onChange={() => handleApplyToAll(mode as DuplicateProcess["mode"])}
                    />
                    {mode}
                    </label>
                ))}
                </div>
                <div className="mt-4 overflow-auto">
                <table className="min-w-[1400px] w-full">
                    <thead className="bg-slate-100 text-xs uppercase">
                    <tr>
                        <th className="px-3 py-2 border">File</th>
                        <th className="px-3 py-2 border">Full Name</th>
                        <th className="px-3 py-2 border">Email</th>
                        <th className="px-3 py-2 border">Birthdate</th>
                        <th className="px-3 py-2 border">Gender</th>
                        <th className="px-3 py-2 border">Experience</th>
                        <th className="px-3 py-2 border">Skills</th>
                        <th className="px-3 py-2 border">Old CV</th>
                        <th className="px-3 py-2 border">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {itemsWithMode.map((dup, index) => (
                        <tr key={dup.existingCvId} className="border-b">
                        <td className="px-3 py-2 border font-medium">{dup.file_name}</td>
                        <td className="px-3 py-2 border">{dup.newData.full_name || "-"}</td>
                        <td className="px-3 py-2 border">{dup.newData.email || "-"}</td>
                        <td className="px-3 py-2 border">
                            {dup.newData.birthdate
                            ? new Date(dup.newData.birthdate).toLocaleDateString("vi-VN")
                            : "-"}
                        </td>
                        <td className="px-3 py-2 border">{dup.newData.gender || "-"}</td>
                        <td className="px-3 py-2 border">{dup.newData.experience ?? "-"}</td>
                        <td className="px-3 py-2 border">{dup.newData.skills?.join(", ") || "-"}</td>
                        <td className="px-3 py-2 border">
                            {dup.existing.old_cv_url ? (
                            <a
                                href={dup.existing.old_cv_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                            >
                                View CV
                            </a>
                            ) : (
                            <span className="text-slate-400 italic">None</span>
                            )}
                        </td>
                        <td className="px-3 py-2 border">
                            <div className="space-y-1">
                            {["merge", "replace", "create_new"].map((mode) => (
                                <label key={mode} className="flex items-center gap-1 text-xs">
                                <input
                                    type="radio"
                                    name={`mode-${index}`}
                                    value={mode}
                                    checked={dup.mode === mode}
                                    onChange={() => handleModeChange(index, mode as DuplicateProcess["mode"])}
                                />
                                {mode}
                                </label>
                            ))}
                            </div>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </>
            )}
            <div className="flex justify-end mt-6 gap-3">
            <Button variant="outline" onClick={onClose}>
                Cancel
            </Button>
            <Button onClick={() => onSubmit(itemsWithMode)} disabled={itemsWithMode.length === 0}>
                Confirm
            </Button>
            </div>
        </DialogContent>
        </Dialog>
    )
}
