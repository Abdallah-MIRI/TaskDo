import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Palette } from 'lucide-react';
import { Project } from '../../types';
import { useI18n } from '../../i18n/context';

interface ProjectModalProps {
  isOpen: boolean;
  projectToEdit?: Project | null;
  onSave: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
}

const BRAND_PALETTE_COLORS = [
  { hex: '#264653', label: 'كحلي داكن' },
  { hex: '#2a9d8f', label: 'تركواز براند' },
  { hex: '#e9c46a', label: 'أصفر ذهبي' },
  { hex: '#f4a261', label: 'برتقالي دافئ' },
  { hex: '#e76f51', label: 'مرجاني حيوي' },
  { hex: '#457b9d', label: 'أزرق سماوي' },
  { hex: '#6d597a', label: 'أرجواني ملكي' },
];

export function ProjectModal({
  isOpen,
  projectToEdit,
  onSave,
  onClose,
}: ProjectModalProps) {
  const { t } = useI18n();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#2a9d8f');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description || '');
      setColor(projectToEdit.color || '#2a9d8f');
      setValidationError('');
    } else {
      setName('');
      setDescription('');
      setColor('#2a9d8f');
      setValidationError('');
    }
  }, [projectToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError(t('validationProjectNameRequired'));
      return;
    }

    setValidationError('');
    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        color,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-[#f7f9f9]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#2a9d8f] text-white">
              <FolderPlus className="w-5 h-5" />
            </div>
            <h2 id="project-modal-title" className="text-lg font-bold text-[#264653]">
              {projectToEdit ? t('projectModalTitleEdit') : t('projectModalTitleCreate')}
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

          <div>
            <label htmlFor="proj-name" className="block text-xs font-bold uppercase tracking-wider text-[#264653] mb-1.5">
              {t('projectFieldName')}
            </label>
            <input
              id="proj-name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('projectFieldNamePlaceholder')}
              className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          <div>
            <label htmlFor="proj-desc" className="block text-xs font-bold uppercase tracking-wider text-[#264653] mb-1.5">
              {t('projectFieldDesc')}
            </label>
            <textarea
              id="proj-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('projectFieldDescPlaceholder')}
              className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 outline-none transition-all placeholder:text-gray-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#264653] mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" />
              {t('projectFieldColor')}
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {BRAND_PALETTE_COLORS.map((c) => {
                const isSelected = color === c.hex;
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    title={c.label}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      isSelected ? 'ring-3 ring-offset-2 ring-[#264653] scale-110 shadow-md' : 'hover:scale-105'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-bold text-white bg-[#2a9d8f] hover:bg-[#238277] rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              {t('projectSaveBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
