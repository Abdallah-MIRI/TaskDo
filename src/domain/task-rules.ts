import { Task, Project, TaskFilterOptions, TaskSortOption, ProjectWithStats, DashboardStats, TaskPriority } from '../types';

export const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Format a Date to YYYY-MM-DD in local time
 */
export function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isTaskDueToday(task: Task, refDate: Date = new Date()): boolean {
  if (!task.dueDate) return false;
  const todayKey = formatDateKey(refDate);
  return task.dueDate === todayKey;
}

export function isTaskOverdue(task: Task, refDate: Date = new Date()): boolean {
  if (!task.dueDate || task.status === 'completed') return false;
  const todayKey = formatDateKey(refDate);
  return task.dueDate < todayKey;
}

export function isTaskDueUpcoming(task: Task, daysAhead = 7, refDate: Date = new Date()): boolean {
  if (!task.dueDate || task.status === 'completed') return false;
  const todayKey = formatDateKey(refDate);
  const future = new Date(refDate);
  future.setDate(future.getDate() + daysAhead);
  const futureKey = formatDateKey(future);
  return task.dueDate > todayKey && task.dueDate <= futureKey;
}

export function filterTasks(tasks: Task[], filters: TaskFilterOptions, refDate: Date = new Date()): Task[] {
  return tasks.filter((task) => {
    // Status filter
    if (filters.status && filters.status !== 'all') {
      if (task.status !== filters.status) return false;
    }

    // Priority filter
    if (filters.priority && filters.priority !== 'all') {
      if (task.priority !== filters.priority) return false;
    }

    // Project filter
    if (filters.projectId && filters.projectId !== 'all') {
      if (task.projectId !== filters.projectId) return false;
    }

    // Due range filter
    if (filters.dueRange && filters.dueRange !== 'all') {
      if (filters.dueRange === 'today' && !isTaskDueToday(task, refDate)) return false;
      if (filters.dueRange === 'overdue' && !isTaskOverdue(task, refDate)) return false;
      if (filters.dueRange === 'upcoming' && !isTaskDueUpcoming(task, 7, refDate)) return false;
    }

    // Search query filter
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      const titleMatch = task.title.toLowerCase().includes(q);
      const descMatch = (task.description || '').toLowerCase().includes(q);
      const tagMatch = (task.tags || []).some(t => t.toLowerCase().includes(q));
      if (!titleMatch && !descMatch && !tagMatch) return false;
    }

    return true;
  });
}

export function sortTasks(tasks: Task[], sortOption: TaskSortOption): Task[] {
  const copy = [...tasks];
  switch (sortOption) {
    case 'dueDate_asc':
      return copy.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
    case 'dueDate_desc':
      return copy.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return b.dueDate.localeCompare(a.dueDate);
      });
    case 'priority_desc':
      return copy.sort((a, b) => {
        const weightDiff = PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority];
        if (weightDiff !== 0) return weightDiff;
        return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
      });
    case 'title_asc':
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'createdAt_desc':
    default:
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export function calculateProjectStats(projects: Project[], tasks: Task[]): ProjectWithStats[] {
  return projects.map((project) => {
    const projectTasks = tasks.filter((t) => t.projectId === project.id);
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter((t) => t.status === 'completed').length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      ...project,
      totalTasks,
      completedTasks,
      progressPercentage,
    };
  });
}

export function calculateDashboardStats(tasks: Task[], refDate: Date = new Date()): DashboardStats {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = totalTasks - completedTasks;
  const overdueTasks = tasks.filter((t) => isTaskOverdue(t, refDate)).length;
  const dueTodayTasks = tasks.filter((t) => isTaskDueToday(t, refDate) && t.status !== 'completed').length;
  const upcomingTasks = tasks.filter((t) => isTaskDueUpcoming(t, 7, refDate)).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    dueTodayTasks,
    upcomingTasks,
    completionRate,
  };
}
