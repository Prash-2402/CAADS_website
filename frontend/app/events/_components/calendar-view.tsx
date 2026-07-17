"use client";

import { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { EventPublic } from "@/types/database";

type CalendarViewProps = {
  events: EventPublic[];
};

export function CalendarView({ events }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const onDateClick = (day: Date) => {
    setSelectedDate(isSameDay(day, selectedDate || 0) ? null : day);
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStarts: 0 }); // Sunday start
  const endDate = endOfWeek(monthEnd, { weekStarts: 0 });

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      
      // Find events for this day
      const dayEvents = events.filter((e) => 
        isSameDay(parseISO(e.date), cloneDay)
      );

      days.push(
        <div
          key={day.toISOString()}
          className={cn(
            "relative min-h-[100px] border border-border-gold/30 p-2 transition-colors cursor-pointer group",
            !isSameMonth(day, monthStart)
              ? "bg-bg-secondary text-muted/30"
              : isSameDay(day, selectedDate || 0)
              ? "bg-gold/10"
              : "hover:bg-bg",
            dayEvents.length > 0 && !isSameDay(day, selectedDate || 0)
              ? "hover:bg-gold/5" 
              : ""
          )}
          onClick={() => onDateClick(cloneDay)}
        >
          <span
            className={cn(
              "font-mono text-sm inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors",
              isSameDay(day, selectedDate || 0)
                ? "bg-gold text-bg font-bold"
                : isSameMonth(day, monthStart)
                ? "text-ivory"
                : "text-transparent"
            )}
          >
            {formattedDate}
          </span>
          
          {dayEvents.length > 0 && (
            <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1">
              {dayEvents.map((evt, idx) => (
                <div 
                  key={evt.id} 
                  className={cn(
                    "text-xs truncate px-1.5 py-0.5 rounded font-body",
                    idx === 0 ? "bg-gold text-bg font-semibold" : "bg-bg text-muted border border-border-gold"
                  )}
                >
                  {evt.title}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-[10px] text-muted text-center">+ {dayEvents.length - 2} more</div>
              )}
            </div>
          )}
        </div>
      );
      day = addDays(day, 1);
    }
    
    // Add row + inline expansion if a date in this row is selected
    const rowDays = [...days]; // copy array
    const hasSelectedInRow = selectedDate && rowDays.some(d => d.key === selectedDate.toISOString());
    
    rows.push(
      <div key={`row-${day.toISOString()}`} className="flex flex-col">
        <div className="grid grid-cols-7">
          {rowDays}
        </div>
        
        {/* Inline Expansion Panel */}
        {hasSelectedInRow && (
          <div className="col-span-7 bg-bg border-y border-gold/30 p-6 shadow-inner animate-fade-in-up">
            <h3 className="font-display text-xl font-bold text-ivory mb-6 flex items-center gap-2">
              <CalendarIcon className="text-gold" size={20} />
              Events on {format(selectedDate, "MMMM d, yyyy")}
            </h3>
            
            {(() => {
              const selectedEvents = events.filter((e) => 
                isSameDay(parseISO(e.date), selectedDate)
              );
              
              if (selectedEvents.length === 0) {
                return <p className="text-muted font-body">No events scheduled for this day.</p>;
              }
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedEvents.map((evt) => (
                    <div key={evt.id} className="bg-bg-secondary border border-border-gold rounded-xl p-5 hover:border-gold transition-colors">
                      <h4 className="font-display font-semibold text-lg text-ivory mb-2 line-clamp-1">{evt.title}</h4>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <Clock size={14} className="text-gold" />
                          <span>{evt.time ? evt.time.substring(0, 5) : "TBD"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <MapPin size={14} className="text-gold" />
                          <span className="truncate">{evt.venue || "TBD"}</span>
                        </div>
                      </div>
                      
                      <p className="font-body text-sm text-muted line-clamp-2 mb-4">
                        {evt.description || "No description provided."}
                      </p>
                      
                      <Link 
                        href={`/events/${evt.id}`}
                        className="inline-flex items-center justify-center w-full px-4 py-2 bg-gold/10 text-gold text-sm font-semibold rounded-lg hover:bg-gold hover:text-bg transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    );
    days = [];
  }

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-6 bg-bg border-b border-border-gold/50">
        <h2 className="font-display text-2xl font-bold text-ivory">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={prevMonth}
            className="p-2 rounded-lg bg-bg-secondary border border-border-gold text-ivory hover:text-gold hover:border-gold transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 rounded-lg bg-bg-secondary border border-border-gold text-ivory hover:text-gold hover:border-gold transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      {/* Days of week */}
      <div className="grid grid-cols-7 bg-bg-secondary border-b border-border-gold/30">
        {daysOfWeek.map((day) => (
          <div key={day} className="py-3 text-center font-mono text-xs font-semibold text-muted uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="flex flex-col">
        {rows}
      </div>
    </div>
  );
}
