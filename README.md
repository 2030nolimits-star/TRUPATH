# TRUPATH

**Track your path. Achieve your goals. Stay true to yourself.**

TRUPATH is an all-in-one achievement tracking and productivity platform built for students. It brings together task management, project tracking, course progress, note-taking, bookmarks, and calendar scheduling into a single cohesive dashboard -- so you can stop juggling multiple apps and focus on what matters.

Created by **Trushi Patel**.

---

## Features

### Dashboard
A central overview showing live stats across all modules -- completed todos, active projects, courses in progress, saved bookmarks, calendar events, and learning notes.

### Daily To-Do's
Manage daily tasks with priority levels (low, medium, high), due dates, and completion tracking. Designed for quick entry and clear visual feedback.

### Bookmarks Manager
Save and organize websites and online resources by category (Resource, Tool, Article, Tutorial, Other) with full-text search and filtering.

### Projects Tracker
Track academic and personal projects with percentage-based progress bars, status management (Planning, In Progress, On Hold, Completed), and start/end date tracking.

### Interactive Calendar
A full month-view calendar with color-coded event types (Meetings, Events, Deadlines, Reminders), click-to-filter by date, and browser notifications for upcoming events.

### Learning Notes
Capture and organize notes by category (Lecture, Reading, Practice, Summary, Other) with a tag system for flexible retrieval and search.

### Course Progress Tracker
Track online courses across platforms (Coursera, Udemy, EdX, YouTube, etc.) with visual progress bars and confetti celebrations on completion.

---

## Tech Stack

| Layer       | Technology                                     |
|-------------|------------------------------------------------|
| Framework   | Next.js 15 (App Router)                        |
| Language    | TypeScript                                     |
| UI          | React 19, Tailwind CSS v4, shadcn/ui           |
| Database    | Supabase (PostgreSQL)                          |
| Fonts       | Geist, Geist Mono                              |
| Analytics   | Vercel Analytics                               |

---

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A [Supabase](https://supabase.com) project

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd trupath
```

### 2. Install dependencies

```bash
npm install
# or
bun install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up the database

Run the SQL migration in your Supabase SQL editor:

```
scripts/01-create-tables.sql
```

This creates all six tables (todos, bookmarks, projects, calendar_events, notes, courses) with proper indexes and constraints.

### 5. Run the development server

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## Database Schema

Six core tables, each with UUID primary keys, timestamps, and performance indexes:

- **todos** -- Task title, description, priority, due date, completion status
- **bookmarks** -- Title, URL, description, category
- **projects** -- Name, description, status, progress (0-100), start/target dates
- **calendar_events** -- Title, description, event date/time, event type, location
- **notes** -- Title, content, category, tags (text array)
- **courses** -- Name, platform, description, progress, lesson tracking, status

---

## Project Structure

```
app/
  page.tsx              # Dashboard
  todos/                # Daily To-Do's
  bookmarks/            # Bookmarks Manager
  projects/             # Projects Tracker
  calendar/             # Interactive Calendar
  notes/                # Learning Notes
  courses/              # Course Progress Tracker
  globals.css           # Theme tokens and Tailwind config
  layout.tsx            # Root layout with sidebar

components/
  sidebar.tsx           # Fixed sidebar navigation
  footer.tsx            # Site footer
  calendar-view.tsx     # Calendar grid component
  ui/                   # shadcn/ui component library

lib/
  supabase.ts           # Supabase client singleton
  types.ts              # TypeScript interfaces
  utils.ts              # Utility functions

scripts/
  01-create-tables.sql  # Database migration
```

---

## Design

TRUPATH uses a dark-mode-first design system with a purple-pink to blue color palette, optimized for long study sessions and reduced eye strain. The interface features a fixed sidebar for navigation, clean card-based layouts, and consistent spacing throughout.

---

## License

All rights reserved.
