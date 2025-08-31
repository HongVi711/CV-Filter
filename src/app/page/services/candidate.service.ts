export const CandidateService = {
    async getAll({ page = 1, limit = 10 }: { page: number; limit: number }) {
            const res = await fetch(`/api/candidates?page=${page}&limit=${limit}`, {
            cache: "no-store",
        })
        if (!res.ok) throw new Error("Failed to fetch candidates")
        return res.json()
    },

    async create(data: any) {
        const res = await fetch(`/api/candidates`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error("Failed to create candidate")
        return res.json()
    },


    async update(id: string, data: any) {
        const res = await fetch(`/api/candidates/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
        })
        if (!res.ok) throw new Error("Failed to update candidate")
        return res.json()
    },

    async delete(id: string) {
        const res = await fetch(`/api/candidates/${id}`, {
            method: "DELETE",
        })
        if (!res.ok) throw new Error("Failed to delete candidate")
        return res.json()
    },
}