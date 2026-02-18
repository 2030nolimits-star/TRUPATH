"use client"

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase"
import type { Project } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Plus, Trash2, Edit, ExternalLink, User, Search, FolderKanban } from "lucide-react"
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
import { toast } from "sonner"
import { exportToCSV } from "@/lib/export"
import { motion } from "framer-motion"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState("")
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
  const [sharingProject, setSharingProject] = useState<Project | null>(null)
  const [sharingEmail, setSharingEmail] = useState("")
  const [isSharingDialogOpen, setIsSharingDialogOpen] = useState(false)

  const supabase = getSupabase()

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching projects:", error)
        toast.error("Failed to load projects")
      } else if (data) {
        setProjects(data)
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  async function saveProject() {
    if (!formData.name.trim()) {
      toast.warning("Project name is required")
      return
    }

    try {
      if (editingProject) {
        const { error } = await supabase.from("projects").update(formData).eq("id", editingProject.id)
        if (error) {
          console.error("Error updating project:", error)
          toast.error(`Failed to update project: ${error.message}`)
        } else {
          toast.success("Project updated successfully")
          setEditingProject(null)
          resetForm()
          fetchProjects()
        }
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          toast.error("You must be logged in")
          return
        }

        const { error } = await supabase.from("projects").insert([{ ...formData, user_id: user.id }])
        if (error) {
          console.error("Error creating project:", error)
          toast.error(`Failed to create project: ${error.message}`)
        } else {
          toast.success("Project created successfully")
          resetForm()
          fetchProjects()
        }
      }
    } catch (err) {
      console.error("Unexpected error saving project:", err)
      toast.error("An unexpected error occurred")
    }
  }

  async function deleteProject(id: string) {
    if (!confirm("Are you sure you want to delete this project?")) return

    try {
      const { error } = await supabase.from("projects").delete().eq("id", id)
      if (error) {
        console.error("Error deleting project:", error)
        toast.error("Failed to delete project")
      } else {
        toast.success("Project deleted")
        fetchProjects()
      }
    } catch (err) {
      console.error("Unexpected error deleting project:", err)
      toast.error("An unexpected error occurred")
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

  function handleExport() {
    if (projects.length === 0) {
      toast.warning("No projects to export")
      return
    }
    exportToCSV(projects, `projects-${new Date().toISOString().split('T')[0]}`)
    toast.success("Projects exported!")
  }

  async function shareProject() {
    if (!sharingEmail.trim() || !sharingProject) {
      toast.warning("Email is required")
      return
    }

    try {
      // Logic to add email to shared_with array
      const currentSharedWith = sharingProject.shared_with || []
      if (currentSharedWith.includes(sharingEmail.trim())) {
        toast.info("Project is already shared with this user")
        return
      }

      const { error } = await supabase
        .from("projects")
        .update({ shared_with: [...currentSharedWith, sharingEmail.trim()] })
        .eq("id", sharingProject.id)

      if (error) {
        throw error
      }

      toast.success(`Project shared with ${sharingEmail}`)
      setSharingEmail("")
      setIsSharingDialogOpen(false)
      fetchProjects()
    } catch (err: any) {
      console.error("Error sharing project:", err)
      toast.error(`Failed to share project: ${err.message}`)
    }
  }

  const statusColors = {
    planning: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    "in-progress": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    "on-hold": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  }

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="mt-1 text-muted-foreground">Monitor your project progress and milestones</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            📥 Export CSV
          </Button>
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
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground">Loading projects...</p>
      ) : filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? "No projects match your search" : "No projects yet. Start tracking your goals!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group h-full">
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
                        onClick={() => {
                          setSharingProject(project)
                          setIsSharingDialogOpen(true)
                        }}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
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
                    <Badge className={statusColors[project.status] as string}>{project.status.replace("-", " ")}</Badge>
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
                  {project.shared_with && project.shared_with.length > 0 && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground text-ellipsis overflow-hidden whitespace-nowrap">
                        Shared with: {project.shared_with.join(", ")}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={isSharingDialogOpen} onOpenChange={setIsSharingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Project</DialogTitle>
            <DialogDescription>
              Enter the email address of the user you want to share "{sharingProject?.name}" with.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={sharingEmail}
                onChange={(e) => setSharingEmail(e.target.value)}
              />
            </div>
            <Button onClick={shareProject} className="w-full">
              Share
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
