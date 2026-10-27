import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  CalendarDays,
  Settings,
  Sparkles,
  Database,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { useStorage } from '../../storage/storage-context';

export type ActiveNavPage = 'dashboard' | 'tasks' | 'projects' | 'calendar' | 'settings';

interface SidebarProps {
  activePage: ActiveNavPage;
  setActivePage: (page: ActiveNavPage) => void;
  onOpenWizard: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (c: boolean) => void;
}

export function Sidebar({
  activePage,
  setActivePage,
  onOpenWizard,
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) {
  const { t, direction } = useI18n();
  const { activeAdapterName, isRemote } = useStorage();

  const navItems: { id: ActiveNavPage; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { id: 'tasks', label: t('navTasks'), icon: CheckSquare },
    { id: 'projects', label: t('navProjects'), icon: FolderKanban },
    { id: 'calendar', label: t('navCalendar'), icon: CalendarDays },
    { id: 'settings', label: t('navSettings'), icon: Settings },
  ];

  const CollapseIcon = direction === 'rtl' 
    ? (isCollapsed ? ChevronLeft : ChevronRight)
    : (isCollapsed ? ChevronRight : ChevronLeft);

  return (
    <aside
      className={`hidden md:flex flex-col border-e border-[#e5e9ec] bg-white transition-all duration-200 z-20 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[#e5e9ec]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-[#264653] flex items-center justify-center text-white shrink-0 shadow-xs">
            <span className="font-extrabold text-lg tracking-wider text-[#2a9d8f]">TD</span>
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <h1 className="text-base font-extrabold text-[#264653] leading-none tracking-tight">
                {t('appName')}
              </h1>
              <p className="text-[11px] text-[#62727b] truncate mt-0.5 font-medium">
                {t('appTagline')}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <CollapseIcon className="w-4 h-4" />
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
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${
                isActive
                  ? 'bg-[#264653] text-white shadow-xs'
                  : 'text-[#62727b] hover:text-[#264653] hover:bg-gray-100/70'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#2a9d8f]' : 'text-gray-500'}`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Storage and Wizard Shortcut */}
      <div className="p-3 border-t border-[#e5e9ec] space-y-2">
        <button
          onClick={onOpenWizard}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#2a9d8f]/10 text-[#2a9d8f] hover:bg-[#2a9d8f]/20 transition-colors ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title={isCollapsed ? t('navSetupWizard') : undefined}
        >
          <Sparkles className="w-4 h-4 shrink-0 text-[#2a9d8f]" />
          {!isCollapsed && <span className="truncate">{t('navSetupWizard')}</span>}
        </button>

        {!isCollapsed && (
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#264653]">
              <Database className="w-3.5 h-3.5 text-[#2a9d8f]" />
              <span className="truncate">{activeAdapterName.split(' ')[0]}</span>
            </div>
            <div className="flex items-center gap-1 text-[#62727b]">
              <span className={`w-2 h-2 rounded-full ${isRemote ? 'bg-amber-400' : 'bg-emerald-500'}`} />
              <span>{isRemote ? 'متصل بسحابي' : t('offlineReady')}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
