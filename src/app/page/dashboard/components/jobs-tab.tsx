"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateJobModal } from "./create-job-modal"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { JobService } from "../../services/job.service"

export function JobsTab() {
    const [jobs, setJobs] = useState<any[]>([])
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [deletingJobId, setDeletingJobId] = useState<string | null>(null)
    const [selectedJob, setSelectedJob] = useState<any | null>(null)

    const fetchJobs = async () => {
        try {
        const data = await JobService.getAll()
        setJobs(data)
        } catch (error) {
        console.error("Error fetching jobs:", error)
        }
    }

    useEffect(() => {
        fetchJobs()
    }, [])

    const handleDelete = async (id: string) => {
        try {
        await JobService.delete(id)
        toast.success("Xoá thành công")
        fetchJobs()
        } catch (err) {
        toast.error("Xoá thất bại")
        }
    }

    return (
        <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
            <Button
                className="gap-2 bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                setSelectedJob(null)
                setIsCreateModalOpen(true)
                }}
            >
                <Plus className="w-4 h-4" />
                Add Job
            </Button>
            </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto relative">
            <table className="w-full min-w-[1200px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="py-3 px-4 text-left font-medium text-slate-900">Job Title</th>
                    <th className="py-3 px-4 text-left font-medium text-slate-900">Description</th>
                    <th className="py-3 px-4 text-left font-medium text-slate-900">Requirements</th>
                    <th className="py-3 px-4 text-left font-medium text-slate-900">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-700">{job.title}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-sm truncate">
                        {job.description}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-sm truncate">
                        {job.requirements}
                    </td>
                    <td className="py-3 px-4">
                        <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                            setSelectedJob(job)
                            setIsCreateModalOpen(true)
                            }}
                        >
                            Edit
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeletingJobId(job.id)}
                        >
                            Delete
                        </Button>
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>

        <Dialog open={!!deletingJobId} onOpenChange={() => setDeletingJobId(null)}>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>Xác nhận xoá</DialogTitle>
                <DialogDescription>
                Bạn có chắc muốn xoá công việc này không?
                </DialogDescription>
            </DialogHeader>

            <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setDeletingJobId(null)}>
                Huỷ
                </Button>
                <Button
                variant="destructive"
                onClick={async () => {
                    if (deletingJobId) {
                    await handleDelete(deletingJobId)
                    setDeletingJobId(null)
                    }
                }}
                >
                Xoá
                </Button>
            </div>
            </DialogContent>
        </Dialog>

        <CreateJobModal
            open={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            mode={selectedJob ? "edit" : "create"}
            job={selectedJob}
            onCreated={fetchJobs}
            onUpdated={fetchJobs}
        />
        </div>
    )
}
