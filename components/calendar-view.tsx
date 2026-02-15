"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { CalendarEvent } from "@/lib/types"

interface CalendarViewProps {
  events: CalendarEvent[]
  onDateClick?: (date: Date) => void
}

export function CalendarView({ events, onDateClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startDate = new Date(firstDayOfMonth)
  startDate.setDate(startDate.getDate() - startDate.getDay())

  const days = []
  const current = new Date(startDate)

  while (current <= lastDayOfMonth || current.getDay() !== 0) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  function previousMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  function getEventsForDate(date: Date) {
    return events.filter((event) => {
      const eventDate = new Date(event.event_date)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  function isToday(date: Date) {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  function isCurrentMonth(date: Date) {
    return date.getMonth() === month
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const typeColors = {
    meeting: "bg-blue-500",
    event: "bg-purple-500",
    deadline: "bg-red-500",
    reminder: "bg-amber-500",
  }

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {monthNames[month]} {year}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}

        {days.map((date, index) => {
          const dayEvents = getEventsForDate(date)
          const isCurrentMonthDay = isCurrentMonth(date)
          const isTodayDate = isToday(date)

          return (
            <button
              key={index}
              onClick={() => onDateClick?.(date)}
              className={`min-h-[80px] rounded-lg border p-2 text-left transition-colors hover:bg-muted ${
                !isCurrentMonthDay ? "bg-muted/30 opacity-40" : ""
              } ${isTodayDate ? "border-primary bg-primary/5" : ""}`}
            >
              <div
                className={`mb-1 text-sm font-medium ${
                  isTodayDate ? "text-primary" : isCurrentMonthDay ? "" : "text-muted-foreground"
                }`}
              >
                {date.getDate()}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className={`truncate rounded px-1 py-0.5 text-xs text-white ${typeColors[event.event_type]}`}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-muted-foreground">+{dayEvents.length - 2} more</div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
