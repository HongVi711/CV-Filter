export interface UploadResult {
    new_cvs: any[];
    duplicates:DuplicateProcess[];
    errors: {
        file_name: string;
        message: string;
    }[];
}


export async function uploadCVs(jobId: string, files: File[]) {
    const formData = new FormData()
    formData.append("job_id", jobId)

    files.forEach((file) => {
        formData.append("files", file)
    })

    const res = await fetch("/api/cv/upload-cv", {
        method: "POST",
        body: formData,
    })

    if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || "Upload failed")
    }

    return res.json()
}

export async function processDuplicateCVs(items: DuplicateProcess[]) {
    const res = await fetch("/api/cv/process", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({ duplicates: items }),
    })

    const data = await res.json()

    if (!res.ok) {
        throw new Error(data.error || "Failed to process duplicates")
    }

    return data
}


