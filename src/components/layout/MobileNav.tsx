import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  CalendarDays,
  Settings,
  X,
  Sparkles,
  Database,
  Languages,
} from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { useStorage } from '../../storage/storage-context';
import { ActiveNavPage } from './Sidebar';

interface MobileNavProps {
  activePage: ActiveNavPage;
  setActivePage: (p: ActiveNavPage) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenWizard: () => void;
}

export function MobileNav({
  activePage,
  setActivePage,
  isOpen,
  onClose,
  onOpenWizard,
}: MobileNavProps) {
  const { t, language, setLanguage } = useI18n();
  const { activeAdapterName } = useStorage();

  const navItems: { id: ActiveNavPage; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { id: 'tasks', label: t('navTasks'), icon: CheckSquare },
    { id: 'projects', label: t('navProjects'), icon: FolderKanban },
    { id: 'calendar', label: t('navCalendar'), icon: CalendarDays },
    { id: 'settings', label: t('navSettings'), icon: Settings },
  ];

  const handleSelect = (page: ActiveNavPage) => {
    setActivePage(page);
    onClose();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop & Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/40 backdrop-blur-xs flex">
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-start duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#264653] flex items-center justify-center text-white font-extrabold text-sm">
                  <span className="text-[#2a9d8f]">TD</span>
                </div>
                <span className="font-extrabold text-base text-[#264653]">{t('appName')}</span>
              </div>
              <button
                onClick={onClose}
                aria-label={t('close')}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = activePage === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-sm transition-all ${
                      isActive
                        ? 'bg-[#264653] text-white shadow-xs'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#2a9d8f]' : 'text-gray-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Mobile Drawer Footer */}
            <div className="p-4 border-t border-gray-100 space-y-3 bg-gray-50">
              <button
                onClick={() => {
                  onClose();
                  onOpenWizard();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#2a9d8f]/10 text-[#2a9d8f] text-xs font-bold"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('navSetupWizard')}</span>
              </button>

              <button
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-gray-200 bg-white text-xs font-bold text-[#264653]"
              >
                <Languages className="w-4 h-4 text-[#2a9d8f]" />
                <span>{language === 'ar' ? 'English' : 'العربية'}</span>
              </button>

              <div className="text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#2a9d8f]" />
                <span className="truncate">{activeAdapterName}</span>
              </div>
            </div>
          </div>

          <div className="flex-1" onClick={onClose} />
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Persistent quick access) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 flex items-center justify-around h-16 px-1 safe-area-pb">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors ${
                isActive ? 'text-[#2a9d8f]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-2.5' : 'stroke-1.5'}`} />
              <span className={`text-[10px] mt-1 font-semibold truncate ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
