import React, { useState, useEffect } from 'react';
import { X, Calendar, Flag, Folder, CheckSquare, Trash2 } from 'lucide-react';
import { Task, TaskPriority, TaskStatus, Project } from '../../types';
import { useI18n } from '../../i18n/context';

interface TaskModalProps {
  isOpen: boolean;
  taskToEdit?: Task | null;
  defaultDueDate?: string;
  projects: Project[];
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onClose: () => void;
}

export function TaskModal({
  isOpen,
  taskToEdit,
  defaultDueDate,
  projects,
  onSave,
  onDelete,
  onClose,
}: TaskModalProps) {
  const { t } = useI18n();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState<string>('');
  const [tagsInput, setTagsInput] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status);
      setPriority(taskToEdit.priority);
      setDueDate(taskToEdit.dueDate || '');
      setProjectId(taskToEdit.projectId || '');
      setTagsInput((taskToEdit.tags || []).join(', '));
      setValidationError('');
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setDueDate(defaultDueDate || '');
      setProjectId('');
      setTagsInput('');
      setValidationError('');
    }
  }, [taskToEdit, defaultDueDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError(t('validationTitleRequired'));
      return;
    }

    setValidationError('');
    setIsSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        dueDate: dueDate || undefined,
        projectId: projectId || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityOptions: { value: TaskPriority; label: string; colorClass: string; bgClass: string }[] = [
    { value: 'urgent', label: t('taskPriorityUrgent'), colorClass: 'text-[#e76f51]', bgClass: 'bg-[#e76f51]/10 border-[#e76f51]/30' },
    { value: 'high', label: t('taskPriorityHigh'), colorClass: 'text-[#f4a261]', bgClass: 'bg-[#f4a261]/10 border-[#f4a261]/30' },
    { value: 'medium', label: t('taskPriorityMedium'), colorClass: 'text-[#b78917]', bgClass: 'bg-[#e9c46a]/15 border-[#e9c46a]/40' },
    { value: 'low', label: t('taskPriorityLow'), colorClass: 'text-[#2a9d8f]', bgClass: 'bg-[#2a9d8f]/10 border-[#2a9d8f]/30' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-[#f7f9f9]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#264653] text-white">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h2 id="task-modal-title" className="text-lg font-bold text-[#264653]">
              {taskToEdit ? t('taskModalTitleEdit') : t('taskModalTitleCreate')}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label={t('close')}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {validationError && (
            <div className="p-3 text-sm font-medium rounded-xl bg-[#e76f51]/10 text-[#e76f51] border border-[#e76f51]/20">
              {validationError}
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="task-title" className="block text-xs font-bold uppercase tracking-wider text-[#264653] mb-1.5">
              {t('taskFieldTitle')}
            </label>
            <input
              id="task-title"
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('taskFieldTitlePlaceholder')}
              className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-desc" className="block text-xs font-bold uppercase tracking-wider text-[#264653] mb-1.5">
              {t('taskFieldDescription')}
            </label>
            <textarea
              id="task-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('taskFieldDescriptionPlaceholder')}
              className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 outline-none transition-all placeholder:text-gray-400 resize-none"
            />
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#264653] mb-2 flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5" />
              {t('taskFieldPriority')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {priorityOptions.map((opt) => {
                const isSelected = priority === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                      isSelected
                        ? `${opt.bgClass} ${opt.colorClass} ring-2 ring-offset-1 ring-current shadow-xs`
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid: Project & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Project */}
            <div>
              <label htmlFor="task-project" className="block text-xs font-bold uppercase tracking-wider text-[#264653] mb-1.5 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5" />
                {t('taskFieldProject')}
              </label>
              <select
                id="task-project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 outline-none transition-all"
              >
                <option value="">{t('taskNoProject')}</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="task-date" className="block text-xs font-bold uppercase tracking-wider text-[#264653] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {t('taskFieldDueDate')}
              </label>
              <input
                id="task-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 outline-none transition-all"
              >
              </input>
            </div>
          </div>

          {/* Status (if editing or needed) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-status" className="block text-xs font-bold uppercase tracking-wider text-[#264653] mb-1.5">
                {t('taskFieldStatus')}
              </label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 outline-none transition-all"
              >
                <option value="todo">{t('taskStatusTodo')}</option>
                <option value="in_progress">{t('taskStatusInProgress')}</option>
                <option value="completed">{t('taskStatusCompleted')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-tags" className="block text-xs font-bold uppercase tracking-wider text-[#264653] mb-1.5">
                الوسوم (مفصولة بفاصلة)
              </label>
              <input
                id="task-tags"
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="تصميم, عاجل, تقارير"
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {taskToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(taskToEdit.id)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#e76f51] hover:bg-[#e76f51]/10 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {t('taskDeleteBtn')}
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {t('taskCancelBtn')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-sm font-bold text-white bg-[#2a9d8f] hover:bg-[#238277] rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                {t('taskSaveBtn')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
