'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface DateTimePickerProps {
  label: string;
  value: string;
  onChange: (isoValue: string) => void;
  required?: boolean;
  minDate?: Date | string;
}

export default function DateTimePicker({
  label,
  value,
  onChange,
  required = true,
  minDate,
}: DateTimePickerProps) {
  const parseDate = (val: string): Date => {
    const d = val ? new Date(val) : new Date();
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const initialDate = parseDate(value);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth());
  const [selectedHour, setSelectedHour] = useState<number>(initialDate.getHours());
  const [selectedMinute, setSelectedMinute] = useState<number>(
    Math.floor(initialDate.getMinutes() / 15) * 15
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const minDateObj = minDate ? new Date(minDate) : null;

  useEffect(() => {
    if (value) {
      const d = parseDate(value);
      setSelectedDate(d);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
      setSelectedHour(d.getHours());
      setSelectedMinute(Math.floor(d.getMinutes() / 15) * 15);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const emitDateTime = (dateObj: Date, hour: number, minute: number) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const h = String(hour).padStart(2, '0');
    const m = String(minute).padStart(2, '0');

    const formatted = `${year}-${month}-${day}T${h}:${m}:00`;
    onChange(formatted);
  };

  const handleSelectDay = (day: number) => {
    const newDate = new Date(viewYear, viewMonth, day, selectedHour, selectedMinute);
    if (minDateObj) {
      const dayStart = new Date(viewYear, viewMonth, day, 23, 59, 59);
      if (dayStart < minDateObj) return; // Prevent selecting past days
    }
    setSelectedDate(newDate);
    emitDateTime(newDate, selectedHour, selectedMinute);
  };

  const handleTimeChange = (hour: number, minute: number) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    const newDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      hour,
      minute
    );
    setSelectedDate(newDate);
    emitDateTime(newDate, hour, minute);
  };

  const handleQuickPreset = (offsetDays: number, defaultHour: number = 10) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    d.setHours(defaultHour, 0, 0, 0);
    setSelectedDate(d);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setSelectedHour(defaultHour);
    setSelectedMinute(0);
    emitDateTime(d, defaultHour, 0);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();

  const formattedDisplay = selectedDate ? (
    selectedDate.toLocaleString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  ) : 'Select date & time';

  return (
    <div className="relative space-y-1.5" ref={dropdownRef}>
      <div className="flex justify-between items-center">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>{isOpen ? 'Close Calendar' : 'Open Calendar'}</span>
        </button>
      </div>

      {/* Input Box Trigger */}
      <div
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between bg-slate-950 border border-slate-700 hover:border-indigo-500 rounded-2xl py-2.5 px-4 cursor-pointer transition-all shadow-md group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white font-mono">{formattedDisplay}</p>
            <p className="text-[10px] text-slate-500 font-medium">Click to select date from calendar</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-indigo-300 font-mono">
          {isOpen ? 'SELECTING...' : 'PICK DATE'}
        </span>
      </div>

      {/* Popover Calendar Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full max-w-sm sm:w-96 rounded-3xl bg-slate-900 border border-indigo-500/30 p-5 shadow-2xl space-y-4 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Quick Presets */}
          <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-800 text-[11px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase w-full">Quick Select:</span>
            <button
              type="button"
              onClick={() => handleQuickPreset(0, Math.max(new Date().getHours() + 1, 10))}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-800 transition font-medium"
            >
              Today Later
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset(1, 10)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-800 transition font-medium"
            >
              Tomorrow 10 AM
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset(7, 18)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-800 transition font-medium"
            >
              Next Week 6 PM
            </button>
          </div>

          {/* Month Header Navigation */}
          <div className="flex items-center justify-between px-1">
            <h4 className="text-sm font-black text-white flex items-center gap-1.5">
              <span>{monthNames[viewMonth]}</span>
              <span className="text-indigo-400 font-mono">{viewYear}</span>
            </h4>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days Grid */}
          <div className="space-y-1">
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500 uppercase">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8 w-full" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateAtDay = new Date(viewYear, viewMonth, dayNum, 23, 59, 59);
                const isPast = minDateObj ? dateAtDay < minDateObj : false;

                const isSelected =
                  selectedDate.getDate() === dayNum &&
                  selectedDate.getMonth() === viewMonth &&
                  selectedDate.getFullYear() === viewYear;

                const isToday =
                  new Date().getDate() === dayNum &&
                  new Date().getMonth() === viewMonth &&
                  new Date().getFullYear() === viewYear;

                return (
                  <button
                    key={`day-${dayNum}`}
                    type="button"
                    disabled={isPast}
                    onClick={() => handleSelectDay(dayNum)}
                    className={`h-8 w-full rounded-xl text-xs font-bold font-mono transition flex items-center justify-center ${
                      isPast
                        ? 'opacity-30 cursor-not-allowed text-slate-600 line-through'
                        : isSelected
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 ring-2 ring-indigo-400'
                        : isToday
                        ? 'bg-indigo-950/60 border border-indigo-500/50 text-indigo-300 hover:bg-indigo-900'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Picker Bar */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Event Time:</span>
              </span>
              <span className="text-xs font-mono font-bold text-indigo-300">
                {String(selectedHour % 12 || 12).padStart(2, '0')}:
                {String(selectedMinute).padStart(2, '0')} {selectedHour >= 12 ? 'PM' : 'AM'}
              </span>
            </div>

            {/* Quick Time Pills */}
            <div className="flex flex-wrap gap-1 text-[10px] font-mono">
              {[
                { label: '09:00 AM', h: 9, m: 0 },
                { label: '10:00 AM', h: 10, m: 0 },
                { label: '02:00 PM', h: 14, m: 0 },
                { label: '06:00 PM', h: 18, m: 0 },
                { label: '08:00 PM', h: 20, m: 0 },
              ].map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => handleTimeChange(t.h, t.m)}
                  className={`px-2 py-1 rounded-lg border transition font-bold ${
                    selectedHour === t.h && selectedMinute === t.m
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Manual Hour/Minute selects */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div>
                <label className="text-[9px] text-slate-500 font-bold uppercase block mb-0.5">Hour</label>
                <select
                  value={selectedHour}
                  onChange={(e) => handleTimeChange(Number(e.target.value), selectedMinute)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-1 px-2 text-xs text-white font-mono"
                >
                  {Array.from({ length: 24 }).map((_, h) => (
                    <option key={h} value={h}>
                      {String(h % 12 || 12).padStart(2, '0')} {h >= 12 ? 'PM' : 'AM'} ({String(h).padStart(2, '0')}:00)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] text-slate-500 font-bold uppercase block mb-0.5">Minute</label>
                <select
                  value={selectedMinute}
                  onChange={(e) => handleTimeChange(selectedHour, Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-1 px-2 text-xs text-white font-mono"
                >
                  {[0, 15, 30, 45].map((m) => (
                    <option key={m} value={m}>
                      :{String(m).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md shadow-emerald-600/30"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Done</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}