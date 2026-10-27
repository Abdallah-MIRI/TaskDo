import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { PieChart as PieIcon, BarChart3, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { Task, Project } from '../../types';

interface TaskStatisticsProps {
  tasks: Task[];
  projects: Project[];
}

export function TaskStatistics({ tasks, projects }: TaskStatisticsProps) {
  const { t, formatNumber, direction } = useI18n();
  const [activeTab, setActiveTab] = useState<'distribution' | 'completion' | 'priority'>('completion');

  // 1. Completion Rate by Project
  const projectCompletionData = useMemo(() => {
    if (projects.length === 0) return [];
    return projects.map((p) => {
      const pTasks = tasks.filter((t) => t.projectId === p.id);
      const completed = pTasks.filter((t) => t.status === 'completed').length;
      const pending = pTasks.length - completed;
      const rate = pTasks.length > 0 ? Math.round((completed / pTasks.length) * 100) : 0;
      return {
        name: p.name,
        completed,
        pending,
        total: pTasks.length,
        rate,
        color: p.color,
      };
    }).filter(item => item.total > 0);
  }, [projects, tasks]);

  // 2. Category / Project Distribution (Pie)
  const categoryDistributionData = useMemo(() => {
    const unassignedTasks = tasks.filter((t) => !t.projectId).length;
    const data = projects.map((p) => {
      const count = tasks.filter((t) => t.projectId === p.id).length;
      return {
        name: p.name,
        value: count,
        color: p.color,
      };
    }).filter((d) => d.value > 0);

    if (unassignedTasks > 0) {
      data.push({
        name: t('taskNoProject'),
        value: unassignedTasks,
        color: '#94a3b8',
      });
    }
    return data;
  }, [projects, tasks, t]);

  // 3. Priority Distribution
  const priorityData = useMemo(() => {
    const urgent = tasks.filter((t) => t.priority === 'urgent').length;
    const high = tasks.filter((t) => t.priority === 'high').length;
    const medium = tasks.filter((t) => t.priority === 'medium').length;
    const low = tasks.filter((t) => t.priority === 'low').length;

    return [
      { name: t('taskPriorityUrgent'), value: urgent, color: '#e76f51' },
      { name: t('taskPriorityHigh'), value: high, color: '#f4a261' },
      { name: t('taskPriorityMedium'), value: medium, color: '#e9c46a' },
      { name: t('taskPriorityLow'), value: low, color: '#2a9d8f' },
    ].filter(item => item.value > 0);
  }, [tasks, t]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const overallRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (totalTasks === 0) {
    return (
      <div className="bg-white rounded-3xl border border-[#e5e9ec] p-6 text-center text-xs text-[#62727b]">
        {t('statsNoData')}
      </div>
    );
  }

  // Custom Cairo-styled Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#264653] text-white text-xs p-3 rounded-xl shadow-xl border border-white/10 font-['Cairo',sans-serif]">
          <p className="font-bold mb-1">{payload[0].name || payload[0].payload.name}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-white/80">{entry.name}:</span>
              <span className="font-bold">{formatNumber(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <section aria-label="Task Analytics" className="bg-white rounded-3xl border border-[#e5e9ec] p-6 shadow-xs space-y-6">
      {/* Header with Title & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-base font-bold text-[#264653] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#2a9d8f]" />
            <span>{t('statsSectionTitle')}</span>
          </h3>
          <p className="text-xs text-[#62727b] mt-0.5">
            {t('statsCompletedVsPending')} ({formatNumber(completedTasks)} {t('statsCompletedLabel')} / {formatNumber(totalTasks)} {t('statTotalTasks')} - {formatNumber(overallRate)}%)
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-[#f7f9f9] p-1 rounded-xl border border-gray-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('completion')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'completion'
                ? 'bg-white text-[#264653] shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#2a9d8f]" />
            <span>{t('statsCompletionRateTitle')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('distribution')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'distribution'
                ? 'bg-white text-[#264653] shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5 text-[#e76f51]" />
            <span>{t('statsDistributionByProject')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('priority')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'priority'
                ? 'bg-white text-[#264653] shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#f4a261]" />
            <span>{t('statsDistributionByPriority')}</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="min-h-[260px] w-full flex items-center justify-center">
        {activeTab === 'completion' && (
          <div className="w-full">
            {projectCompletionData.length === 0 ? (
              <div className="text-center py-10 text-xs text-gray-400">
                لا توجد مشاريع بها مهام لعرض معدلات الإنجاز.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={projectCompletionData}
                    margin={{ top: 10, right: 10, left: direction === 'rtl' ? 20 : 0, bottom: 20 }}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#62727b', fontSize: 11, fontFamily: 'Cairo, sans-serif' }}
                      axisLine={{ stroke: '#e5e9ec' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#62727b', fontSize: 11, fontFamily: 'Cairo, sans-serif' }}
                      axisLine={{ stroke: '#e5e9ec' }}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      formatter={(value) => (
                        <span className="text-xs font-bold text-[#264653] font-['Cairo',sans-serif]">
                          {value === 'completed' ? t('statsCompletedLabel') : t('statsPendingLabel')}
                        </span>
                      )}
                    />
                    <Bar
                      dataKey="completed"
                      name="completed"
                      fill="#2a9d8f"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                    <Bar
                      dataKey="pending"
                      name="pending"
                      fill="#e76f51"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {activeTab === 'distribution' && (
          <div className="w-full">
            {categoryDistributionData.length === 0 ? (
              <div className="text-center py-10 text-xs text-gray-400">
                لا توجد بيانات كافية لعرض التوزيع.
              </div>
            ) : (
              <div className="h-64 w-full flex flex-col sm:flex-row items-center justify-center">
                <div className="h-full w-full sm:w-2/3">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDistributionData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {categoryDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend Chips */}
                <div className="flex flex-col gap-2 w-full sm:w-1/3 ps-4 max-h-48 overflow-y-auto">
                  {categoryDistributionData.map((entry, index) => {
                    const percentage = totalTasks > 0 ? Math.round((entry.value / totalTasks) * 100) : 0;
                    return (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-[#1d2d35] font-semibold truncate max-w-[120px]">
                            {entry.name}
                          </span>
                        </div>
                        <span className="font-bold text-[#62727b] shrink-0">
                          {formatNumber(entry.value)} ({formatNumber(percentage)}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'priority' && (
          <div className="w-full">
            <div className="h-64 w-full flex flex-col sm:flex-row items-center justify-center">
              <div className="h-full w-full sm:w-2/3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`priority-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Priority Legend */}
              <div className="flex flex-col gap-2.5 w-full sm:w-1/3 ps-4">
                {priorityData.map((entry, index) => {
                  const percentage = totalTasks > 0 ? Math.round((entry.value / totalTasks) * 100) : 0;
                  return (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-[#1d2d35] font-bold">{entry.name}</span>
                      </div>
                      <span className="font-semibold text-gray-500">
                        {formatNumber(entry.value)} ({formatNumber(percentage)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
