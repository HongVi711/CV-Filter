"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CandidatesTab } from "./components/candidates-tab"
import { JobsTab } from "./components/jobs-tab"

export function ManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Talent Management</h1>
        <p className="text-slate-600 mt-1">Manage candidates and job positions efficiently</p>
      </div>

      <Tabs defaultValue="candidates" className="space-y-6">
        <TabsList className="grid w-fit grid-cols-2 bg-slate-100">
          <TabsTrigger value="candidates" className="px-6">
            Candidates
          </TabsTrigger>
          <TabsTrigger value="jobs" className="px-6">
            Jobs
          </TabsTrigger>
        </TabsList>
        <TabsContent value="candidates" className="space-y-6">
          <CandidatesTab />
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <JobsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
