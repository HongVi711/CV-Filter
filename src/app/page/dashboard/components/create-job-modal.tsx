"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { toast } from "sonner"
import { JobService } from "../../services/job.service"

interface CreateJobModalProps {
  open: boolean
  onClose: () => void
  mode: "create" | "edit"
  job?: any
  onCreated?: (newJob: any) => void
  onUpdated?: (updatedJob: any) => void
}

export function CreateJobModal({
  open,
  onClose,
  mode,
  job,
  onCreated,
  onUpdated,
}: CreateJobModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (mode === "edit" && job) {
      setFormData({
        title: job.title || "",
        description: job.description || "",
        requirements: job.requirements || "",
      })
    } else {
      setFormData({
        title: "",
        description: "",
        requirements: "",
      })
    }
  }, [mode, job, open])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        ...formData,
      }

      let result
      if (mode === "create") {
        result = await JobService.create(payload)
        toast.success("Thêm công việc thành công")
        onCreated?.(result)
      } else if (job) {
        result = await JobService.update(job.id, payload)
        toast.success("Cập nhật công việc thành công")
        onUpdated?.(result)
      }

      onClose()
    } catch (error) {
      console.error("Error submitting job:", error)
      toast.error("Có lỗi xảy ra khi lưu công việc")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Job" : "Edit Job"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tên công việc *</Label>
            <InputField
              label="Job Title *"
              id="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <TextareaField
              label="Description"
              id="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <TextareaField
              label="Requirements"
              id="requirements"
              value={formData.requirements}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? mode === "create"
                    ? "Creating..."
                    : "Updating..."
                : mode === "create"
                ? "Create Job"
                : "Update Job"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function InputField({
  label,
  id,
  value,
  onChange,
  type = "text",
  required = false,
  className = "",
  }: any) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id}>{label}</Label>
      <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(id, e.target.value)}
          required={required}
      />
    </div>
  )
}

function TextareaField({ label, id, value, onChange, className = "" }: any) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id}>{label}</Label>
      <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(id, e.target.value)}
      />
    </div>
  )
}
