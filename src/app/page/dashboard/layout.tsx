import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { Toaster } from "sonner"
import { Header } from "@/components/header"

interface ManagementLayoutProps {
  children: React.ReactNode
}

export function ManagementLayout({ children }: ManagementLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="w-full">{children}</div>
        </main>
      </div>
      <Toaster />
    </div>
  )
}
