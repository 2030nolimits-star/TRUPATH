"use client"

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase"
import type { Todo } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, CalendarIcon, CheckSquare } from "lucide-react"
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

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    due_date: "",
  })

  const supabase = getSupabase()

  useEffect(() => {
    fetchTodos()
  }, [])

  async function fetchTodos() {
    setIsLoading(true)
    const { data, error } = await supabase.from("todos").select("*").order("created_at", { ascending: false })

    if (!error && data) {
      setTodos(data)
    }
    setIsLoading(false)
  }

  async function addTodo() {
    if (!newTodo.title.trim()) return

    const { error } = await supabase.from("todos").insert([newTodo])

    if (!error) {
      setNewTodo({ title: "", description: "", priority: "medium", due_date: "" })
      setIsDialogOpen(false)
      fetchTodos()
    }
  }

  async function toggleTodo(id: string, completed: boolean) {
    const { error } = await supabase.from("todos").update({ completed: !completed }).eq("id", id)

    if (!error) {
      fetchTodos()
    }
  }

  async function deleteTodo(id: string) {
    const { error } = await supabase.from("todos").delete().eq("id", id)

    if (!error) {
      fetchTodos()
    }
  }

  const priorityColors = {
    low: "bg-accent/10 text-accent border border-accent/20",
    medium: "bg-primary/10 text-primary border border-primary/20",
    high: "bg-destructive/10 text-destructive border border-destructive/20",
  }

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
                <Label htmlFor="description">Description</Label>
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

      {isLoading ? (
        <p className="text-center text-muted-foreground">Loading todos...</p>
      ) : todos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CheckSquare className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">No todos yet. Create your first task!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {todos.map((todo, index) => (
            <div key={todo.id}>
              <Card className={todo.completed ? "opacity-50" : ""}>
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
                        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${priorityColors[todo.priority]}`}
                      >
                        {todo.priority}
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
              {index < todos.length - 1 && (
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
