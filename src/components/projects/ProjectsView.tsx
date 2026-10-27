import React, { useState } from 'react';
import {
  FolderPlus,
  Folder,
  CheckCircle2,
  ListTodo,
  MoreVertical,
  Edit2,
  Trash2,
  Plus,
  Layers,
  CheckSquare,
} from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { useStorage } from '../../storage/storage-context';
import { useToast } from '../ui/ToastProvider';
import { calculateProjectStats } from '../../domain/task-rules';
import { Project, Task } from '../../types';

interface ProjectsViewProps {
  onOpenNewProject: () => void;
  onOpenEditProject: (project: Project) => void;
  onConfirmDeleteProject: (project: Project) => void;
  onOpenNewTaskForProject: (projectId: string) => void;
  onOpenEditTask: (task: Task) => void;
}

export function ProjectsView({
  onOpenNewProject,
  onOpenEditProject,
  onConfirmDeleteProject,
  onOpenNewTaskForProject,
  onOpenEditTask,
}: ProjectsViewProps) {
  const { t, formatNumber, formatDate } = useI18n();
  const { projects, tasks, toggleTaskComplete } = useStorage();
  const { showToast } = useToast();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const projectsWithStats = calculateProjectStats(projects, tasks);

  const activeProject = selectedProjectId
    ? projectsWithStats.find((p) => p.id === selectedProjectId)
    : null;

  const projectTasks = activeProject
    ? tasks.filter((t) => t.projectId === activeProject.id)
    : [];

  const handleToggleTask = async (task: Task) => {
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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#264653]">
            {t('projectsPageTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-[#62727b] mt-0.5">
            {t('projectsPageSubtitle')}
          </p>
        </div>

        <button
          onClick={onOpenNewProject}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2a9d8f] hover:bg-[#238277] text-white text-xs sm:text-sm font-bold shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <FolderPlus className="w-4 h-4 stroke-2.5" />
          <span>{t('btnNewProject')}</span>
        </button>
      </div>

      {/* 2. Projects Grid (Custom distinct compositions) */}
      {projectsWithStats.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center space-y-4">
          <Folder className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-[#264653]">{t('noActiveProjects')}</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            أنشئ مشروعك الأول لتنظيم مهامك تحت أهداف واضحة ومحددة.
          </p>
          <button
            onClick={onOpenNewProject}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#264653] text-white text-xs font-bold hover:bg-[#1d353f] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('createFirstProjectCta')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projectsWithStats.map((proj) => {
            const isSelected = selectedProjectId === proj.id;
            return (
              <div
                key={proj.id}
                onClick={() => setSelectedProjectId(isSelected ? null : proj.id)}
                className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#2a9d8f] ring-2 ring-[#2a9d8f]/20 shadow-sm'
                    : 'border-[#e5e9ec] hover:border-gray-300 hover:shadow-xs'
                }`}
              >
                {/* Project Color Accent Stripe */}
                <div
                  className="absolute top-0 inset-x-0 h-1.5"
                  style={{ backgroundColor: proj.color }}
                />

                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${proj.color}15`, color: proj.color }}
                      >
                        <Folder className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-[#1d2d35] truncate leading-snug">
                        {proj.name}
                      </h3>
                    </div>

                    {/* Actions menu */}
                    <div
                      className="flex items-center gap-1 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onOpenEditProject(proj)}
                        aria-label={t('edit')}
                        className="p-1 text-gray-400 hover:text-[#264653] hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onConfirmDeleteProject(proj)}
                        aria-label={t('delete')}
                        className="p-1 text-gray-400 hover:text-[#e76f51] hover:bg-[#e76f51]/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {proj.description && (
                    <p className="text-xs text-[#62727b] line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                </div>

                {/* Progress bar & Task Counts */}
                <div className="mt-5 pt-3 border-t border-gray-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">
                      {formatNumber(proj.completedTasks)} / {formatNumber(proj.totalTasks)} {t('projectTasksCount')}
                    </span>
                    <span className="font-bold text-[#1d2d35]">
                      {formatNumber(proj.progressPercentage)}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: proj.color,
                        width: `${proj.progressPercentage}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Drill-down Project Tasks Drawer / Detail Section */}
      {activeProject && (
        <div className="mt-8 bg-white rounded-3xl p-6 border border-[#e5e9ec] space-y-5 animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: activeProject.color }}
                />
                <h3 className="text-base font-bold text-[#264653]">
                  مهام: {activeProject.name}
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {activeProject.description || 'عرض وتعديل المهام المرتبطة بهذا المشروع مباشرة'}
              </p>
            </div>

            <button
              onClick={() => onOpenNewTaskForProject(activeProject.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#264653] hover:bg-[#1d353f] text-white text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('quickAddTask')}</span>
            </button>
          </div>

          {projectTasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-2xl space-y-2">
              <p>لا توجد مهام مسندة لهذا المشروع بعد.</p>
              <button
                onClick={() => onOpenNewTaskForProject(activeProject.id)}
                className="text-[#2a9d8f] font-bold hover:underline"
              >
                أضف أول مهمة في {activeProject.name}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {projectTasks.map((task) => {
                const isCompleted = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-3 py-3 px-2 rounded-xl hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                          isCompleted
                            ? 'bg-[#2a9d8f] border-[#2a9d8f] text-white'
                            : 'border-gray-300 hover:border-[#2a9d8f] bg-white'
                        }`}
                      >
                        {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <div
                        onClick={() => onOpenEditTask(task)}
                        className="cursor-pointer min-w-0 flex-1"
                      >
                        <h4
                          className={`text-xs font-bold text-[#1d2d35] truncate ${
                            isCompleted ? 'line-through text-gray-400' : ''
                          }`}
                        >
                          {task.title}
                        </h4>
                        {task.dueDate && (
                          <span className="text-[10px] text-gray-500">
                            {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenEditTask(task)}
                      className="p-1 text-gray-400 hover:text-gray-700"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
