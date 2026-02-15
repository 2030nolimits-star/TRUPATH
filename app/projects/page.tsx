"use client"

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase"
import type { Project } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Plus, Trash2, Edit } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "planning" as "planning" | "in-progress" | "completed" | "on-hold",
    progress: 0,
    start_date: "",
    target_date: "",
  })

  const supabase = getSupabase()

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    setIsLoading(true)
    const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false })

    if (!error && data) {
      setProjects(data)
    }
    setIsLoading(false)
  }

  async function saveProject() {
    if (!formData.name.trim()) return

    if (editingProject) {
      const { error } = await supabase.from("projects").update(formData).eq("id", editingProject.id)
      if (!error) {
        setEditingProject(null)
        resetForm()
        fetchProjects()
      }
    } else {
      const { error } = await supabase.from("projects").insert([formData])
      if (!error) {
        resetForm()
        fetchProjects()
      }
    }
  }

  async function deleteProject(id: string) {
    const { error } = await supabase.from("projects").delete().eq("id", id)
    if (!error) {
      fetchProjects()
    }
  }

  function openEditDialog(project: Project) {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description || "",
      status: project.status,
      progress: project.progress,
      start_date: project.start_date || "",
      target_date: project.target_date || "",
    })
    setIsDialogOpen(true)
  }

  function resetForm() {
    setFormData({
      name: "",
      description: "",
      status: "planning",
      progress: 0,
      start_date: "",
      target_date: "",
    })
    setIsDialogOpen(false)
  }

  const statusColors = {
    planning: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    "in-progress": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    "on-hold": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="mt-1 text-muted-foreground">Track your project progress and milestones</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) {
              setEditingProject(null)
              resetForm()
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProject ? "Edit Project" : "Create New Project"}</DialogTitle>
              <DialogDescription>
                {editingProject ? "Update your project details" : "Add a new project to track"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Project details and goals"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "planning" | "in-progress" | "completed" | "on-hold") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="progress">Progress: {formData.progress}%</Label>
                <Slider
                  id="progress"
                  min={0}
                  max={100}
                  step={5}
                  value={[formData.progress]}
                  onValueChange={([value]) => setFormData({ ...formData, progress: value })}
                  className="mt-2"
                />
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
                  <Label htmlFor="target_date">Target Date</Label>
                  <Input
                    id="target_date"
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={saveProject} className="w-full">
                {editingProject ? "Update Project" : "Create Project"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground">Loading projects...</p>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No projects yet. Start tracking your first project!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <Card key={project.id} className="group">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle>{project.name}</CardTitle>
                    {project.description && <CardDescription className="mt-2">{project.description}</CardDescription>}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(project)}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteProject(project.id)}
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
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={statusColors[project.status]}>{project.status.replace("-", " ")}</Badge>
                  {project.start_date && (
                    <span className="text-xs text-muted-foreground">
                      Started: {new Date(project.start_date).toLocaleDateString()}
                    </span>
                  )}
                  {project.target_date && (
                    <span className="text-xs text-muted-foreground">
                      Target: {new Date(project.target_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
