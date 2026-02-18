"use client"

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckSquare, Bookmark, FolderKanban, Calendar, BookOpen, GraduationCap } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    completedTodos: 0,
    activeProjects: 0,
    coursesInProgress: 0,
    totalBookmarks: 0,
    upcomingEvents: 0,
    totalNotes: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])

  const supabase = getSupabase()

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true)

      const [todosRes, projectsRes, coursesRes, bookmarksRes, eventsRes, notesRes] = await Promise.all([
        supabase.from("todos").select("*", { count: "exact" }),
        supabase.from("projects").select("*", { count: "exact" }),
        supabase.from("courses").select("*", { count: "exact" }),
        supabase.from("bookmarks").select("*", { count: "exact" }),
        supabase.from("calendar_events").select("*", { count: "exact" }),
        supabase.from("notes").select("*").order("created_at", { ascending: false }).limit(5),
      ])

      const todos = todosRes.data || []
      const projects = projectsRes.data || []
      const courses = coursesRes.data || []

      const stats = {
        completedTodos: todos.filter((t: any) => t.completed).length,
        activeProjects: projects.filter((p: any) => p.status === "in-progress").length,
        coursesInProgress: courses.filter((c: any) => c.status === "in-progress").length,
        totalBookmarks: bookmarksRes.count || 0,
        upcomingEvents: eventsRes.count || 0,
        totalNotes: notesRes.count || 0,
      }

      setStats(stats)

      // Prepare chart data
      setChartData([
        { name: "Todos", completed: stats.completedTodos, total: todos.length },
        { name: "Projects", active: stats.activeProjects, total: projects.length },
        { name: "Courses", inProgress: stats.coursesInProgress, total: courses.length },
      ])

      // Prepare recent activity (mixing latest notes and completed todos)
      const activity = [
        ...(notesRes.data || []).map((n: any) => ({
          id: n.id,
          type: "note",
          title: n.title,
          time: n.created_at || new Date().toISOString(),
          icon: BookOpen
        })),
        ...todos.filter((t: any) => t.completed).slice(0, 3).map((t: any) => ({
          id: t.id,
          type: "todo",
          title: t.title,
          time: t.created_at || new Date().toISOString(),
          icon: CheckSquare
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5)

      setRecentActivity(activity)
      setIsLoading(false)
    }

    fetchStats()
  }, [])

  const features = [
    {
      title: "Daily To-Do's",
      description: "Track your daily tasks and stay organized",
      icon: CheckSquare,
      href: "/todos",
    },
    {
      title: "Bookmarks",
      description: "Save and organize your favorite websites",
      icon: Bookmark,
      href: "/bookmarks",
    },
    {
      title: "Projects",
      description: "Monitor your project progress and milestones",
      icon: FolderKanban,
      href: "/projects",
    },
    {
      title: "Calendar",
      description: "Manage events and get notifications",
      icon: Calendar,
      href: "/calendar",
    },
    {
      title: "Notes",
      description: "Document what you learn every day",
      icon: BookOpen,
      href: "/notes",
    },
    {
      title: "Courses",
      description: "Track course progress with celebrations",
      icon: GraduationCap,
      href: "/courses",
    },
  ]

  return (
    <div className="max-w-6xl">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to TRUPATH</h1>
        <p className="mt-3 text-lg text-muted-foreground">Track your achievements and stay focused on your goals</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Link key={feature.title} href={feature.href}>
              <Card className="h-full transition-all hover:border-primary hover:shadow-sm">
                <CardHeader className="space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription className="mt-2">{feature.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="border-primary/20 bg-card">
          <CardHeader>
            <CardTitle className="text-xl">Progress Analytics</CardTitle>
            <CardDescription>Visual breakdown of your productivity</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <p className="text-muted-foreground animate-pulse">Loading charts...</p>
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                      cursor={{ fill: "hsl(var(--primary)/0.1)" }}
                    />
                    <Bar dataKey="total" fill="hsl(var(--primary)/0.2)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="active" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-card">
          <CardHeader>
            <CardTitle className="text-xl">Recent Activity</CardTitle>
            <CardDescription>Your latest updates and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground">Loading activity...</p>
            ) : recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No recent activity found.</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((item, idx) => (
                  <div key={item.id + idx} className="flex items-center gap-4 rounded-lg border border-border p-3 transition-colors hover:bg-accent/5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-medium truncate">{item.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.time).toLocaleDateString()} {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        <Badge variant="secondary" className="ml-2 text-[10px] uppercase">{item.type}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
        <CardHeader>
          <CardTitle>Achievements Dashboard</CardTitle>
          <CardDescription>Cumulative stats across your TRUPATH</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground">Calculating stats...</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {[
                { label: "Done Tasks", val: stats.completedTodos, color: "text-primary" },
                { label: "Active Projs", val: stats.activeProjects, color: "text-accent" },
                { label: "Study Flow", val: stats.coursesInProgress, color: "text-primary" },
                { label: "Saves", val: stats.totalBookmarks, color: "text-accent" },
                { label: "Events", val: stats.upcomingEvents, color: "text-primary" },
                { label: "Notes", val: stats.totalNotes, color: "text-accent" }
              ].map((s, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center p-4 rounded-xl bg-background/50 border border-border/50">
                  <p className={`text-3xl font-bold ${s.color}`}>{s.val}</p>
                  <p className="mt-1 text-[10px] uppercase font-bold text-muted-foreground text-center">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
