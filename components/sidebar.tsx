"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { CheckSquare, Bookmark, FolderKanban, Calendar, BookOpen, GraduationCap, LayoutDashboard } from "lucide-react"
import Image from "next/image"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Daily To-Do's",
    href: "/todos",
    icon: CheckSquare,
  },
  {
    name: "Bookmarks",
    href: "/bookmarks",
    icon: Bookmark,
  },
  {
    name: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: Calendar,
  },
  {
    name: "Notes",
    href: "/notes",
    icon: BookOpen,
  },
  {
    name: "Courses",
    href: "/courses",
    icon: GraduationCap,
  },
]

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <aside className={cn("fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card", className)}>
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b border-border px-6">
          <div className="flex items-center gap-3">
            <Image src="/trupath-logo.png" alt="TRUPATH Logo" width={40} height={40} className="h-10 w-10 rounded-xl" />
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              TRUPATH
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
