"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { Button, Calendar, Input } from "@/shared/ui"
import { useRef } from "react"

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

export function LdaDatepicker() {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(
    new Date("2025-06-01")
  )
  const [month, setMonth] = React.useState<Date | undefined>(date)
  const [value, setValue] = React.useState(formatDate(date))
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  // close on outside click or Escape
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKey)
    }
  }, [])

  return (
    <div className="flex flex-col gap-3">
      <label htmlFor="date" className="px-1 text-sm">
        Subscription Date
      </label>
      <div className="relative flex gap-2" ref={wrapperRef}>
        <Input
          id="date"
          value={value}
          placeholder="June 01, 2025"
          className="bg-background pr-10"
          onChange={(e) => {
            const date = new Date(e.target.value)
            setValue(e.target.value)
            if (isValidDate(date)) {
              setDate(date)
              setMonth(date)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <Button
          id="date-picker"
          variant="ghost"
          className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="lda-datepicker-popover"
        >
          <CalendarIcon className="size-3.5" />
          <span className="sr-only">Select date</span>
        </Button>

        {open && (
          <div
            id="lda-datepicker-popover"
            role="dialog"
            aria-modal="false"
            className="absolute right-0 z-50 mt-2 w-auto overflow-hidden p-0"
            style={{ transform: "translateY(10px)" }}
          >
            <div className="bg-popover rounded-md border shadow-lg">
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                month={month}
                onMonthChange={setMonth}
                onSelect={(date) => {
                  setDate(date)
                  setValue(formatDate(date))
                  setOpen(false)
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
