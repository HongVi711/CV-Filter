export const JobService = {
    async getAll() {
        const res = await fetch(`/api/job`, { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to fetch jobs")
        return res.json()
    },

    async create(data: any) {
        const res = await fetch(`/api/job`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error("Failed to create job")
        return res.json()
    },

    async delete(id: string) {
            const res = await fetch(`/api/job/${id}`, {
            method: "DELETE",
        })
        if (!res.ok) throw new Error("Failed to delete candidate")
        return res.json()
    },

    async update(id: string, data: any) {
        const res = await fetch(`/api/job/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
        })
        if (!res.ok) throw new Error("Failed to update candidate")
        return res.json()
    },
}