import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isTaskDueToday,
  isTaskOverdue,
  isTaskDueUpcoming,
  filterTasks,
  sortTasks,
  calculateProjectStats,
  calculateDashboardStats,
  formatDateKey,
} from './task-rules';
import { Task, Project } from '../types';

const mockRefDate = new Date('2026-10-27T12:00:00Z');
const todayStr = '2026-10-27';
const yesterdayStr = '2026-10-26';
const tomorrowStr = '2026-10-28';
const nextWeekStr = '2026-11-01';
const nextMonthStr = '2026-12-01';

const sampleTasks: Task[] = [
  {
    id: 't1',
    title: 'تجهيز خطة المشروع',
    status: 'in_progress',
    priority: 'urgent',
    dueDate: todayStr,
    projectId: 'p1',
    createdAt: '2026-10-25T10:00:00Z',
    updatedAt: '2026-10-25T10:00:00Z',
  },
  {
    id: 't2',
    title: 'مراجعة الكود',
    status: 'todo',
    priority: 'high',
    dueDate: yesterdayStr,
    projectId: 'p1',
    createdAt: '2026-10-24T10:00:00Z',
    updatedAt: '2026-10-24T10:00:00Z',
  },
  {
    id: 't3',
    title: 'إطلاق النسخة التجريبية',
    status: 'completed',
    priority: 'urgent',
    dueDate: yesterdayStr,
    projectId: 'p2',
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-10-26T15:00:00Z',
    completedAt: '2026-10-26T15:00:00Z',
  },
  {
    id: 't4',
    title: 'تصميم الواجهة',
    status: 'todo',
    priority: 'low',
    dueDate: tomorrowStr,
    projectId: 'p2',
    createdAt: '2026-10-26T11:00:00Z',
    updatedAt: '2026-10-26T11:00:00Z',
  },
  {
    id: 't5',
    title: 'كتابة التوثيق',
    status: 'todo',
    priority: 'medium',
    dueDate: nextWeekStr,
    projectId: undefined,
    createdAt: '2026-10-26T12:00:00Z',
    updatedAt: '2026-10-26T12:00:00Z',
  },
  {
    id: 't6',
    title: 'مهمة مستقبلية بعد شهر',
    status: 'todo',
    priority: 'low',
    dueDate: nextMonthStr,
    createdAt: '2026-10-26T14:00:00Z',
    updatedAt: '2026-10-26T14:00:00Z',
  },
];

const sampleProjects: Project[] = [
  { id: 'p1', name: 'مشروع أ', color: '#264653', createdAt: '2026-10-01', updatedAt: '2026-10-01' },
  { id: 'p2', name: 'مشروع ب', color: '#2a9d8f', createdAt: '2026-10-01', updatedAt: '2026-10-01' },
];

test('date formatting works correctly', () => {
  assert.equal(formatDateKey(new Date('2026-10-27T00:00:00')), '2026-10-27');
});

test('isTaskDueToday correctly detects tasks due today', () => {
  assert.equal(isTaskDueToday(sampleTasks[0], mockRefDate), true);
  assert.equal(isTaskDueToday(sampleTasks[1], mockRefDate), false);
  assert.equal(isTaskDueToday(sampleTasks[3], mockRefDate), false);
});

test('isTaskOverdue ignores completed tasks even if due in past', () => {
  assert.equal(isTaskOverdue(sampleTasks[1], mockRefDate), true);
  assert.equal(isTaskOverdue(sampleTasks[2], mockRefDate), false); // completed
  assert.equal(isTaskOverdue(sampleTasks[0], mockRefDate), false); // due today is not overdue
});

test('isTaskDueUpcoming detects tasks within next 7 days', () => {
  assert.equal(isTaskDueUpcoming(sampleTasks[3], 7, mockRefDate), true); // tomorrow
  assert.equal(isTaskDueUpcoming(sampleTasks[4], 7, mockRefDate), true); // Nov 1
  assert.equal(isTaskDueUpcoming(sampleTasks[5], 7, mockRefDate), false); // Dec 1 (too far)
  assert.equal(isTaskDueUpcoming(sampleTasks[1], 7, mockRefDate), false); // yesterday
});

test('filterTasks correctly filters by status and project', () => {
  const todoOnly = filterTasks(sampleTasks, { status: 'todo' }, mockRefDate);
  assert.equal(todoOnly.length, 4);

  const p1Only = filterTasks(sampleTasks, { projectId: 'p1' }, mockRefDate);
  assert.equal(p1Only.length, 2);

  const overdueOnly = filterTasks(sampleTasks, { dueRange: 'overdue' }, mockRefDate);
  assert.equal(overdueOnly.length, 1);
  assert.equal(overdueOnly[0].id, 't2');

  const searchMatch = filterTasks(sampleTasks, { searchQuery: 'توثيق' }, mockRefDate);
  assert.equal(searchMatch.length, 1);
  assert.equal(searchMatch[0].id, 't5');
});

test('sortTasks sorts properly by priority then date', () => {
  const sorted = sortTasks(sampleTasks, 'priority_desc');
  assert.equal(sorted[0].priority, 'urgent');
  assert.equal(sorted[1].priority, 'urgent');
  assert.equal(sorted[2].priority, 'high');
});

test('calculateProjectStats computes counts and percentages accurately', () => {
  const stats = calculateProjectStats(sampleProjects, sampleTasks);
  const p1 = stats.find(p => p.id === 'p1');
  const p2 = stats.find(p => p.id === 'p2');

  assert.equal(p1?.totalTasks, 2);
  assert.equal(p1?.completedTasks, 0);
  assert.equal(p1?.progressPercentage, 0);

  assert.equal(p2?.totalTasks, 2);
  assert.equal(p2?.completedTasks, 1);
  assert.equal(p2?.progressPercentage, 50);
});

test('calculateDashboardStats calculates all key indicators reliably', () => {
  const dStats = calculateDashboardStats(sampleTasks, mockRefDate);
  assert.equal(dStats.totalTasks, 6);
  assert.equal(dStats.completedTasks, 1);
  assert.equal(dStats.pendingTasks, 5);
  assert.equal(dStats.overdueTasks, 1);
  assert.equal(dStats.dueTodayTasks, 1);
  assert.equal(dStats.upcomingTasks, 2);
  assert.equal(dStats.completionRate, 17); // 1/6 = 16.66% -> 17%
});
