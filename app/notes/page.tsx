"use client"

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase"
import type { Note } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Edit, Search } from "lucide-react"
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

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState("")

  const supabase = getSupabase()

  useEffect(() => {
    fetchNotes()
  }, [])

  async function fetchNotes() {
    setIsLoading(true)
    const { data, error } = await supabase.from("notes").select("*").order("created_at", { ascending: false })

    if (!error && data) {
      setNotes(data)
    }
    setIsLoading(false)
  }

  async function saveNote() {
    if (!formData.title.trim() || !formData.content.trim()) return

    if (editingNote) {
      const { error } = await supabase.from("notes").update(formData).eq("id", editingNote.id)
      if (!error) {
        setEditingNote(null)
        resetForm()
        fetchNotes()
      }
    } else {
      const { error } = await supabase.from("notes").insert([formData])
      if (!error) {
        resetForm()
        fetchNotes()
      }
    }
  }

  async function deleteNote(id: string) {
    const { error } = await supabase.from("notes").delete().eq("id", id)
    if (!error) {
      fetchNotes()
    }
  }

  function openEditDialog(note: Note) {
    setEditingNote(note)
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category || "",
      tags: note.tags || [],
    })
    setIsDialogOpen(true)
  }

  function resetForm() {
    setFormData({
      title: "",
      content: "",
      category: "",
      tags: [],
    })
    setTagInput("")
    setIsDialogOpen(false)
  }

  function addTag() {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] })
      setTagInput("")
    }
  }

  function removeTag(tag: string) {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) })
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const categories = Array.from(new Set(notes.map((n) => n.category).filter(Boolean)))

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Learning Notes</h1>
          <p className="mt-1 text-muted-foreground">Document what you learn every day</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) {
              setEditingNote(null)
              resetForm()
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingNote ? "Edit Note" : "Create New Note"}</DialogTitle>
              <DialogDescription>
                {editingNote ? "Update your learning note" : "Capture your learning insights"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Note title"
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write what you learned..."
                  rows={8}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Programming, Design, Business"
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                    placeholder="Add tags"
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={saveNote} className="w-full">
                {editingNote ? "Update Note" : "Save Note"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Button variant={searchQuery === "" ? "default" : "outline"} size="sm" onClick={() => setSearchQuery("")}>
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={searchQuery === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSearchQuery(category || "")}
            >
              {category}
            </Button>
          ))}
        </div>
      )}

      {isLoading ? (
        <p className="text-center text-muted-foreground">Loading notes...</p>
      ) : filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? "No notes match your search" : "No notes yet. Start documenting your learning!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="group flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-1">{note.title}</CardTitle>
                    {note.category && <CardDescription className="mt-1">{note.category}</CardDescription>}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(note)}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteNote(note.id)}
                      className="text-destructive opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="line-clamp-4 text-sm text-muted-foreground">{note.content}</p>
                {note.tags && note.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {note.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-xs text-muted-foreground">{new Date(note.created_at).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
