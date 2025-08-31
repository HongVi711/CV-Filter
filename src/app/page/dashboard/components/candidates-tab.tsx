"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Download, Filter, Plus, Search, Upload, X } from "lucide-react"
import { FitScoreFilter } from "./fit-score-filter"
import { CreateCandidateModal } from "./create-candidate-modal"
import { CandidatesPagination } from "@/components/Pagination"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import { CandidateService } from "../../services/candidate.service"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UploadCVDrawer }  from "./upload-cv-drawer"
import { processDuplicateCVs, UploadResult } from "../../services/cv.service"
import { DuplicateModal } from "./DuplicateCVModal"

export function CandidatesTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const [candidates, setCandidates] = useState<any[]>([])
  const [isUploadDrawerOpen, setIsUploadDrawerOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedFitScores, setSelectedFitScores] = useState<number[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null) // 👈 thêm state
  const [deletingCandidateId, setDeletingCandidateId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(7)
  const [total, setTotal] = useState(0)

  const fetchCandidates = async () => {
    try {
      const data = await CandidateService.getAll({ page, limit })
      setCandidates(data.candidates)
      setTotal(data.total)
    } catch (error) {
      console.error("Error fetching candidates:", error)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [page, limit])

  const filteredCandidates = candidates
    .filter((candidate) => {
      const matchesSearch =
        candidate.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFitScore =
        selectedFitScores.length === 0 ||
        selectedFitScores.some((score) => {
          if (score === 90) return candidate.fit_score >= 90
          if (score === 80) return candidate.fit_score >= 80 && candidate.fit_score < 90
          if (score === 70) return candidate.fit_score >= 70 && candidate.fit_score < 80
          if (score === 60) return candidate.fit_score >= 60 && candidate.fit_score < 70
          return candidate.fit_score < 60
        })

      return matchesSearch && matchesFitScore
    })
    .sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

  const handleDelete = async (id: string) => {
    try {
      await CandidateService.delete(id)
      toast.success("Xóa thành công")
      fetchCandidates()
    } catch (err) {
      toast.error("Xóa thất bại")
    }
  }

  const handleExport = () => {
    const exportData = filteredCandidates.map((candidate) => ({
      "Full Name": candidate.full_name,
      "Date of Birth": new Date(candidate.birthdate).toLocaleDateString("vi-VN"),
      "Gender": candidate.gender,
      "Email": candidate.email,
      "Experience": candidate.experience,
      "Address": candidate.address,
      "Strengths": candidate.strengths?.join(", "),
      "Weaknesses": candidate.weaknesses?.join(", "),
      "Fit Score": `${candidate.fit_score}%`,
      "Skills": candidate.skills?.join(", "),
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates")

    XLSX.writeFile(workbook, "candidates.xlsx")
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          <div className="relative">
            <Button
              variant="outline"
              className={`gap-2 bg-transparent ${
                selectedFitScores.length > 0 ? "border-blue-500 text-blue-600" : ""
              }`}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="w-4 h-4" />
              Filter by Fit Score
              {selectedFitScores.length > 0 && (
                <span className="ml-1 bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full text-xs">
                  {selectedFitScores.length}
                </span>
              )}
            </Button>
            {isFilterOpen && (
              <FitScoreFilter
                selectedScores={selectedFitScores}
                onScoreChange={setSelectedFitScores}
                onClose={() => setIsFilterOpen(false)}
              />
            )}
          </div>
          {selectedFitScores.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFitScores([])}
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="w-4 h-4 mr-1" />
              Clear filters
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsUploadDrawerOpen(true)}
          >
            <Upload className="w-4 h-4" />
            Upload CVs
          </Button>
          <Button
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              setSelectedCandidate(null) 
              setIsCreateModalOpen(true)
            }}
          >
            <Plus className="w-4 h-4" />
            Add Candidates
          </Button>
          <Button
            className="gap-2 bg-green-600 hover:bg-green-700"
            onClick={handleExport}
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto relative">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="sticky left-0 z-20 bg-slate-50 py-3 px-4 text-left font-medium text-slate-900">Full Name</th>
                <th className="py-3 px-4 text-left font-medium text-slate-900">Birthday</th>
                <th className="py-3 px-4 text-left font-medium text-slate-900">Gender</th>
                <th className="py-3 px-4 text-left font-medium text-slate-900">Email</th>
                <th className="py-3 px-4 text-left font-medium text-slate-900">Experience</th>
                <th className="py-3 px-4 text-left font-medium text-slate-900">Address</th>
                <th className="py-3 px-4 text-left font-medium text-slate-900">Strengths</th>
                <th className="py-3 px-4 text-left font-medium text-slate-900">Weaknesses</th>
                <th className="py-3 px-4 text-left font-medium text-slate-900">Fit Score</th>
                <th className="py-3 px-4 text-left font-medium text-slate-900">Skills</th>
                <th className="py-3 px-4 text-left font-medium text-slate-900">Link CV</th>
                <th className="sticky right-0 z-20 bg-slate-50 py-3 px-4 text-left font-medium text-slate-900">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredCandidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-slate-50">
                  <td className="sticky left-0 z-10 bg-white py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                    {candidate.full_name}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                    {new Date(candidate.birthdate).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{candidate.gender}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{candidate.email}</td>
                  <td className="py-3 px-4 text-slate-600">{candidate.experience}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{candidate.address}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{candidate.strengths?.join(", ")}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{candidate.weaknesses?.join(", ")}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        candidate.fitScore >= 90
                          ? "bg-green-100 text-green-800"
                          : candidate.fitScore >= 80
                          ? "bg-blue-100 text-blue-800"
                          : candidate.fitScore >= 70
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {candidate.fit_score}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{candidate.skills?.join(", ")}</td>
                  <td className="py-3 px-4 max-w-xs truncate text-sm">
                    {candidate.file_url ? (
                      <a
                        href={candidate.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {candidate.file_url}
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">No CV</span>
                    )}
                  </td>
                  <td className="sticky right-0 z-10 bg-white py-3 px-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedCandidate(candidate)
                        setIsCreateModalOpen(true)
                      }}
                    >
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setDeletingCandidateId(candidate.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <CreateCandidateModal
        open={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          setSelectedCandidate(null)
        }}
        mode={selectedCandidate ? "edit" : "create"}
        candidate={selectedCandidate ?? undefined}
        onCreated={(newCandidate) => {
          setCandidates((prev) => [newCandidate, ...prev])
          setPage(1)
          setTotal((prev) => prev + 1)
          toast.success("Thêm ứng viên thành công")
        }}
        onUpdated={(updatedCandidate) => {
          setCandidates((prev) =>
            prev.map((c) => (c.id === updatedCandidate.id ? updatedCandidate : c))
          )
          toast.success("Cập nhật ứng viên thành công")
        }}
      />

      <CandidatesPagination
        page={page}
        total={total}
        limit={limit}
        onPageChange={setPage}
      />

      {/* Confirm Duplicate Processing */}
      <UploadCVDrawer
        open={isUploadDrawerOpen}
        onClose={() => setIsUploadDrawerOpen(false)}
        onUploadSuccess={() => {
          fetchCandidates()
        }}
      />

      <Dialog open={!!deletingCandidateId} onOpenChange={() => setDeletingCandidateId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xoá</DialogTitle>
            <DialogDescription>Bạn có chắc muốn xoá ứng viên này không?</DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setDeletingCandidateId(null)}>
              Huỷ
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (deletingCandidateId) {
                  await handleDelete(deletingCandidateId)
                  setDeletingCandidateId(null)
                }
              }}
            >
              Xoá
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
