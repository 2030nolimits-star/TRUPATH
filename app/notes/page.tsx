"use client"

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase"
import type { Note } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Search, BookOpen, Bookmark, ExternalLink, Edit, X } from "lucide-react"
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
import { toast } from "sonner"
import { exportToCSV } from "@/lib/export"
import { motion } from "framer-motion"

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState("")
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const supabase = getSupabase()

  useEffect(() => {
    fetchNotes()
  }, [])

  async function fetchNotes() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("notes").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching notes:", error)
        toast.error("Failed to load notes")
      } else if (data) {
        setNotes(data)
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  async function saveNote() {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.warning("Title and content are required")
      return
    }

    setUploading(true)
    try {
      let attachment_url = editingNote?.attachment_url || ""

      if (file) {
        const fileExt = file.name.split(".").pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage.from("note-attachments").upload(filePath, file)

        if (uploadError) {
          throw uploadError
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("note-attachments").getPublicUrl(filePath)

        attachment_url = publicUrl
      }

      const noteData = { ...formData, attachment_url }

      if (editingNote) {
        const { error } = await supabase.from("notes").update(noteData).eq("id", editingNote.id)
        if (error) {
          console.error("Error updating note:", error)
          toast.error(`Failed to update note: ${error.message}`)
        } else {
          toast.success("Note updated successfully")
          setEditingNote(null)
          resetForm()
          fetchNotes()
        }
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          toast.error("You must be logged in")
          return
        }

        const { error } = await supabase.from("notes").insert([{ ...noteData, user_id: user.id }])
        if (error) {
          console.error("Error creating note:", error)
          toast.error(`Failed to create note: ${error.message}`)
        } else {
          toast.success("Note created successfully")
          resetForm()
          fetchNotes()
        }
      }
    } catch (err: any) {
      console.error("Unexpected error saving note:", err)
      toast.error(`An unexpected error occurred: ${err.message || "Unknown error"}`)
    } finally {
      setUploading(false)
    }
  }

  async function deleteNote(id: string) {
    if (!confirm("Are you sure you want to delete this note?")) return

    try {
      const { error } = await supabase.from("notes").delete().eq("id", id)
      if (error) {
        console.error("Error deleting note:", error)
        toast.error("Failed to delete note")
      } else {
        toast.success("Note deleted")
        fetchNotes()
      }
    } catch (err) {
      console.error("Unexpected error deleting note:", err)
      toast.error("An unexpected error occurred")
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
    setFile(null)
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

  function handleExport() {
    if (notes.length === 0) {
      toast.warning("No notes to export")
      return
    }
    exportToCSV(notes, `notes-${new Date().toISOString().split("T")[0]}`)
    toast.success("Notes exported!")
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
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notes</h1>
          <p className="mt-1 text-muted-foreground">Document and organize your learnings</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
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
                  <Label htmlFor="file">Attachment (Image or PDF)</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      disabled={uploading}
                      className="flex-1"
                    />
                    {editingNote?.attachment_url && !file && (
                      <Badge variant="outline">Has attachment</Badge>
                    )}
                  </div>
                  {file && (
                    <div className="mt-2 flex items-center justify-between rounded-md bg-muted p-2">
                      <span className="text-xs truncate max-w-[200px]">{file.name}</span>
                      <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="h-4 w-4">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <Button onClick={saveNote} className="w-full" disabled={uploading}>
                  {uploading ? "Saving..." : editingNote ? "Update Note" : "Save Note"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
          {filteredNotes.map((note, index) => {
            const getFileIcon = (url: string) => {
              const ext = url.split(".").pop()?.toLowerCase()
              if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) return <Bookmark className="h-3 w-3" />
              if (["pdf"].includes(ext || "")) return <BookOpen className="h-3 w-3" />
              if (["ts", "tsx", "js", "jsx", "py", "html", "css"].includes(ext || "")) return <BookOpen className="h-3 w-3" />
              return <BookOpen className="h-3 w-3" />
            }

            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group flex flex-col h-full">
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
                    {note.attachment_url && (
                      <div className="mt-3">
                        <a
                          href={note.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-primary hover:underline"
                        >
                          {getFileIcon(note.attachment_url)}
                          View Attachment
                          <ExternalLink className="h-2 w-2" />
                        </a>
                      </div>
                    )}
                    <p className="mt-3 text-xs text-muted-foreground">{new Date(note.created_at).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
