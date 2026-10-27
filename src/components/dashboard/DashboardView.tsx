import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Folder,
  Plus,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { useStorage } from '../../storage/storage-context';
import { useToast } from '../ui/ToastProvider';
import { calculateDashboardStats, calculateProjectStats, isTaskDueToday, isTaskOverdue, isTaskDueUpcoming } from '../../domain/task-rules';
import { Task, Project } from '../../types';
import { ActiveNavPage } from '../layout/Sidebar';
import { TaskStatistics } from './TaskStatistics';

interface DashboardViewProps {
  onNavigate: (page: ActiveNavPage) => void;
  onOpenNewTask: (defaultDueDate?: string) => void;
  onOpenEditTask: (task: Task) => void;
  onOpenNewProject: () => void;
}

export function DashboardView({
  onNavigate,
  onOpenNewTask,
  onOpenEditTask,
  onOpenNewProject,
}: DashboardViewProps) {
  const { t, language, direction, formatDate, formatNumber } = useI18n();
  const { tasks, projects, toggleTaskComplete, createTask } = useStorage();
  const { showToast } = useToast();

  const [quickTitle, setQuickTitle] = useState('');
  const [isQuickSubmitting, setIsQuickSubmitting] = useState(false);

  const stats = calculateDashboardStats(tasks);
  const projectsWithStats = calculateProjectStats(projects, tasks);

  const todayTasks = tasks.filter((task) => isTaskDueToday(task));
  const upcomingTasks = tasks
    .filter((task) => isTaskDueUpcoming(task, 7))
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));

  const handleToggle = async (task: Task) => {
    try {
      const updated = await toggleTaskComplete(task.id);
      if (updated.status === 'completed') {
        showToast(t('toastTaskCompleted'), 'success');
      } else {
        showToast(t('toastTaskIncomplete'), 'info');
      }
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    setIsQuickSubmitting(true);
    try {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      await createTask({
        title: quickTitle.trim(),
        status: 'todo',
        priority: 'medium',
        dueDate: todayStr,
      });
      setQuickTitle('');
      showToast(t('toastTaskCreated'), 'success');
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setIsQuickSubmitting(false);
    }
  };

  const getPriorityBadge = (p: Task['priority']) => {
    switch (p) {
      case 'urgent':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#e76f51]/10 text-[#e76f51] border border-[#e76f51]/20">{t('taskPriorityUrgent')}</span>;
      case 'high':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#f4a261]/15 text-[#d07429] border border-[#f4a261]/30">{t('taskPriorityHigh')}</span>;
      case 'medium':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#e9c46a]/20 text-[#b78917] border border-[#e9c46a]/40">{t('taskPriorityMedium')}</span>;
      case 'low':
      default:
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#2a9d8f]/10 text-[#2a9d8f] border border-[#2a9d8f]/20">{t('taskPriorityLow')}</span>;
    }
  };

  const ArrowNav = direction === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Welcoming Hero Banner */}
      <section className="bg-gradient-to-r from-[#264653] to-[#2a9d8f] rounded-3xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#e9c46a] mb-2">
            <Sparkles className="w-4 h-4" />
            <span>{formatDate(new Date().toISOString(), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('greetingMorning')}!
          </h2>
          <p className="text-sm sm:text-base text-white/85 mt-2 leading-relaxed">
            {t('dashboardSubtitle')}
          </p>

          {/* Quick inline Task Adder */}
          <form onSubmit={handleQuickAdd} className="mt-6 flex items-center gap-2 max-w-lg">
            <div className="relative flex-1">
              <input
                type="text"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder={t('quickInlineAddPlaceholder')}
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md text-white placeholder:text-white/60 border border-white/20 text-sm focus:outline-none focus:bg-white/20 focus:border-white transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isQuickSubmitting || !quickTitle.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#e9c46a] hover:bg-[#deb453] text-[#264653] font-bold text-sm shadow-xs transition-all disabled:opacity-50 shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-3" />
              <span className="hidden sm:inline">{t('quickAddTask')}</span>
            </button>
          </form>
        </div>

        {/* Subtle decorative circles in corner */}
        <div className="absolute -top-12 -end-12 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-8 -end-8 w-40 h-40 rounded-full bg-[#e9c46a]/10 pointer-events-none" />
      </section>

      {/* 2. Key Metrics Bar (Open layout without repetitive card frames) */}
      <section aria-label="Key Metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 bg-white p-5 sm:p-6 rounded-2xl border border-[#e5e9ec]">
        {/* Total & Pending */}
        <div className="border-e border-gray-100 last:border-e-0 pe-4">
          <span className="text-xs font-semibold text-[#62727b] block mb-1">
            {t('statPending')}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#264653]">
              {formatNumber(stats.pendingTasks)}
            </span>
            <span className="text-xs text-gray-400">/ {formatNumber(stats.totalTasks)}</span>
          </div>
        </div>

        {/* Due Today */}
        <div className="border-e border-gray-100 last:border-e-0 pe-4">
          <span className="text-xs font-semibold text-[#62727b] block mb-1">
            {t('statDueToday')}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#2a9d8f]">
              {formatNumber(stats.dueTodayTasks)}
            </span>
            {stats.dueTodayTasks > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#2a9d8f] animate-pulse" />
            )}
          </div>
        </div>

        {/* Overdue */}
        <div className="border-e border-gray-100 last:border-e-0 pe-4">
          <span className="text-xs font-semibold text-[#62727b] block mb-1">
            {t('statOverdue')}
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold ${stats.overdueTasks > 0 ? 'text-[#e76f51]' : 'text-gray-400'}`}>
              {formatNumber(stats.overdueTasks)}
            </span>
            {stats.overdueTasks > 0 && (
              <AlertCircle className="w-4 h-4 text-[#e76f51]" />
            )}
          </div>
        </div>

        {/* Completion Progress */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-[#62727b]">
              {t('statCompletionRate')}
            </span>
            <span className="text-xs font-bold text-[#2a9d8f]">
              {formatNumber(stats.completionRate)}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden mt-2">
            <div
              className="bg-[#2a9d8f] h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>
      </section>

      {/* Interactive Recharts Task Statistics & Distributions */}
      <TaskStatistics tasks={tasks} projects={projects} />

      {/* 3. Open Asymmetric Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Today's Tasks */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#264653]">
                {t('sectionTodayTasks')}
              </h3>
              <p className="text-xs text-[#62727b]">
                {todayTasks.length > 0 
                  ? `${formatNumber(todayTasks.length)} ${t('tasksPageTitle')}`
                  : t('noTasksToday')}
              </p>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="flex items-center gap-1 text-xs font-bold text-[#2a9d8f] hover:underline"
            >
              <span>{t('filterAll')}</span>
              <ArrowNav className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Today Tasks List (Horizontal rows with clear visual feedback) */}
          {todayTasks.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-gray-200 text-center bg-white space-y-3">
              <CheckCircle2 className="w-10 h-10 text-[#2a9d8f] mx-auto opacity-70" />
              <p className="text-sm font-semibold text-[#264653]">{t('noTasksToday')}</p>
              <button
                onClick={() => onOpenNewTask()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#264653] hover:bg-[#1d353f] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('createFirstTaskCta')}
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#e5e9ec] divide-y divide-gray-100 overflow-hidden">
              {todayTasks.map((task) => {
                const project = projects.find((p) => p.id === task.projectId);
                const isCompleted = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3.5 p-4 transition-colors hover:bg-gray-50/80 ${
                      isCompleted ? 'bg-gray-50/50 opacity-60' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggle(task)}
                      aria-label={isCompleted ? t('taskActionIncomplete') : t('taskActionComplete')}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                        isCompleted
                          ? 'bg-[#2a9d8f] border-[#2a9d8f] text-white'
                          : 'border-gray-300 hover:border-[#2a9d8f] bg-white'
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    {/* Task Content */}
                    <div
                      onClick={() => onOpenEditTask(task)}
                      className="flex-1 min-w-0 cursor-pointer"
                    >
                      <h4
                        className={`text-sm font-bold text-[#1d2d35] truncate ${
                          isCompleted ? 'line-through text-gray-400' : ''
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Project & Priority Badges */}
                    <div className="flex items-center gap-2 shrink-0">
                      {project && (
                        <span
                          style={{ backgroundColor: `${project.color}15`, color: project.color }}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-md truncate max-w-[100px] hidden sm:inline"
                        >
                          {project.name}
                        </span>
                      )}
                      {getPriorityBadge(task.priority)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Projects progress & Upcoming deadlines */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Projects Progress */}
          <div className="bg-white p-5 rounded-2xl border border-[#e5e9ec] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#264653] flex items-center gap-2">
                <Folder className="w-4 h-4 text-[#2a9d8f]" />
                {t('sectionProjectsProgress')}
              </h3>
              <button
                onClick={() => onNavigate('projects')}
                className="text-xs font-bold text-[#2a9d8f] hover:underline"
              >
                {t('filterAll')}
              </button>
            </div>

            {projectsWithStats.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500">
                <p>{t('noActiveProjects')}</p>
                <button
                  onClick={onOpenNewProject}
                  className="mt-2 text-[#2a9d8f] font-bold hover:underline"
                >
                  {t('createFirstProjectCta')}
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {projectsWithStats.slice(0, 3).map((proj) => (
                  <div key={proj.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#1d2d35] flex items-center gap-1.5 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: proj.color }} />
                        <span className="truncate">{proj.name}</span>
                      </span>
                      <span className="text-gray-500 font-medium shrink-0">
                        {formatNumber(proj.completedTasks)}/{formatNumber(proj.totalTasks)} ({formatNumber(proj.progressPercentage)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ backgroundColor: proj.color, width: `${proj.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Deadlines Timeline */}
          <div className="bg-white p-5 rounded-2xl border border-[#e5e9ec] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#264653] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#f4a261]" />
                {t('sectionUpcomingDeadlines')}
              </h3>
              <button
                onClick={() => onNavigate('calendar')}
                className="text-xs font-bold text-[#2a9d8f] hover:underline"
              >
                {t('navCalendar')}
              </button>
            </div>

            {upcomingTasks.length === 0 ? (
              <p className="text-xs text-gray-500 py-3 text-center">
                {t('noUpcomingTasks')}
              </p>
            ) : (
              <div className="space-y-2.5">
                {upcomingTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onOpenEditTask(task)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-all text-xs"
                  >
                    <div className="min-w-0 flex-1 pe-2">
                      <p className="font-bold text-[#1d2d35] truncate">{task.title}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-[#2a9d8f]" />
                      <span>{formatDate(task.dueDate, { month: 'numeric', day: 'numeric' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
