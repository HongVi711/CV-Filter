"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface CreateCandidateModalProps {
    open: boolean
    onClose: () => void
    mode: "create" | "edit"
    candidate?: any
    onCreated?: (newCandidate: any) => void
    onUpdated?: (updatedCandidate: any) => void
}

export function CreateCandidateModal({
    open,
    onClose,
    mode,
    candidate,
    onCreated,
    onUpdated,
    }: CreateCandidateModalProps) {
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        birthdate: "",
        gender: "",
        experience: "",
        address: "",
        skills: "",
        strengths: "",
        weaknesses: "",
        fit_score: "",
    })

    const [isSubmitting, setIsSubmitting] = useState(false)

    // Prefill khi edit
    useEffect(() => {
        if (mode === "edit" && candidate) {
        setFormData({
            full_name: candidate.full_name || "",
            email: candidate.email || "",
            birthdate: candidate.birthdate
            ? new Date(candidate.birthdate).toISOString().split("T")[0]
            : "",
            gender: candidate.gender || "",
            experience: candidate.experience?.toString() || "",
            address: candidate.address || "",
            skills: candidate.skills?.join(", ") || "",
            strengths: candidate.strengths?.join(", ") || "",
            weaknesses: candidate.weaknesses?.join(", ") || "",
            fit_score: candidate.fit_score?.toString() || "",
        })
        } else if (mode === "create") {

        setFormData({
            full_name: "",
            email: "",
            birthdate: "",
            gender: "",
            experience: "",
            address: "",
            skills: "",
            strengths: "",
            weaknesses: "",
            fit_score: "",
        })
        }
    }, [mode, candidate, open])

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
        const payload = {
            ...formData,
            experience: formData.experience ? parseInt(formData.experience) : null,
            fit_score: formData.fit_score ? parseInt(formData.fit_score) : null,
            skills: formData.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
            strengths: formData.strengths
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
            weaknesses: formData.weaknesses
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
            birthdate: formData.birthdate ? new Date(formData.birthdate) : null,
        }

        let response: Response
        if (mode === "create") {
            response = await fetch("/api/candidates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            })
        } else {
            response = await fetch(`/api/candidates/${candidate.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            })
        }

        if (!response.ok) throw new Error("Request failed")

        const result = await response.json()
        if (mode === "create" && onCreated) {
            onCreated(result)
            toast.success("Thêm ứng viên thành công")
        }
        if (mode === "edit" && onUpdated) {
            onUpdated(result)
            toast.success("Cập nhật ứng viên thành công")
        }

        onClose()
        } catch (error) {
        console.error("❌ Error submitting candidate:", error)
        toast.error("Có lỗi xảy ra khi lưu ứng viên")
        } finally {
        setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
            <DialogTitle>
                {mode === "create" ? "Create New Candidate" : "Edit Candidate"}
            </DialogTitle>
            <DialogDescription>
                {mode === "create"
                ? "Fill in the information of the new candidate"
                : "Update the candidate's information"}
            </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                label="Full Name *"
                id="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                />
                <InputField
                label="Email *"
                id="email"
                value={formData.email}
                type="email"
                onChange={handleChange}
                required
                />
                <InputField
                label="Birthdate"
                id="birthdate"
                value={formData.birthdate}
                type="date"
                onChange={handleChange}
                />
                <SelectField
                label="Gender"
                id="gender"
                value={formData.gender}
                onChange={handleChange}
                options={["Male", "Female", "Other"]}
                />
                <InputField
                label="Years of Experience"
                id="experience"
                value={formData.experience}
                type="number"
                onChange={handleChange}
                />
                <InputField
                label="Fit Score (%)"
                id="fit_score"
                value={formData.fit_score}
                type="number"
                onChange={handleChange}
                />
                <InputField
                label="Address"
                id="address"
                value={formData.address}
                onChange={handleChange}
                className="col-span-2"
                />
                <InputField
                label="Skills (comma separated)"
                id="skills"
                value={formData.skills}
                onChange={handleChange}
                className="col-span-2"
                />
                <TextareaField
                label="Strengths (comma separated)"
                id="strengths"
                value={formData.strengths}
                onChange={handleChange}
                />
                <TextareaField
                label="Weaknesses (comma separated)"
                id="weaknesses"
                value={formData.weaknesses}
                onChange={handleChange}
                />
            </div>

            <div className="flex gap-3 pt-4">
                <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-transparent"
                >
                Cancel
                </Button>
                <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
                >
                {isSubmitting
                    ? mode === "create"
                    ? "Creating..."
                    : "Updating..."
                    : mode === "create"
                    ? "Create Candidate"
                    : "Update Candidate"}
                </Button>
            </div>
            </form>
        </DialogContent>
        </Dialog>
    )
    }

    // Reusable inputs
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

    function SelectField({
    label,
    id,
    value,
    onChange,
    options,
    className = "",
    }: any) {
    return (
        <div className={`space-y-2 ${className}`}>
        <Label htmlFor={id}>{label}</Label>
        <Select value={value} onValueChange={(val) => onChange(id, val)}>
            <SelectTrigger>
            <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
            {options.map((opt: string) => (
                <SelectItem key={opt} value={opt}>
                {opt}
                </SelectItem>
            ))}
            </SelectContent>
        </Select>
        </div>
    )
}
