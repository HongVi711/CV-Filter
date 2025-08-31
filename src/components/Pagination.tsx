import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

interface Props {
    page: number
    total: number
    limit: number
    onPageChange: (page: number) => void
}

export function CandidatesPagination({ page, total, limit, onPageChange }: Props) {
    const totalPages = Math.ceil(total / limit)

    const getPageNumbers = () => {
        const pages: (number | "...")[] = []

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
        if (page <= 3) pages.push(1, 2, 3, 4, "...", totalPages)
            else if (page >= totalPages - 2) pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
            else pages.push(1, "...", page - 1, page, page + 1, "...", totalPages)
        }

        return pages
    }

    return (
        <Pagination className="mt-4">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                        e.preventDefault()
                        if (page > 1) onPageChange(page - 1)
                        }}
                        aria-disabled={page === 1}
                    />
                    </PaginationItem>

                    {getPageNumbers().map((pg, idx) => (
                    <PaginationItem key={idx}>
                        {pg === "..." ? (
                        <PaginationEllipsis />
                        ) : (
                        <PaginationLink
                            href="#"
                            isActive={pg === page}
                            onClick={(e) => {
                            e.preventDefault()
                            onPageChange(Number(pg))
                            }}
                        >
                            {pg}
                        </PaginationLink>
                        )}
                    </PaginationItem>
                    ))}

                <PaginationItem>
                <PaginationNext
                    href="#"
                    onClick={(e) => {
                    e.preventDefault()
                    if (page < totalPages) onPageChange(page + 1)
                    }}
                    aria-disabled={page === totalPages}
                />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}
