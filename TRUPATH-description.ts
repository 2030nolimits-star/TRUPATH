/**
 * TRUPATH - Comprehensive Achievement Tracking Platform for Students
 *
 * A powerful, all-in-one achievement tracking and productivity platform designed
 * specifically for students who want to organize their academic journey, monitor
 * progress, and celebrate accomplishments.
 */

export const TRUPATH_DESCRIPTION = {
  // ============================================================================
  // BRAND IDENTITY
  // ============================================================================

  name: "TRUPATH",
  tagline: "Track your path. Achieve your goals. Stay true to yourself.",
  creator: "Trushi Patel",

  philosophy: `
    TRUPATH embodies the belief that every student has unlimited potential. 
    By providing comprehensive tools to track daily tasks, projects, learning 
    resources, and milestones, the platform empowers students to visualize their 
    progress, stay organized, and build momentum toward their academic and 
    personal goals. The name "TRUPATH" represents staying true to your unique 
    path while achieving your dreams.
  `,

  // ============================================================================
  // VISUAL DESIGN
  // ============================================================================

  designSystem: {
    theme: "Dark mode with pinkish-purple gradient aesthetic",
    colorPalette: {
      primary: "Soft purple-pink tones (#a855f7 to #ec4899)",
      accent: "Vibrant blue (#3b82f6)",
      background: "Deep dark (#0a0a0f to #1a1625)",
      philosophy: "Calming colors optimized for long study sessions and reduced eye strain",
    },
    typography: {
      approach: "Minimalistic and student-focused",
      hierarchy: "Clear visual hierarchy with proper spacing",
      readability: "Optimized for extended reading sessions",
    },
    logo: {
      design: "Gradient arrow symbol pointing upward",
      symbolism: "Progress, growth, and forward momentum",
      colors: "Pink → Purple → Blue gradient representing the journey from start to mastery",
    },
  },

  // ============================================================================
  // CORE FEATURES
  // ============================================================================

  features: {
    dailyTodos: {
      name: "Daily To-Do's",
      description: "A streamlined task management system that helps students organize their daily responsibilities",
      capabilities: [
        "Priority levels (Low, Medium, High) with color-coded indicators",
        "Due date tracking with visual status updates",
        "Task descriptions for detailed planning",
        "Clean, minimalistic interface with subtle separators between tasks",
        "Quick add functionality for rapid task entry",
        "Complete/incomplete toggle with visual feedback",
        "Delete functionality to remove completed or cancelled tasks",
      ],
      useCase: "Perfect for managing daily assignments, study sessions, errands, and personal tasks",
      database: "Stores in 'todos' table with user_id, title, description, priority, due_date, completed status",
    },

    bookmarksManager: {
      name: "Bookmarks Manager",
      description: "A centralized hub for organizing all your important websites and online resources",
      capabilities: [
        "Save unlimited URLs with custom titles and descriptions",
        "Category organization (Resource, Tool, Article, Tutorial, Other)",
        "Search functionality to quickly find saved links",
        "Category filtering for efficient navigation",
        "Visual card layout with external link icons",
        "Add, edit, and delete bookmarks",
      ],
      useCase: "Perfect for collecting research materials, study resources, documentation, tutorials, and useful tools",
      database: "Stores in 'bookmarks' table with user_id, title, url, description, category",
    },

    projectsTracker: {
      name: "Projects Tracker",
      description: "Comprehensive project management designed for academic and personal projects",
      capabilities: [
        "Detailed project descriptions and goals",
        "Visual progress tracking with percentage-based progress bars",
        "Status management (Planning, In Progress, On Hold, Completed)",
        "Start and end date tracking",
        "Color-coded progress indicators (red < 30%, yellow 30-70%, green > 70%)",
        "Edit and update capabilities for evolving projects",
        "Real-time progress calculation",
      ],
      useCase:
        "Perfect for tracking assignments, research papers, coding projects, group projects, and long-term goals",
      database: "Stores in 'projects' table with user_id, name, description, status, progress, start_date, end_date",
    },

    smartCalendar: {
      name: "Interactive Calendar with Smart Notifications",
      description: "A full-featured calendar system that keeps you on schedule",
      capabilities: [
        "Visual month-view calendar grid showing all your events",
        "Multiple event types: Meetings, Events, Deadlines, Reminders",
        "Color-coded event badges for quick identification",
        "Browser notifications for upcoming events (30-minute advance warning)",
        "Click-to-filter functionality by date",
        "Quick event creation from any calendar date",
        "Event time tracking with visual timeline",
        "Today's date highlighted for easy reference",
      ],
      useCase:
        "Perfect for managing class schedules, study sessions, deadlines, meetings, office hours, and social events",
      database:
        "Stores in 'calendar_events' table with user_id, title, description, event_date, event_time, event_type",
      technology: "Uses browser Notification API with permission requests",
    },

    learningNotes: {
      name: "Learning Notes Repository",
      description: "A dedicated space for capturing and organizing your learning journey",
      capabilities: [
        "Rich text area for detailed note-taking",
        "Category organization (Lecture, Reading, Practice, Summary, Other)",
        "Tag system for flexible organization and retrieval",
        "Search functionality across all notes",
        "Category filtering for focused review",
        "Timestamp tracking to see your learning progression",
        "Add, edit, and delete notes",
      ],
      useCase: "Ideal for lecture notes, study summaries, key concepts, insights, book notes, and research findings",
      database: "Stores in 'notes' table with user_id, title, content, category, tags (text array)",
    },

    courseProgressTracker: {
      name: "Course Progress Tracker with Celebrations",
      description: "Gamified course management that makes learning rewarding",
      capabilities: [
        "Track all your current courses in one place",
        "Platform specification (Coursera, Udemy, EdX, YouTube, Other)",
        "Visual progress tracking with completion percentages",
        "Status management (Not Started, In Progress, Completed)",
        "Celebration animations with confetti when courses are completed",
        "Success notifications to mark achievements",
        "Instructor tracking for reference",
        "Progress bar visualization",
      ],
      useCase: "Perfect for MOOCs, online tutorials, certification programs, self-study courses, and skill development",
      database: "Stores in 'courses' table with user_id, name, platform, instructor, progress, status",
      gamification: "Confetti animation and toast notification on 100% completion to celebrate achievements",
    },
  },

  // ============================================================================
  // TECHNICAL ARCHITECTURE
  // ============================================================================

  technicalStack: {
    frontend: {
      framework: "Next.js 15.1.3 (App Router)",
      library: "React 19",
      language: "TypeScript",
      styling: "Tailwind CSS v4",
      components: "Custom components with shadcn/ui base",
      features: [
        "Server and Client Components for optimal performance",
        "Responsive design that works on all devices",
        "Dark mode optimized interface",
        "Smooth animations and transitions",
        "Fast page loads with code splitting",
      ],
    },

    backend: {
      database: "Supabase (PostgreSQL)",
      authentication: "Supabase Auth (ready for implementation)",
      realTime: "Supabase real-time subscriptions",
      storage: "Server-side data persistence",
      features: [
        "Type-safe database operations with TypeScript",
        "Proper database indexing for fast queries",
        "Foreign key constraints for data integrity",
        "Created_at and updated_at timestamps on all tables",
      ],
    },

    databaseSchema: {
      tables: {
        todos: [
          "id (uuid, primary key)",
          "user_id (uuid, foreign key)",
          "title (text, required)",
          "description (text)",
          "priority (text: low, medium, high)",
          "due_date (date)",
          "completed (boolean, default false)",
          "created_at (timestamp)",
        ],
        bookmarks: [
          "id (uuid, primary key)",
          "user_id (uuid, foreign key)",
          "title (text, required)",
          "url (text, required)",
          "description (text)",
          "category (text: resource, tool, article, tutorial, other)",
          "created_at (timestamp)",
        ],
        projects: [
          "id (uuid, primary key)",
          "user_id (uuid, foreign key)",
          "name (text, required)",
          "description (text)",
          "status (text: planning, in_progress, on_hold, completed)",
          "progress (integer, 0-100)",
          "start_date (date)",
          "end_date (date)",
          "created_at (timestamp)",
        ],
        calendar_events: [
          "id (uuid, primary key)",
          "user_id (uuid, foreign key)",
          "title (text, required)",
          "description (text)",
          "event_date (date, required)",
          "event_time (time)",
          "event_type (text: meeting, event, deadline, reminder)",
          "created_at (timestamp)",
        ],
        notes: [
          "id (uuid, primary key)",
          "user_id (uuid, foreign key)",
          "title (text, required)",
          "content (text, required)",
          "category (text: lecture, reading, practice, summary, other)",
          "tags (text array)",
          "created_at (timestamp)",
          "updated_at (timestamp)",
        ],
        courses: [
          "id (uuid, primary key)",
          "user_id (uuid, foreign key)",
          "name (text, required)",
          "platform (text: coursera, udemy, edx, youtube, other)",
          "instructor (text)",
          "progress (integer, 0-100)",
          "status (text: not_started, in_progress, completed)",
          "created_at (timestamp)",
        ],
      },
      indexes: [
        "idx_todos_user_id on todos(user_id)",
        "idx_bookmarks_user_id on bookmarks(user_id)",
        "idx_projects_user_id on projects(user_id)",
        "idx_calendar_events_user_id on calendar_events(user_id)",
        "idx_calendar_events_date on calendar_events(event_date)",
        "idx_notes_user_id on notes(user_id)",
        "idx_courses_user_id on courses(user_id)",
      ],
    },

    performance: {
      optimizations: [
        "Code splitting for faster initial load",
        "Lazy loading of components",
        "Optimized images with Next.js Image component",
        "Database query optimization with proper indexes",
        "Client-side caching with React state",
        "Debounced search inputs",
      ],
    },

    security: {
      features: [
        "Environment variables for sensitive data",
        "Supabase Row Level Security (RLS) ready",
        "SQL injection prevention with parameterized queries",
        "XSS protection with React's built-in sanitization",
        "HTTPS enforcement in production",
      ],
    },
  },

  // ============================================================================
  // USER EXPERIENCE
  // ============================================================================

  userExperience: {
    navigation: {
      type: "Fixed sidebar navigation",
      features: [
        "Always visible for quick access",
        "Active page highlighting",
        "Icon-based menu items with labels",
        "TRUPATH logo and branding at the top",
        "Smooth transitions between pages",
      ],
    },

    layout: {
      structure: "Sidebar + Main content area + Footer",
      mainContent: "Max-width container with proper padding",
      spacing: "Consistent spacing using Tailwind scale",
      responsiveness: "Mobile-first design with breakpoints",
    },

    interactions: {
      forms: [
        "Inline add forms for quick entry",
        "Clear visual feedback on submission",
        "Form validation with error messages",
        "Loading states during async operations",
        "Success notifications on completion",
      ],
      feedback: [
        "Toast notifications for important actions",
        "Confetti animations for celebrations",
        "Browser notifications for calendar reminders",
        "Progress bars for visual tracking",
        "Status badges with color coding",
      ],
    },

    accessibility: {
      features: [
        "Semantic HTML structure",
        "Keyboard navigation support",
        "Focus indicators on interactive elements",
        "Proper ARIA labels",
        "Sufficient color contrast ratios",
      ],
    },
  },

  // ============================================================================
  // BENEFITS FOR STUDENTS
  // ============================================================================

  studentBenefits: {
    organization: {
      benefit: "Centralized Organization",
      description: "All your academic tools in one place - no more switching between multiple apps",
      impact: "Reduces cognitive load and saves time by keeping everything in a single platform",
    },

    visualization: {
      benefit: "Visual Progress Tracking",
      description:
        "See your achievements and progress at a glance with progress bars, calendars, and status indicators",
      impact: "Increases motivation by making progress visible and tangible",
    },

    motivation: {
      benefit: "Motivation & Celebration",
      description: "Get rewarded with celebration animations when completing courses and milestones",
      impact: "Creates positive reinforcement and makes learning more enjoyable",
    },

    timeManagement: {
      benefit: "Time Management",
      description: "Calendar notifications ensure you never miss important deadlines or meetings",
      impact: "Reduces stress and improves punctuality",
    },

    knowledgeRetention: {
      benefit: "Knowledge Retention",
      description: "Organized notes and bookmarks make it easy to review and revisit learning materials",
      impact: "Improves long-term retention and makes studying more efficient",
    },

    focusFriendly: {
      benefit: "Focus-Friendly Design",
      description: "Dark mode with calming colors reduces eye strain during long study sessions",
      impact: "Enables longer, more productive study sessions without fatigue",
    },

    comprehensiveTracking: {
      benefit: "Comprehensive Tracking",
      description: "From daily tasks to long-term projects, track every aspect of your academic journey",
      impact: "Provides complete visibility into your productivity and achievements",
    },
  },

  // ============================================================================
  // TARGET AUDIENCE
  // ============================================================================

  targetAudience: {
    primary: [
      "High school students managing multiple courses and extracurriculars",
      "College and university students juggling assignments, projects, and exams",
      "Graduate students tracking research and coursework",
      "Self-taught learners taking online courses and certifications",
    ],
    useCases: [
      "Students preparing for competitive exams (SAT, GRE, GMAT, etc.)",
      "Students building portfolios of projects",
      "Study groups coordinating schedules and resources",
      "Anyone wanting to visualize and celebrate their learning progress",
      "Students transitioning between high school and college",
      "Non-traditional students balancing work and education",
    ],
  },

  // ============================================================================
  // FUTURE ENHANCEMENTS
  // ============================================================================

  futureFeatures: {
    planned: [
      "Study timer with Pomodoro technique",
      "Grade calculator and GPA tracker",
      "Flashcard system for active recall",
      "Study group collaboration features",
      "Assignment submission reminders",
      "Analytics dashboard with productivity insights",
      "Mobile app for iOS and Android",
      "Integration with Google Calendar",
      "AI-powered study recommendations",
      "Habit tracking for consistent learning",
    ],
  },

  // ============================================================================
  // FOOTER & BRANDING
  // ============================================================================

  footer: {
    copyright: `© ${new Date().getFullYear()} TRUPATH. All rights reserved.`,
    attribution: "Created by Trushi Patel",
    placement: "Bottom of every page",
    style: "Minimalistic with muted text colors",
  },

  // ============================================================================
  // CALL TO ACTION
  // ============================================================================

  callToAction: `
    TRUPATH isn't just a productivity app - it's your personal achievement tracking 
    system that grows with you, celebrates your wins, and helps you stay true to 
    your unique path toward success. Whether you're managing daily assignments, 
    tracking long-term projects, or celebrating course completions, TRUPATH provides 
    the structure and motivation you need to thrive academically.
    
    Start your journey today. Track your path. Achieve your goals. Stay true to yourself.
  `,
}

export default TRUPATH_DESCRIPTION
