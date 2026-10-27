import React from 'react';
import { Plus, Languages, Database, Menu, Sparkles } from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { useStorage } from '../../storage/storage-context';
import { ActiveNavPage } from './Sidebar';

interface NavbarProps {
  activePage: ActiveNavPage;
  onOpenNewTask: () => void;
  onOpenWizard: () => void;
  onToggleMobileNav: () => void;
}

export function Navbar({
  activePage,
  onOpenNewTask,
  onOpenWizard,
  onToggleMobileNav,
}: NavbarProps) {
  const { language, setLanguage, t } = useI18n();
  const { activeAdapterName, isRemote } = useStorage();

  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard':
        return t('navDashboard');
      case 'tasks':
        return t('navTasks');
      case 'projects':
        return t('navProjects');
      case 'calendar':
        return t('navCalendar');
      case 'settings':
        return t('navSettings');
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <header className="h-16 px-4 sm:px-6 bg-white border-b border-[#e5e9ec] flex items-center justify-between shrink-0 z-10 sticky top-0">
      {/* Left side (in RTL, Right side) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileNav}
          aria-label="Open navigation menu"
          className="md:hidden p-2 rounded-xl text-gray-600 hover:text-[#264653] hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-base sm:text-lg font-bold text-[#264653] leading-tight">
          {getPageTitle()}
        </h1>

        {/* Desktop Active storage provider pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f7f9f9] border border-gray-200 text-xs text-[#62727b]">
          <span className={`w-2 h-2 rounded-full ${isRemote ? 'bg-amber-400' : 'bg-emerald-500'}`} />
          <Database className="w-3 h-3 text-[#2a9d8f]" />
          <span className="font-semibold text-[#264653] truncate max-w-[150px]">
            {activeAdapterName}
          </span>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-[#264653] transition-colors"
          title={language === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
        >
          <Languages className="w-3.5 h-3.5 text-[#2a9d8f]" />
          <span>{language === 'ar' ? 'English' : 'العربية'}</span>
        </button>

        {/* Quick Setup Wizard Button */}
        <button
          onClick={onOpenWizard}
          className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#2a9d8f]/30 bg-[#2a9d8f]/10 hover:bg-[#2a9d8f]/20 text-xs font-bold text-[#2a9d8f] transition-colors"
          title={t('navSetupWizard')}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{t('navSetupWizard')}</span>
        </button>

        {/* Quick Add Task Button */}
        <button
          onClick={onOpenNewTask}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-[#2a9d8f] hover:bg-[#238277] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-3" />
          <span className="hidden sm:inline">{t('quickAddTask')}</span>
        </button>
      </div>
    </header>
  );
}
