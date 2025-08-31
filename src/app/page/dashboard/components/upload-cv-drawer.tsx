import React, { useState, useEffect } from "react"
import {Sheet, SheetContent, SheetHeader,SheetTitle,SheetDescription} from "@/components/ui/sheet"
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Upload, FileText, X, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

import { JobService } from "../../services/job.service"
import { uploadCVs, processDuplicateCVs, UploadResult } from "../../services/cv.service"
import { DuplicateModal } from "./DuplicateCVModal"

interface Job {
  id: string
  title: string
  description: string
  requirements: string
}

interface UploadCVDrawerProps {
  open: boolean
  onClose: () => void
  onUploadSuccess?: () => void
}

export function UploadCVDrawer({ open, onClose, onUploadSuccess }: UploadCVDrawerProps) {
  const [selectedJob, setSelectedJob] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [isJobLoading, setIsJobLoading] = useState(true)

  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false)

  useEffect(() => {
    if (open) {
      const fetchJobs = async () => {
        try {
          const jobData = await JobService.getAll()
          setJobs(jobData)
        } catch (err) {
          console.error(err)
          toast.error("Failed to load job list.")
        } finally {
          setIsJobLoading(false)
        }
      }
      fetchJobs()
    }
  }, [open])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles((prev) => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!selectedJob) {
      toast.error("Please select a job position")
      return
    }

    if (uploadedFiles.length === 0) {
      toast.error("Please upload at least one CV file")
      return
    }

    const fileNameSet = new Set<string>()
    for (const file of uploadedFiles) {
      if (fileNameSet.has(file.name)) {
        toast.error(`Duplicate file name detected: ${file.name}`)
        return
      }
      fileNameSet.add(file.name)
    }

    setIsUploading(true)

    try {
      const data = await uploadCVs(selectedJob, uploadedFiles)
      setUploadResult(data)

      setUploadedFiles([])
      setSelectedJob("")

      if (data.duplicates.length > 0) {
        setIsDuplicateModalOpen(true)
      } else {
        toast.success("Upload thành công!")
        onUploadSuccess?.()
        onClose()
      }
    } catch (err) {
      console.error("Error uploading CVs:", err)
      toast.error((err as Error).message || "Failed to upload CVs")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDuplicateSubmit = async (items: DuplicateProcess[]) => {
    try {
      setIsUploading(true)

      await processDuplicateCVs(items)

      toast.success("Duplicate handling successful!")

      setUploadResult(null)
      setIsDuplicateModalOpen(false)

      onUploadSuccess?.()
      onClose()
    } catch (err: any) {
      toast.error(err.message || "Failed to process duplicates.")
    } finally {
      setIsUploading(false)
    }
  }

  const totalSizeMB = (uploadedFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(2)

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-[700px] sm:w-[768px] p-6">
          <SheetHeader>
            <SheetTitle>Upload CVs</SheetTitle>
            <SheetDescription>
              Select a job description and upload candidate CVs for automatic processing
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="job-select">Select Job Description</Label>
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger id="job-select">
                  <SelectValue placeholder="Choose a job position..." />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Upload CV Files</Label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors relative">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 mb-2">Drag and drop files here, or click to browse</p>
                <Input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={isUploading}
                />
                <Button variant="outline" asChild disabled={isUploading}>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Choose Files
                  </label>
                </Button>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>
                  Uploaded Files ({uploadedFiles.length}) - Total Size: {totalSizeMB} MB
                </Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-700 truncate max-w-xs">{file.name}</span>
                        <span className="text-xs text-slate-500">
                          ({(file.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-slate-500 hover:text-red-600"
                        disabled={isUploading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                CVs will be automatically processed and analyzed against the selected job description.
                Duplicate candidates will be detected and you will be prompted to handle them.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-transparent"
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedJob || uploadedFiles.length === 0 || isUploading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 flex justify-center items-center gap-2"
              >
                {isUploading && <Loader2 className="animate-spin w-5 h-5" />}
                {isUploading ? "Processing..." : `Upload ${uploadedFiles.length} CV${uploadedFiles.length > 1 ? "s" : ""}`}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {uploadResult && uploadResult.duplicates.length > 0 && (
        <DuplicateModal
          duplicates={uploadResult.duplicates}
          open={isDuplicateModalOpen}
          onClose={() => setIsDuplicateModalOpen(false)}
          onSubmit={handleDuplicateSubmit}
        />
      )}
    </>
  )
}

