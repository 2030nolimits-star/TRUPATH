"use client"

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckSquare, Bookmark, FolderKanban, Calendar, BookOpen, GraduationCap } from "lucide-react"
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

  const supabase = getSupabase()

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true)

      const [todosRes, projectsRes, coursesRes, bookmarksRes, eventsRes, notesRes] = await Promise.all([
        supabase.from("todos").select("*", { count: "exact" }).eq("completed", true),
        supabase.from("projects").select("*", { count: "exact" }).eq("status", "In Progress"),
        supabase.from("courses").select("*", { count: "exact" }).eq("status", "In Progress"),
        supabase.from("bookmarks").select("*", { count: "exact" }),
        supabase.from("calendar_events").select("*", { count: "exact" }),
        supabase.from("notes").select("*", { count: "exact" }),
      ])

      setStats({
        completedTodos: todosRes.count || 0,
        activeProjects: projectsRes.count || 0,
        coursesInProgress: coursesRes.count || 0,
        totalBookmarks: bookmarksRes.count || 0,
        upcomingEvents: eventsRes.count || 0,
        totalNotes: notesRes.count || 0,
      })

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

      <Card className="mt-8 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
          <CardDescription>Track your achievements at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading your stats...</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-4xl font-bold text-primary">{stats.completedTodos}</p>
                <p className="mt-1 text-sm text-muted-foreground">Completed Todos</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-accent">{stats.activeProjects}</p>
                <p className="mt-1 text-sm text-muted-foreground">Active Projects</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary">{stats.coursesInProgress}</p>
                <p className="mt-1 text-sm text-muted-foreground">Courses In Progress</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-accent">{stats.totalBookmarks}</p>
                <p className="mt-1 text-sm text-muted-foreground">Saved Bookmarks</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary">{stats.upcomingEvents}</p>
                <p className="mt-1 text-sm text-muted-foreground">Calendar Events</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-accent">{stats.totalNotes}</p>
                <p className="mt-1 text-sm text-muted-foreground">Learning Notes</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
