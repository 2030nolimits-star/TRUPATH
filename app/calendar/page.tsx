"use client"

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase"
import type { CalendarEvent } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Bell, Edit } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { CalendarView } from "@/components/calendar-view"
import { toast } from "sonner"
import { exportToCSV } from "@/lib/export"
import { notificationService } from "@/lib/notifications"

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    event_type: "event" as "meeting" | "event" | "deadline" | "reminder",
    location: "",
  })

  const supabase = getSupabase()

  useEffect(() => {
    fetchEvents()
    setHasNotificationPermission(notificationService.getPermissionStatus() === "granted")
    const interval = setInterval(checkUpcomingEvents, 60000)
    return () => clearInterval(interval)
  }, [])

  async function fetchEvents() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("calendar_events").select("*").order("event_date", { ascending: true })

      if (error) {
        console.error("Error fetching events:", error)
        toast.error("Failed to load events")
      } else if (data) {
        setEvents(data)
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  async function checkUpcomingEvents() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return
    }

    const now = new Date()
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60000)

    const upcomingEvents = events.filter((event) => {
      const eventDate = new Date(event.event_date)
      return eventDate > now && eventDate <= thirtyMinutesFromNow && !event.notification_sent
    })

    for (const event of upcomingEvents) {
      notificationService.send({
        title: "Upcoming Event",
        body: `${event.title} starts in 30 minutes`,
        tag: `event-${event.id}`,
      })
      await supabase.from("calendar_events").update({ notification_sent: true }).eq("id", event.id)
    }

    if (upcomingEvents.length > 0) {
      fetchEvents()
    }
  }

  async function requestNotificationPermission() {
    const granted = await notificationService.requestPermission()
    setHasNotificationPermission(granted)
    if (granted) {
      toast.success("Notifications enabled")
    } else {
      toast.warning("Notifications blocked or not supported")
    }
  }

  async function saveEvent() {
    if (!formData.title.trim() || !formData.event_date) {
      toast.warning("Title and date are required")
      return
    }

    try {
      if (editingEvent) {
        const { error } = await supabase
          .from("calendar_events")
          .update({ ...formData, notification_sent: false })
          .eq("id", editingEvent.id)

        if (error) {
          console.error("Error updating event:", error)
          toast.error(`Failed to update event: ${error.message}`)
        } else {
          toast.success("Event updated successfully")
          setEditingEvent(null)
          resetForm()
          fetchEvents()
        }
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          toast.error("You must be logged in")
          return
        }

        const { error } = await supabase.from("calendar_events").insert([{ ...formData, user_id: user.id }])

        if (error) {
          console.error("Error creating event:", error)
          toast.error(`Failed to create event: ${error.message}`)
        } else {
          toast.success("Event created successfully")
          resetForm()
          fetchEvents()
        }
      }
    } catch (err) {
      console.error("Unexpected error saving event:", err)
      toast.error("An unexpected error occurred")
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      const { error } = await supabase.from("calendar_events").delete().eq("id", id)

      if (error) {
        console.error("Error deleting event:", error)
        toast.error("Failed to delete event")
      } else {
        toast.success("Event deleted")
        fetchEvents()
      }
    } catch (err) {
      console.error("Unexpected error deleting event:", err)
      toast.error("An unexpected error occurred")
    }
  }

  function handleExport() {
    if (events.length === 0) {
      toast.warning("No events to export")
      return
    }
    exportToCSV(events, `events-${new Date().toISOString().split('T')[0]}`)
    toast.success("Events exported!")
  }

  function openEditDialog(event: CalendarEvent) {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description || "",
      event_date: new Date(event.event_date).toISOString().slice(0, 16),
      event_type: event.event_type,
      location: event.location || "",
    })
    setIsDialogOpen(true)
  }

  function resetForm() {
    setFormData({
      title: "",
      description: "",
      event_date: "",
      event_type: "event",
      location: "",
    })
    setIsDialogOpen(false)
    setSelectedDate(null)
  }

  function handleDateClick(date: Date) {
    setSelectedDate(date)
    setFormData({
      ...formData,
      event_date: new Date(date.setHours(12, 0, 0, 0)).toISOString().slice(0, 16),
    })
    setIsDialogOpen(true)
  }

  const typeColors = {
    meeting: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    event: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    deadline: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    reminder: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  }

  const displayEvents = selectedDate
    ? events.filter((e) => {
      const eventDate = new Date(e.event_date)
      return (
        eventDate.getDate() === selectedDate.getDate() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getFullYear() === selectedDate.getFullYear()
      )
    })
    : events

  const upcomingEvents = displayEvents.filter((e) => new Date(e.event_date) > new Date())
  const pastEvents = displayEvents.filter((e) => new Date(e.event_date) <= new Date())

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="mt-1 text-muted-foreground">Manage events and get notifications</p>
        </div>
        <div className="flex gap-2">
          {!hasNotificationPermission && (
            <Button variant="outline" onClick={requestNotificationPermission}>
              <Bell className="mr-2 h-4 w-4" />
              Enable Notifications
            </Button>
          )}
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) {
                setEditingEvent(null)
                resetForm()
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
                <DialogDescription>
                  {editingEvent ? "Update your event details" : "Add a new event to your calendar"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Event title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Event details"
                  />
                </div>
                <div>
                  <Label htmlFor="event_date">Date & Time</Label>
                  <Input
                    id="event_date"
                    type="datetime-local"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="event_type">Type</Label>
                  <Select
                    value={formData.event_type}
                    onValueChange={(value: "meeting" | "event" | "deadline" | "reminder") =>
                      setFormData({ ...formData, event_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="deadline">Deadline</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Event location or meeting link"
                  />
                </div>
                <Button onClick={saveEvent} className="w-full">
                  {editingEvent ? "Update Event" : "Create Event"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground">Loading events...</p>
      ) : (
        <div className="space-y-6">
          <CalendarView events={events} onDateClick={handleDateClick} />

          {selectedDate && (
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Events for{" "}
                {selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </h2>
              <Button variant="outline" size="sm" onClick={() => setSelectedDate(null)}>
                Show All Events
              </Button>
            </div>
          )}

          {displayEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">No events on this date.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {upcomingEvents.length > 0 && (
                <div>
                  <h2 className="mb-4 text-xl font-semibold">{selectedDate ? "Upcoming" : "Upcoming Events"}</h2>
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <Card key={event.id} className="group">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <CardTitle>{event.title}</CardTitle>
                                <Badge className={typeColors[event.event_type]}>{event.event_type}</Badge>
                              </div>
                              {event.description && (
                                <CardDescription className="mt-2">{event.description}</CardDescription>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(event)}
                                className="opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteEvent(event.id)}
                                className="text-destructive opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span>{new Date(event.event_date).toLocaleString()}</span>
                            {event.location && <span>{event.location}</span>}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {pastEvents.length > 0 && (
                <div>
                  <h2 className="mb-4 text-xl font-semibold">{selectedDate ? "Past" : "Past Events"}</h2>
                  <div className="space-y-3 opacity-60">
                    {pastEvents.map((event) => (
                      <Card key={event.id} className="group">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <CardTitle>{event.title}</CardTitle>
                                <Badge className={typeColors[event.event_type]}>{event.event_type}</Badge>
                              </div>
                              {event.description && (
                                <CardDescription className="mt-2">{event.description}</CardDescription>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteEvent(event.id)}
                              className="text-destructive opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span>{new Date(event.event_date).toLocaleString()}</span>
                            {event.location && <span>{event.location}</span>}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
