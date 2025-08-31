import { Users, Briefcase, BarChart3, Settings, FileText, Home } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Management", href: "#", icon: Users, current: true },
  // { name: "Analytics", href: "#", icon: BarChart3, current: false },
  // { name: "Reports", href: "#", icon: FileText, current: false },
  // { name: "Settings", href: "#", icon: Settings, current: false },
]

export function Sidebar() {
  return (
    <div className="hidden md:flex md:w-64 bg-white border-r border-slate-200 flex-col">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">HR Portal</h1>
            <p className="text-sm text-slate-500">Talent Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              item.current
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </a>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">HR Manager</p>
            <p className="text-xs text-slate-500 truncate">admin@company.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
