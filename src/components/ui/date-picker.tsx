
"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import type { SelectSingleEventHandler } from "react-day-picker";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  name: string;
  initialDate?: Date;
  onSelect?: SelectSingleEventHandler;
}

export function DatePicker({ name, initialDate, onSelect }: DatePickerProps) {
  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    setDate(initialDate);
  }, [initialDate]);

  const handleSelect: SelectSingleEventHandler = (day, selectedDay, activeModifiers, e) => {
    setDate(selectedDay);
    if (onSelect) {
      onSelect(day, selectedDay, activeModifiers, e);
    }
    setPopoverOpen(false); // Close popover on date selection
  }

  return (
    <>
      <input type="hidden" name={name} value={date ? format(date, 'yyyy-MM-dd') : ''} />
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </>
  )
}

    