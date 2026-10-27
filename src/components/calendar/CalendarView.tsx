import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2,
  Clock,
  Flag,
} from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { useStorage } from '../../storage/storage-context';
import { formatDateKey, isTaskOverdue } from '../../domain/task-rules';
import { Task } from '../../types';

interface CalendarViewProps {
  onOpenNewTaskForDate: (dueDate: string) => void;
  onOpenEditTask: (task: Task) => void;
}

export function CalendarView({
  onOpenNewTaskForDate,
  onOpenEditTask,
}: CalendarViewProps) {
  const { t, language, direction, formatDate, formatNumber } = useI18n();
  const { tasks, projects } = useStorage();

  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedDayKey, setSelectedDayKey] = useState<string>(() => formatDateKey(new Date()));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleTodayJump = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDayKey(formatDateKey(today));
  };

  // Calendar day calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Grid cells: 35 or 42 cells
  const calendarCells = [];

  // Previous month padding
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const dateObj = new Date(year, month - 1, d);
    const dateKey = formatDateKey(dateObj);
    calendarCells.push({
      date: d,
      dateKey,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dateKey = formatDateKey(dateObj);
    calendarCells.push({
      date: d,
      dateKey,
      isCurrentMonth: true,
    });
  }

  // Next month padding to round up to full weeks
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const dateObj = new Date(year, month + 1, d);
    const dateKey = formatDateKey(dateObj);
    calendarCells.push({
      date: d,
      dateKey,
      isCurrentMonth: false,
    });
  }

  // Weekday headers
  const weekDays = language === 'ar'
    ? ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Current month display title
  const monthName = new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'long',
    year: 'numeric',
  }).format(currentDate);

  const todayKey = formatDateKey(new Date());

  // Tasks for currently selected day
  const selectedDayTasks = tasks.filter((t) => t.dueDate === selectedDayKey);

  const NavPrevIcon = direction === 'rtl' ? ChevronRight : ChevronLeft;
  const NavNextIcon = direction === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#264653]">
            {t('calendarPageTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-[#62727b] mt-0.5">
            {t('calendarPageSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleTodayJump}
            className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-[#264653] transition-colors"
          >
            {t('calendarToday')}
          </button>

          <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-2 hover:bg-gray-50 text-gray-600 transition-colors"
            >
              <NavPrevIcon className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-[#264653] select-none min-w-[120px] text-center">
              {monthName}
            </span>
            <button
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-2 hover:bg-gray-50 text-gray-600 transition-colors"
            >
              <NavNextIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Calendar Grid & Selected Day Side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Month Calendar Grid (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#e5e9ec] p-4 sm:p-6 shadow-xs overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2 text-center text-xs font-bold text-gray-400">
            {weekDays.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarCells.map((cell, idx) => {
              const dayTasks = tasks.filter((t) => t.dueDate === cell.dateKey);
              const isToday = cell.dateKey === todayKey;
              const isSelected = cell.dateKey === selectedDayKey;

              return (
                <div
                  key={`${cell.dateKey}-${idx}`}
                  onClick={() => setSelectedDayKey(cell.dateKey)}
                  className={`min-h-[75px] sm:min-h-[90px] p-1.5 sm:p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'border-[#2a9d8f] bg-[#2a9d8f]/5 ring-2 ring-[#2a9d8f]/20'
                      : isToday
                      ? 'border-[#264653] bg-gray-50/70'
                      : cell.isCurrentMonth
                      ? 'border-gray-100 hover:border-gray-300 bg-white'
                      : 'border-transparent bg-gray-50/40 opacity-40 hover:opacity-70'
                  }`}
                >
                  {/* Date number & Today dot */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-[#264653] text-white shadow-xs'
                          : isSelected
                          ? 'text-[#2a9d8f]'
                          : cell.isCurrentMonth
                          ? 'text-[#1d2d35]'
                          : 'text-gray-400'
                      }`}
                    >
                      {formatNumber(cell.date)}
                    </span>

                    {/* Quick plus button on hover */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenNewTaskForDate(cell.dateKey);
                      }}
                      title={t('calendarAddForDate')}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded-md hover:bg-gray-200 text-gray-500 transition-opacity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Tasks count / pills in this cell */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEditTask(t);
                        }}
                        className={`text-[10px] px-1.5 py-0.5 rounded-md truncate font-medium border leading-tight ${
                          t.status === 'completed'
                            ? 'bg-gray-100 text-gray-400 border-gray-200 line-through'
                            : t.priority === 'urgent'
                            ? 'bg-[#e76f51]/10 text-[#e76f51] border-[#e76f51]/20'
                            : t.priority === 'high'
                            ? 'bg-[#f4a261]/15 text-[#d07429] border-[#f4a261]/30'
                            : 'bg-[#2a9d8f]/10 text-[#2a9d8f] border-[#2a9d8f]/20'
                        }`}
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <span className="text-[9px] text-gray-400 font-bold block px-1">
                        +{formatNumber(dayTasks.length - 2)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Day Tasks Panel (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-[#e5e9ec] p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                {t('calendarTasksOnDay')}
              </span>
              <h3 className="text-sm font-bold text-[#264653] mt-0.5">
                {formatDate(selectedDayKey, { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
            </div>

            <button
              onClick={() => onOpenNewTaskForDate(selectedDayKey)}
              className="p-1.5 rounded-xl bg-[#2a9d8f] hover:bg-[#238277] text-white transition-colors"
              title={t('calendarAddForDate')}
            >
              <Plus className="w-4 h-4 stroke-3" />
            </button>
          </div>

          {selectedDayTasks.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl space-y-3">
              <CalendarIcon className="w-8 h-8 text-gray-300 mx-auto" />
              <p>{t('calendarNoTasksOnDay')}</p>
              <button
                onClick={() => onOpenNewTaskForDate(selectedDayKey)}
                className="text-[#2a9d8f] font-bold hover:underline"
              >
                {t('calendarAddForDate')}
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {selectedDayTasks.map((task) => {
                const project = projects.find((p) => p.id === task.projectId);
                const isCompleted = task.status === 'completed';
                const isOverdue = isTaskOverdue(task);

                return (
                  <div
                    key={task.id}
                    onClick={() => onOpenEditTask(task)}
                    className="p-3 rounded-2xl border border-gray-100 hover:border-[#2a9d8f] bg-gray-50/60 hover:bg-white transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className={`text-xs font-bold text-[#1d2d35] leading-snug truncate ${
                          isCompleted ? 'line-through text-gray-400' : ''
                        }`}
                      >
                        {task.title}
                      </h4>
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2a9d8f] shrink-0" />
                      ) : isOverdue ? (
                        <span className="w-2 h-2 rounded-full bg-[#e76f51] shrink-0" />
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-500">
                      {project ? (
                        <span style={{ color: project.color }} className="font-semibold truncate max-w-[120px]">
                          {project.name}
                        </span>
                      ) : (
                        <span>--</span>
                      )}
                      <span className="capitalize">{task.priority}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
