"use client"

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase"
import type { Todo } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, CalendarIcon, CheckSquare, Bell, Search } from "lucide-react"
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
import { toast } from "sonner"
import { exportToCSV } from "@/lib/export"
import { notificationService } from "@/lib/notifications"

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    due_date: "",
  })

  const supabase = getSupabase()

  // Request notification permission on mount
  useEffect(() => {
    notificationService.requestPermission()
  }, [])

  useEffect(() => {
    fetchTodos()

    // Check for due tasks every minute
    const interval = setInterval(checkReminders, 60000)
    return () => clearInterval(interval)
  }, [])

  const checkReminders = () => {
    const now = new Date()
    todos.forEach(todo => {
      if (!todo.completed && todo.due_date) {
        const dueDate = new Date(todo.due_date)
        // Check if due date is today
        if (dueDate.getDate() === now.getDate() &&
          dueDate.getMonth() === now.getMonth() &&
          dueDate.getFullYear() === now.getFullYear()) {
          // Simple logic: notify if it's due today and hasn't been completed
          notificationService.send({
            title: "Task Due Today",
            body: `Don't forget: ${todo.title}`,
            tag: `todo-${todo.id}`
          })
        }
      }
    })
  }

  async function fetchTodos() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("todos").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching todos:", error)
        toast.error("Failed to load todos. Check your connection or configuration.")
      } else if (data) {
        setTodos(data)
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      toast.error("An unexpected error occurred while loading todos.")
    } finally {
      setIsLoading(false)
    }
  }

  async function addTodo() {
    if (!newTodo.title.trim()) {
      toast.warning("Please enter a title for the task.")
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error("You must be logged in to add todos")
        return
      }

      const { error } = await supabase.from("todos").insert([{ ...newTodo, user_id: user.id }])

      if (error) {
        console.error("Error adding todo:", error)
        toast.error(`Failed to add todo: ${error.message}`)

        // Check for common issues
        if (error.message.includes("violates row-level security")) {
          toast.error("Database permission error. Please check your Supabase RLS policies.")
        }
      } else {
        toast.success("Todo added successfully!")
        setNewTodo({ title: "", description: "", priority: "medium", due_date: "" })
        setIsDialogOpen(false)
        fetchTodos()
      }
    } catch (err) {
      console.error("Unexpected error adding todo:", err)
      toast.error("An unexpected error occurred. Please check if Supabase is configured correctly.")
    }
  }

  async function toggleTodo(id: string, completed: boolean) {
    // Optimistic update
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !completed } : t))

    try {
      const { error } = await supabase.from("todos").update({ completed: !completed }).eq("id", id)

      if (error) {
        console.error("Error updating todo:", error)
        toast.error("Failed to update status")
        // Revert optimistic update
        fetchTodos()
      }
    } catch (err) {
      console.error("Unexpected error updating todo:", err)
      toast.error("An unexpected error occurred")
      fetchTodos()
    }
  }

  async function deleteTodo(id: string) {
    if (!confirm("Are you sure you want to delete this task?")) return

    try {
      const { error } = await supabase.from("todos").delete().eq("id", id)

      if (error) {
        console.error("Error deleting todo:", error)
        toast.error("Failed to delete todo")
      } else {
        toast.success("Todo deleted")
        fetchTodos()
      }
    } catch (err) {
      console.error("Unexpected error deleting todo:", err)
      toast.error("An unexpected error occurred")
    }
  }

  const sendTestNotification = () => {
    notificationService.send({
      title: "Test Notification",
      body: "This is how your task reminders will appear!",
    })
  }

  const priorityColors = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800",
  }

  const filteredTodos = todos.filter((todo) =>
    todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    todo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const completedTodos = todos.filter((t) => t.completed).length
  const totalTodos = todos.length

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily To-Do's</h1>
          <p className="mt-2 text-muted-foreground">
            {completedTodos} of {totalTodos} completed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={sendTestNotification} title="Test Notifications">
            <Bell className="h-4 w-4" />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Todo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Todo</DialogTitle>
                <DialogDescription>Add a new task to your daily todo list</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newTodo.title}
                    onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                    placeholder="Enter task title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={newTodo.description}
                    onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                    placeholder="Add details about this task"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newTodo.priority}
                      onValueChange={(value: "low" | "medium" | "high") => setNewTodo({ ...newTodo, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={newTodo.due_date}
                      onChange={(e) => setNewTodo({ ...newTodo, due_date: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={addTodo} className="w-full">
                  Add Todo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground">Loading todos...</p>
      ) : filteredTodos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CheckSquare className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              {searchQuery ? "No tasks match your search" : "No todos yet. Create your first task!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTodos.map((todo, index) => (
            <div key={todo.id}>
              <Card className={todo.completed ? "opacity-50" : "transition-all hover:border-primary/50"}>
                <CardContent className="flex items-start gap-4 p-4">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id, todo.completed)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-medium ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                        {todo.title}
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTodo(todo.id)}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {todo.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{todo.description}</p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold border ${priorityColors[todo.priority]}`}
                      >
                        {todo.priority.toUpperCase()}
                      </span>
                      {todo.due_date && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          {new Date(todo.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              {index < filteredTodos.length - 1 && (
                <div className="flex items-center justify-center py-2">
                  <div className="h-px w-full bg-border" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
