"use client"

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase"
import type { Bookmark } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, ExternalLink, Search, BookmarkIcon } from "lucide-react"
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

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [newBookmark, setNewBookmark] = useState({
    title: "",
    url: "",
    description: "",
    category: "",
  })

  const supabase = getSupabase()

  useEffect(() => {
    fetchBookmarks()
  }, [])

  async function fetchBookmarks() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("bookmarks").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching bookmarks:", error)
        toast.error("Failed to load bookmarks")
      } else if (data) {
        setBookmarks(data)
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  async function addBookmark() {
    if (!newBookmark.title.trim() || !newBookmark.url.trim()) {
      toast.warning("Title and URL are required")
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error("You must be logged in")
        return
      }

      const { error } = await supabase.from("bookmarks").insert([{ ...newBookmark, user_id: user.id }])

      if (error) {
        console.error("Error adding bookmark:", error)
        toast.error(`Failed to add bookmark: ${error.message}`)
      } else {
        toast.success("Bookmark added successfully")
        setNewBookmark({ title: "", url: "", description: "", category: "" })
        setIsDialogOpen(false)
        fetchBookmarks()
      }
    } catch (err) {
      console.error("Unexpected error adding bookmark:", err)
      toast.error("An unexpected error occurred")
    }
  }

  async function deleteBookmark(id: string) {
    if (!confirm("Are you sure you want to delete this bookmark?")) return

    try {
      const { error } = await supabase.from("bookmarks").delete().eq("id", id)

      if (error) {
        console.error("Error deleting bookmark:", error)
        toast.error("Failed to delete bookmark")
      } else {
        toast.success("Bookmark deleted")
        fetchBookmarks()
      }
    } catch (err) {
      console.error("Unexpected error deleting bookmark:", err)
      toast.error("An unexpected error occurred")
    }
  }

  function handleExport() {
    if (bookmarks.length === 0) {
      toast.warning("No bookmarks to export")
      return
    }
    exportToCSV(bookmarks, `bookmarks-${new Date().toISOString().split('T')[0]}`)
    toast.success("Bookmarks exported!")
  }

  const filteredBookmarks = bookmarks.filter(
    (bookmark) =>
      bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.category?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const categories = Array.from(new Set(bookmarks.map((b) => b.category).filter(Boolean)))

  return (
    <div className="max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookmarks</h1>
          <p className="mt-2 text-muted-foreground">Save and organize your favorite websites</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Bookmark
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Bookmark</DialogTitle>
              <DialogDescription>Save a website with description and category</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newBookmark.title}
                  onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })}
                  placeholder="Website name"
                />
              </div>
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={newBookmark.url}
                  onChange={(e) => setNewBookmark({ ...newBookmark, url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newBookmark.description}
                  onChange={(e) => setNewBookmark({ ...newBookmark, description: e.target.value })}
                  placeholder="What is this website about?"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newBookmark.category}
                  onChange={(e) => setNewBookmark({ ...newBookmark, category: e.target.value })}
                  placeholder="e.g., Development, Design, Learning"
                />
              </div>
              <Button onClick={addBookmark} className="w-full">
                Save Bookmark
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
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
        <p className="text-center text-muted-foreground">Loading bookmarks...</p>
      ) : filteredBookmarks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookmarkIcon className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              {searchQuery ? "No bookmarks match your search" : "No bookmarks yet. Save your first website!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBookmarks.map((bookmark) => (
            <Card key={bookmark.id} className="group transition-all hover:border-primary hover:shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="line-clamp-1 text-base">{bookmark.title}</CardTitle>
                    <CardDescription className="mt-1.5 line-clamp-1 break-all text-xs">{bookmark.url}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteBookmark(bookmark.id)}
                      className="h-8 w-8 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {(bookmark.description || bookmark.category) && (
                <CardContent className="pt-0">
                  {bookmark.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{bookmark.description}</p>
                  )}
                  {bookmark.category && (
                    <Badge variant="secondary" className="mt-3">
                      {bookmark.category}
                    </Badge>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
