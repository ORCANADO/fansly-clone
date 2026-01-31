"use client";

import { useState, useEffect } from "react";
import {
  format,
  addDays,
  addHours,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  getDay,
  parse,
  isValid
} from "date-fns";
import { ChevronUp, ChevronDown, Calendar, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function DateTimePicker({
  value,
  onChange,
  isOpen,
  onClose,
  title = "Select Date and Time"
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(value);
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(value));
  const [hour, setHour] = useState<string>(format(value, "HH"));
  const [minute, setMinute] = useState<string>(format(value, "mm"));
  const [is24Hour, setIs24Hour] = useState<boolean>(true);

  // Update internal state when value prop changes
  useEffect(() => {
    setSelectedDate(value);
    setCurrentMonth(startOfMonth(value));
    setHour(format(value, "HH"));
    setMinute(format(value, "mm"));
  }, [value]);

  // Generate calendar days for the current month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Day names for header
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Navigation
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(parseInt(hour, 10), parseInt(minute, 10));
    setSelectedDate(newDate);
  };

  // Handle time change
  const handleTimeChange = (type: "hour" | "minute", value: string) => {
    if (type === "hour") {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 0 || num > 23) return;
      setHour(value.padStart(2, "0"));
    } else {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 0 || num > 59) return;
      setMinute(value.padStart(2, "0"));
    }

    const newDate = new Date(selectedDate);
    if (type === "hour") {
      newDate.setHours(parseInt(value, 10));
    } else {
      newDate.setMinutes(parseInt(value, 10));
    }
    setSelectedDate(newDate);
  };

  // Toggle 12/24 hour format
  const toggleHourFormat = () => {
    setIs24Hour(!is24Hour);
  };

  // Quick select functions
  const quickSelect = (hours: number) => {
    const newDate = addHours(new Date(), hours);
    setSelectedDate(newDate);
    setCurrentMonth(startOfMonth(newDate));
    setHour(format(newDate, "HH"));
    setMinute(format(newDate, "mm"));
  };

  // Select current date/time
  const selectCurrent = () => {
    const now = new Date();
    setSelectedDate(now);
    setCurrentMonth(startOfMonth(now));
    setHour(format(now, "HH"));
    setMinute(format(now, "mm"));
  };

  // Confirm selection
  const handleConfirm = () => {
    onChange(selectedDate);
    onClose();
  };

  // Format time for display
  const formatTimeDisplay = () => {
    const date = new Date(selectedDate);
    date.setHours(parseInt(hour, 10), parseInt(minute, 10));

    if (is24Hour) {
      return format(date, "HH:mm");
    } else {
      return format(date, "hh:mm a");
    }
  };

  // Format selected date for display
  const formattedSelectedDate = format(selectedDate, "EEEE, MMM d, yyyy 'at' hh:mm a");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#16161A] border-none text-[#D6DCE8] max-w-[420px] max-h-[90vh] overflow-y-auto p-0 overflow-x-hidden shadow-2xl rounded-2xl scrollbar-hide focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0">
        <DialogHeader className="px-4 pt-[14px] pb-1">
          <div className="flex justify-between items-center relative pl-1">
            <div className="flex-1 text-left">
              <DialogTitle className="text-[15px] font-bold text-[#D6DCE8] tracking-tight">
                {title}
              </DialogTitle>
            </div>
          </div>

          {/* Current selection display */}
          <div className="mt-1 flex items-center gap-1 text-[#637395] font-semibold text-[13px] pl-1">
            <div
              className="w-[15px] h-[15px] bg-current opacity-80 ml-1"
              style={{
                maskImage: 'url(/icons/calendar.svg)',
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                WebkitMaskImage: 'url(/icons/calendar.svg)',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat'
              }}
            />
            <span>{formattedSelectedDate}</span>
          </div>
        </DialogHeader>

        <div className="px-6 pb-3 space-y-3 mt-[-9px]">
          {/* Calendar section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center relative py-0 pl-0">
              <span className="text-[14px] font-bold text-[#D6DCE8]">
                {format(currentMonth, "MMMM yyyy")}
              </span>
              <div className="flex items-center gap-6 pr-1">
                <button
                  onClick={prevMonth}
                  className="text-[#D6DCE8] hover:text-[#D6DCE8]/80 transition-colors"
                >
                  <ChevronUp className="h-[22px] w-[22px]" strokeWidth={2.5} />
                </button>
                <button
                  onClick={nextMonth}
                  className="text-[#D6DCE8] hover:text-[#D6DCE8]/80 transition-colors"
                >
                  <ChevronDown className="h-[22px] w-[22px]" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-[12px] text-[#D6DCE8] font-bold py-0.5">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                  const isSelected = isSameDay(day, selectedDate);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <button
                      key={day.toString()}
                      onClick={() => handleDateSelect(day)}
                      className={`
                        h-8 w-full rounded text-[10px] font-medium transition-all
                        ${isSelected
                          ? "bg-[#2599f7] text-white"
                          : isToday
                            ? "bg-[#2a3948] text-[#2698F5]"
                            : isCurrentMonth
                              ? "text-[#2698F5] hover:bg-[#2a3948]/70"
                              : "text-[#D6DCE8] hover:bg-[#2a3948]/30"
                        }
                      `}
                    >
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Time and Quick Select section */}
          <div className="space-y-2.5">
            <div className="space-y-[5px]">
              <div className="text-[14.1px] font-bold text-[#F9F9F9] tracking-tight">Select Time</div>

              <div className="flex items-end gap-2">
                {/* HH Input */}
                <div className="relative w-14 h-9 rounded-lg border border-[#2a3948]/40 flex items-center justify-center">
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#16161A] px-1 text-[12px] text-[#2599f7] font-medium tracking-tight whitespace-nowrap">
                    HH
                  </span>
                  <input
                    type="text"
                    value={is24Hour ? hour : (parseInt(hour) % 12 || 12).toString().padStart(2, "0")}
                    onChange={(e) => handleTimeChange("hour", e.target.value)}
                    className="w-full h-full bg-transparent text-[#637395] text-center text-[12.5px] font-medium outline-none rounded-lg focus:bg-[#2a3948]/20 transition-colors"
                    maxLength={2}
                  />
                </div>

                <span className="text-[#637395] font-medium text-xl pb-1">:</span>

                {/* MM Input */}
                <div className="relative w-14 h-9 rounded-lg border border-[#2a3948]/40 flex items-center justify-center">
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#16161A] px-1 text-[12px] text-[#2599f7] font-medium tracking-tight whitespace-nowrap">
                    MM
                  </span>
                  <input
                    type="text"
                    value={minute}
                    onChange={(e) => handleTimeChange("minute", e.target.value)}
                    className="w-full h-full bg-transparent text-[#637395] text-center text-[12.5px] font-medium outline-none rounded-lg focus:bg-[#2a3948]/20 transition-colors"
                    maxLength={2}
                  />
                </div>

                {/* Format Toggle */}
                <div className="relative w-18 h-9 rounded-lg border border-[#2a3948]/40 flex items-center justify-center">
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#16161A] px-1 text-[12px] text-[#2599f7] font-medium tracking-tight whitespace-nowrap">
                    Format
                  </span>
                  <button
                    onClick={toggleHourFormat}
                    className="w-full h-full flex items-center justify-start pl-3 text-[12.5px] font-medium text-[#637395] hover:text-[#2599f7] transition-colors rounded-lg focus:bg-[#2a3948]/20"
                  >
                    {is24Hour ? "24H" : "12H"}
                  </button>
                </div>
              </div>

              <button
                onClick={selectCurrent}
                className="w-full h-5 flex items-center justify-center bg-[#2599f7] text-white text-[11.8px] font-medium rounded-lg hover:bg-[#1a8cd8] transition-all active:scale-[0.98]"
              >
                Select Current Time and Date
              </button>
            </div>

            <div className="space-y-1">
              <div className="text-[14.1px] font-bold text-[#F9F9F9] tracking-tight">Quick Select</div>
              <div className="flex flex-wrap gap-1">
                {/* Hourly Quick Selects */}
                <div className="flex flex-wrap gap-1.5 w-full">
                  {[-24, -12, -1, 1, 12, 24].map((hours) => (
                    <button
                      key={hours}
                      onClick={() => quickSelect(hours)}
                      className="px-2 py-0.5 text-[11.5px] font-medium bg-[#1A1E26] rounded-md text-[#637395] hover:bg-[#2a3948] hover:text-[#2599f7] transition-all"
                    >
                      {hours > 0 ? `+${hours}h` : `${hours}h`}
                    </button>
                  ))}
                </div>
                {/* Daily Quick Selects */}
                <div className="flex flex-wrap gap-1.5 w-full">
                  {[-30, -14, -7, +7, +14, +30].map((daysCount) => (
                    <button
                      key={daysCount}
                      onClick={() => quickSelect(daysCount * 24)}
                      className="px-2 py-0.5 text-[11.5px] font-medium bg-[#1A1E26] rounded-md text-[#637395] hover:bg-[#2a3948] hover:text-[#2599f7] transition-all"
                    >
                      {daysCount > 0 ? `+${daysCount}d` : `${daysCount}d`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1 pt-[3px]">
              <div className="text-[14.1px] font-bold text-[#F9F9F9] tracking-tight">Time Zone</div>
              <div className="text-[13.9px] font-medium text-[#637395] flex items-center gap-2">
                America/Bogota
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex gap-2 pt-0 -mt-[6px] justify-end">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-[11px] font-normal text-[#D6DCE8] bg-[#1A1E26] border-2 border-[#343D52] h-[28px] px-5 rounded-lg hover:bg-[#2a3948] transition-all"
            >
              Dismiss
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-[#2599f7] hover:bg-[#1a8cd8] text-white text-[11px] font-semibold h-[28px] px-6 shadow-lg shadow-blue-500/20 rounded-lg transition-all active:scale-[0.97]"
            >
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}