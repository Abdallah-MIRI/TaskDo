import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  CheckCircle2,
  Calendar,
  Trash2,
  Edit2,
  Layers,
  List as ListIcon,
  Kanban,
  AlertTriangle,
  Folder,
  Tag,
} from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { useStorage } from '../../storage/storage-context';
import { useToast } from '../ui/ToastProvider';
import { filterTasks, sortTasks, isTaskOverdue, isTaskDueToday } from '../../domain/task-rules';
import { Task, TaskPriority, TaskStatus, TaskSortOption, Project } from '../../types';

interface TasksViewProps {
  onOpenNewTask: (defaultDueDate?: string) => void;
  onOpenEditTask: (task: Task) => void;
  onConfirmDeleteTask: (task: Task) => void;
}

export function TasksView({
  onOpenNewTask,
  onOpenEditTask,
  onConfirmDeleteTask,
}: TasksViewProps) {
  const { t, formatDate, formatNumber } = useI18n();
  const { tasks, projects, toggleTaskComplete, updateTask } = useStorage();
  const { showToast } = useToast();

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [projectFilter, setProjectFilter] = useState<string | 'all'>('all');
  const [dueRangeFilter, setDueRangeFilter] = useState<'all' | 'today' | 'upcoming' | 'overdue'>('all');
  const [sortOption, setSortOption] = useState<TaskSortOption>('priority_desc');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

  // Filter & Sort
  const processedTasks = useMemo(() => {
    const filtered = filterTasks(tasks, {
      searchQuery,
      status: statusFilter,
      priority: priorityFilter,
      projectId: projectFilter,
      dueRange: dueRangeFilter,
    });
    return sortTasks(filtered, sortOption);
  }, [tasks, searchQuery, statusFilter, priorityFilter, projectFilter, dueRangeFilter, sortOption]);

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

  const handleMoveStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTask(taskId, {
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
      });
      showToast(t('toastTaskUpdated'), 'success');
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const getPriorityBadge = (p: TaskPriority) => {
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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#264653]">
            {t('tasksPageTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-[#62727b] mt-0.5">
            {t('tasksPageSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-white text-[#264653] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title={t('viewModeList')}
            >
              <ListIcon className="w-4 h-4" />
              <span className="hidden md:inline">{t('viewModeList')}</span>
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'board'
                  ? 'bg-white text-[#264653] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title={t('viewModeBoard')}
            >
              <Kanban className="w-4 h-4" />
              <span className="hidden md:inline">{t('viewModeBoard')}</span>
            </button>
          </div>

          <button
            onClick={() => onOpenNewTask()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2a9d8f] hover:bg-[#238277] text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-3" />
            <span>{t('quickAddTask')}</span>
          </button>
        </div>
      </div>

      {/* 2. Search, Status Tabs & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5e9ec] space-y-3">
        {/* Search & Status Tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full ps-9 pe-4 py-2 text-xs sm:text-sm bg-[#f7f9f9] border border-gray-200 rounded-xl focus:border-[#2a9d8f] focus:bg-white outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: t('filterAll') },
              { id: 'todo', label: t('filterTodo') },
              { id: 'in_progress', label: t('filterInProgress') },
              { id: 'completed', label: t('filterCompleted') },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-[#264653] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Row: Priority, Project, Due Range, Sort */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100">
          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs bg-[#f7f9f9] border border-gray-200 rounded-xl focus:border-[#2a9d8f] outline-none"
          >
            <option value="all">{t('filterPriorityAll')}</option>
            <option value="urgent">{t('taskPriorityUrgent')}</option>
            <option value="high">{t('taskPriorityHigh')}</option>
            <option value="medium">{t('taskPriorityMedium')}</option>
            <option value="low">{t('taskPriorityLow')}</option>
          </select>

          {/* Project */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-[#f7f9f9] border border-gray-200 rounded-xl focus:border-[#2a9d8f] outline-none"
          >
            <option value="all">{t('filterProjectAll')}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Due Range */}
          <select
            value={dueRangeFilter}
            onChange={(e) => setDueRangeFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs bg-[#f7f9f9] border border-gray-200 rounded-xl focus:border-[#2a9d8f] outline-none"
          >
            <option value="all">{t('filterDueAll')}</option>
            <option value="today">{t('filterDueToday')}</option>
            <option value="upcoming">{t('filterDueUpcoming')}</option>
            <option value="overdue">{t('filterDueOverdue')}</option>
          </select>

          {/* Sort */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs bg-[#f7f9f9] border border-gray-200 rounded-xl focus:border-[#2a9d8f] outline-none"
          >
            <option value="priority_desc">{t('sortPriorityDesc')}</option>
            <option value="dueDate_asc">{t('sortDueDateAsc')}</option>
            <option value="dueDate_desc">{t('sortDueDateDesc')}</option>
            <option value="title_asc">{t('sortTitleAsc')}</option>
            <option value="createdAt_desc">{t('sortCreatedAtDesc')}</option>
          </select>
        </div>
      </div>

      {/* 3. Task Display Area: List View OR Board View */}
      {processedTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center space-y-3">
          <Layers className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-[#264653]">لا توجد مهام مطابقة للشروط</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            جرب تعديل خيارات البحث والتصفية أو أضف مهمة جديدة الآن.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setPriorityFilter('all');
              setProjectFilter('all');
              setDueRangeFilter('all');
            }}
            className="text-xs font-bold text-[#2a9d8f] hover:underline"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* LIST VIEW */
        <div className="bg-white rounded-2xl border border-[#e5e9ec] divide-y divide-gray-100 overflow-hidden">
          {processedTasks.map((task) => {
            const project = projects.find((p) => p.id === task.projectId);
            const isCompleted = task.status === 'completed';
            const isOverdue = isTaskOverdue(task);
            const isToday = isTaskDueToday(task);

            return (
              <div
                key={task.id}
                className={`flex items-center gap-3.5 p-4 transition-colors hover:bg-[#f7f9f9] ${
                  isCompleted ? 'bg-gray-50/40 opacity-60' : ''
                }`}
              >
                {/* Complete checkbox */}
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

                {/* Task Details */}
                <div
                  onClick={() => onOpenEditTask(task)}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-sm font-bold text-[#1d2d35] truncate ${
                        isCompleted ? 'line-through text-gray-400' : ''
                      }`}
                    >
                      {task.title}
                    </h4>
                  </div>
                  {task.description && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {task.description}
                    </p>
                  )}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Project Tag */}
                {project && (
                  <span
                    style={{ backgroundColor: `${project.color}15`, color: project.color }}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-md truncate max-w-[120px] hidden sm:inline shrink-0"
                  >
                    {project.name}
                  </span>
                )}

                {/* Due Date Indicator */}
                {task.dueDate && (
                  <div
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg shrink-0 ${
                      isOverdue
                        ? 'bg-[#e76f51]/15 text-[#e76f51]'
                        : isToday
                        ? 'bg-[#f4a261]/15 text-[#d07429]'
                        : 'text-gray-500 bg-gray-50'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(task.dueDate, { month: 'numeric', day: 'numeric' })}</span>
                  </div>
                )}

                {/* Priority */}
                <div className="shrink-0">{getPriorityBadge(task.priority)}</div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onOpenEditTask(task)}
                    aria-label={t('edit')}
                    className="p-1.5 text-gray-400 hover:text-[#264653] hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onConfirmDeleteTask(task)}
                    aria-label={t('delete')}
                    className="p-1.5 text-gray-400 hover:text-[#e76f51] hover:bg-[#e76f51]/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* BOARD / KANBAN VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {[
            { id: 'todo' as TaskStatus, label: t('taskStatusTodo'), count: processedTasks.filter(t => t.status === 'todo').length },
            { id: 'in_progress' as TaskStatus, label: t('taskStatusInProgress'), count: processedTasks.filter(t => t.status === 'in_progress').length },
            { id: 'completed' as TaskStatus, label: t('taskStatusCompleted'), count: processedTasks.filter(t => t.status === 'completed').length },
          ].map((col) => {
            const colTasks = processedTasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="bg-gray-100/70 p-4 rounded-2xl border border-gray-200/80 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#264653]">
                    {col.label}
                  </h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-gray-700 shadow-xs">
                    {formatNumber(col.count)}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {colTasks.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
                      لا توجد مهام هنا
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const project = projects.find((p) => p.id === task.projectId);
                      return (
                        <div
                          key={task.id}
                          className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs hover:border-[#2a9d8f] transition-all space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4
                              onClick={() => onOpenEditTask(task)}
                              className="text-xs font-bold text-[#1d2d35] cursor-pointer hover:text-[#2a9d8f] transition-colors leading-snug"
                            >
                              {task.title}
                            </h4>
                            <div className="shrink-0">{getPriorityBadge(task.priority)}</div>
                          </div>

                          {task.description && (
                            <p className="text-[11px] text-gray-500 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px]">
                            {project ? (
                              <span
                                style={{ color: project.color }}
                                className="font-semibold truncate max-w-[100px]"
                              >
                                {project.name}
                              </span>
                            ) : (
                              <span className="text-gray-400">--</span>
                            )}

                            {task.dueDate && (
                              <span className="text-gray-500 font-medium">
                                {formatDate(task.dueDate, { month: 'numeric', day: 'numeric' })}
                              </span>
                            )}
                          </div>

                          {/* Quick move buttons */}
                          <div className="flex items-center justify-end gap-1.5 pt-1 text-[10px]">
                            {col.id !== 'todo' && (
                              <button
                                onClick={() => handleMoveStatus(task.id, 'todo')}
                                className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
                              >
                                {t('taskStatusTodo')}
                              </button>
                            )}
                            {col.id !== 'in_progress' && (
                              <button
                                onClick={() => handleMoveStatus(task.id, 'in_progress')}
                                className="px-2 py-0.5 bg-[#f4a261]/15 hover:bg-[#f4a261]/25 text-[#d07429] rounded-md"
                              >
                                {t('taskStatusInProgress')}
                              </button>
                            )}
                            {col.id !== 'completed' && (
                              <button
                                onClick={() => handleMoveStatus(task.id, 'completed')}
                                className="px-2 py-0.5 bg-[#2a9d8f]/15 hover:bg-[#2a9d8f]/25 text-[#2a9d8f] rounded-md"
                              >
                                {t('taskStatusCompleted')}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
