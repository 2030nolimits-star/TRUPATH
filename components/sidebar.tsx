"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { CheckSquare, Bookmark, FolderKanban, Calendar, BookOpen, GraduationCap, LayoutDashboard, User } from "lucide-react"
import Image from "next/image"
import { LogoutButton } from "@/components/logout-button"
import { getSupabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

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
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
]

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const [counts, setCounts] = useState({ todos: 0, events: 0 })
  const supabase = getSupabase()

  useEffect(() => {
    async function fetchCounts() {
      const today = new Date().toISOString().split("T")[0]
      const [todosRes, eventsRes] = await Promise.all([
        supabase.from("todos").select("*", { count: "exact", head: true }).eq("completed", false),
        supabase.from("calendar_events").select("*", { count: "exact", head: true }).gt("event_date", today)
      ])

      setCounts({
        todos: todosRes.count || 0,
        events: eventsRes.count || 0
      })
    }

    fetchCounts()
    // Refresh counts every 2 minutes
    const interval = setInterval(fetchCounts, 120000)
    return () => clearInterval(interval)
  }, [])

  return (
    <aside className={cn("fixed left-0 top-0 z-40 h-screen w-64 glass border-r border-white/10", className)}>
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <Image src="/trupath-logo.png" alt="TRUPATH Logo" width={40} height={40} className="h-10 w-10 rounded-xl shadow-lg shadow-primary/20" />
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-sm">
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
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:backdrop-blur-sm",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="flex-1">{item.name}</span>
                {item.name === "Daily To-Do's" && counts.todos > 0 && (
                  <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/20 pointer-events-none">
                    {counts.todos}
                  </Badge>
                )}
                {item.name === "Calendar" && counts.events > 0 && (
                  <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/20 pointer-events-none">
                    {counts.events}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border p-4">
          <LogoutButton />
        </div>
      </div>
    </aside>
  )
}
