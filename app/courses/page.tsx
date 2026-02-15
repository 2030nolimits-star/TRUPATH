"use client"

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase"
import type { Course } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Plus, Trash2, Edit, Trophy, PartyPopper } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [completedCourseName, setCompletedCourseName] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    platform: "",
    description: "",
    progress: 0,
    total_lessons: 0,
    completed_lessons: 0,
    status: "not-started" as "not-started" | "in-progress" | "completed",
    start_date: "",
    target_completion_date: "",
  })

  const supabase = getSupabase()

  useEffect(() => {
    fetchCourses()
  }, [])

  async function fetchCourses() {
    setIsLoading(true)
    const { data, error } = await supabase.from("courses").select("*").order("created_at", { ascending: false })

    if (!error && data) {
      setCourses(data)
    }
    setIsLoading(false)
  }

  function calculateProgress(completedLessons: number, totalLessons: number) {
    if (totalLessons === 0) return 0
    return Math.round((completedLessons / totalLessons) * 100)
  }

  async function saveCourse() {
    if (!formData.name.trim()) return

    const progress = calculateProgress(formData.completed_lessons, formData.total_lessons)
    const status = progress === 100 ? "completed" : progress > 0 ? "in-progress" : "not-started"

    const courseData = { ...formData, progress, status }

    if (editingCourse) {
      const wasCompleted = editingCourse.status === "completed"
      const isNowCompleted = status === "completed"

      const { error } = await supabase.from("courses").update(courseData).eq("id", editingCourse.id)

      if (!error) {
        if (!wasCompleted && isNowCompleted) {
          triggerCelebration(formData.name)
        }
        setEditingCourse(null)
        resetForm()
        fetchCourses()
      }
    } else {
      const { error } = await supabase.from("courses").insert([courseData])
      if (!error) {
        if (status === "completed") {
          triggerCelebration(formData.name)
        }
        resetForm()
        fetchCourses()
      }
    }
  }

  function triggerCelebration(courseName: string) {
    setCompletedCourseName(courseName)
    setShowCelebration(true)

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Course Completed!", {
        body: `Congratulations! You've completed ${courseName}`,
        icon: "/icon.svg",
      })
    }

    setTimeout(() => {
      setShowCelebration(false)
    }, 5000)
  }

  async function deleteCourse(id: string) {
    const { error } = await supabase.from("courses").delete().eq("id", id)
    if (!error) {
      fetchCourses()
    }
  }

  function openEditDialog(course: Course) {
    setEditingCourse(course)
    setFormData({
      name: course.name,
      platform: course.platform || "",
      description: course.description || "",
      progress: course.progress,
      total_lessons: course.total_lessons || 0,
      completed_lessons: course.completed_lessons,
      status: course.status,
      start_date: course.start_date || "",
      target_completion_date: course.target_completion_date || "",
    })
    setIsDialogOpen(true)
  }

  function resetForm() {
    setFormData({
      name: "",
      platform: "",
      description: "",
      progress: 0,
      total_lessons: 0,
      completed_lessons: 0,
      status: "not-started",
      start_date: "",
      target_completion_date: "",
    })
    setIsDialogOpen(false)
  }

  const statusColors = {
    "not-started": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  }

  const activeCourses = courses.filter((c) => c.status !== "completed")
  const completedCourses = courses.filter((c) => c.status === "completed")

  return (
    <div>
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <Card className="max-w-md animate-in zoom-in">
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
              <div className="rounded-full bg-primary/10 p-6">
                <Trophy className="h-16 w-16 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Congratulations!</h2>
                <p className="mt-2 text-muted-foreground">You completed {completedCourseName}!</p>
              </div>
              <PartyPopper className="h-12 w-12 animate-bounce text-amber-500" />
              <Button onClick={() => setShowCelebration(false)}>Awesome!</Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="mt-1 text-muted-foreground">Track your learning journey with celebrations</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) {
              setEditingCourse(null)
              resetForm()
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCourse ? "Edit Course" : "Add New Course"}</DialogTitle>
              <DialogDescription>
                {editingCourse ? "Update your course details" : "Start tracking a new course"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Course Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Course title"
                />
              </div>
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Input
                  id="platform"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  placeholder="e.g., Coursera, Udemy, YouTube"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What will you learn?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="completed_lessons">Completed Lessons</Label>
                  <Input
                    id="completed_lessons"
                    type="number"
                    min="0"
                    value={formData.completed_lessons}
                    onChange={(e) =>
                      setFormData({ ...formData, completed_lessons: Math.max(0, Number.parseInt(e.target.value) || 0) })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="total_lessons">Total Lessons</Label>
                  <Input
                    id="total_lessons"
                    type="number"
                    min="0"
                    value={formData.total_lessons}
                    onChange={(e) =>
                      setFormData({ ...formData, total_lessons: Math.max(0, Number.parseInt(e.target.value) || 0) })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="target_completion_date">Target Completion</Label>
                  <Input
                    id="target_completion_date"
                    type="date"
                    value={formData.target_completion_date}
                    onChange={(e) => setFormData({ ...formData, target_completion_date: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={saveCourse} className="w-full">
                {editingCourse ? "Update Course" : "Add Course"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground">Loading courses...</p>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No courses yet. Start tracking your learning journey!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {activeCourses.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">Active Courses</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {activeCourses.map((course) => (
                  <Card key={course.id} className="group">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle>{course.name}</CardTitle>
                          {course.platform && <CardDescription>{course.platform}</CardDescription>}
                          {course.description && (
                            <p className="mt-2 text-sm text-muted-foreground">{course.description}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(course)}
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteCourse(course.id)}
                            className="text-destructive opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            {course.completed_lessons} / {course.total_lessons || 0} lessons ({course.progress}%)
                          </span>
                        </div>
                        <Progress value={course.progress} />
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={statusColors[course.status]}>{course.status.replace("-", " ")}</Badge>
                        {course.start_date && (
                          <span className="text-xs text-muted-foreground">
                            Started: {new Date(course.start_date).toLocaleDateString()}
                          </span>
                        )}
                        {course.target_completion_date && (
                          <span className="text-xs text-muted-foreground">
                            Target: {new Date(course.target_completion_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {completedCourses.length > 0 && (
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Trophy className="h-5 w-5 text-primary" />
                Completed Courses
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {completedCourses.map((course) => (
                  <Card key={course.id} className="group border-primary/20 bg-primary/5">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle>{course.name}</CardTitle>
                          {course.platform && <CardDescription>{course.platform}</CardDescription>}
                          {course.description && (
                            <p className="mt-2 text-sm text-muted-foreground">{course.description}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteCourse(course.id)}
                          className="text-destructive opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={statusColors[course.status]}>
                          <Trophy className="mr-1 h-3 w-3" />
                          {course.status}
                        </Badge>
                        {course.total_lessons && (
                          <span className="text-xs text-muted-foreground">
                            {course.total_lessons} lessons completed
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
