export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: "low" | "medium" | "high"
  due_date?: string
  created_at: string
  updated_at: string
}

export interface Bookmark {
  id: string
  title: string
  url: string
  description?: string
  category?: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description?: string
  status: "planning" | "in-progress" | "completed" | "on-hold"
  progress: number
  start_date?: string
  target_date?: string
  shared_with?: string[]
  created_at: string
  updated_at: string
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  event_date: string
  event_type: "meeting" | "event" | "deadline" | "reminder"
  location?: string
  notification_sent: boolean
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  title: string
  content: string
  category?: string
  tags?: string[]
  attachment_url?: string
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  name: string
  platform?: string
  description?: string
  progress: number
  total_lessons?: number
  completed_lessons: number
  status: "not-started" | "in-progress" | "completed"
  start_date?: string
  target_completion_date?: string
  created_at: string
  updated_at: string
}
