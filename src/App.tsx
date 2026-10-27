import React, { useState, useEffect } from 'react';
import { I18nProvider, useI18n } from './i18n/context';
import { StorageProvider, useStorage } from './storage/storage-context';
import { ToastProvider, useToast } from './components/ui/ToastProvider';
import { Sidebar, ActiveNavPage } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { TasksView } from './components/tasks/TasksView';
import { ProjectsView } from './components/projects/ProjectsView';
import { CalendarView } from './components/calendar/CalendarView';
import { SettingsView } from './components/settings/SettingsView';
import { TaskModal } from './components/tasks/TaskModal';
import { ProjectModal } from './components/projects/ProjectModal';
import { ConfirmModal } from './components/ui/ConfirmModal';
import { SetupWizardModal } from './components/wizard/SetupWizardModal';
import { Task, Project } from './types';

function MainAppShell() {
  const { t } = useI18n();
  const {
    tasks,
    projects,
    isLoading,
    config,
    createTask,
    updateTask,
    deleteTask,
    createProject,
    updateProject,
    deleteProject,
  } = useStorage();
  const { showToast } = useToast();

  const [activePage, setActivePage] = useState<ActiveNavPage>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Setup Wizard: open automatically on first run unless autostart query param is provided
  const [isWizardOpen, setIsWizardOpen] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      return false;
    }
    return !config.setupCompleted;
  });

  // Task Modal state
  const [taskModal, setTaskModal] = useState<{
    isOpen: boolean;
    taskToEdit?: Task | null;
    defaultDueDate?: string;
  }>({ isOpen: false });

  // Project Modal state
  const [projectModal, setProjectModal] = useState<{
    isOpen: boolean;
    projectToEdit?: Project | null;
  }>({ isOpen: false });

  // Deletion Confirmation states
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [cascadeProjectTasks, setCascadeProjectTasks] = useState(false);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If modal is open, don't trigger global shortcuts
      if (taskModal.isOpen || projectModal.isOpen || isWizardOpen || taskToDelete || projectToDelete) {
        return;
      }
      // 'c' or 'n' key to quickly create task when not typing in input
      if (
        (e.key === 'c' || e.key === 'n') &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement)
      ) {
        e.preventDefault();
        setTaskModal({ isOpen: true });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [taskModal.isOpen, projectModal.isOpen, isWizardOpen, taskToDelete, projectToDelete]);

  // Task operations
  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (taskModal.taskToEdit) {
        await updateTask(taskModal.taskToEdit.id, taskData);
        showToast(t('toastTaskUpdated'), 'success');
      } else {
        await createTask(taskData);
        showToast(t('toastTaskCreated'), 'success');
      }
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTask(taskToDelete.id);
      showToast(t('toastTaskDeleted'), 'success');
      setTaskToDelete(null);
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  // Project operations
  const handleSaveProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (projectModal.projectToEdit) {
        await updateProject(projectModal.projectToEdit.id, projectData);
        showToast(t('toastProjectUpdated'), 'success');
      } else {
        await createProject(projectData);
        showToast(t('toastProjectCreated'), 'success');
      }
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProject(projectToDelete.id, cascadeProjectTasks);
      showToast(t('toastProjectDeleted'), 'success');
      setProjectToDelete(null);
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f7f9f9] overflow-hidden text-[#1d2d35]">
      {/* Desktop Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenWizard={() => setIsWizardOpen(true)}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          activePage={activePage}
          onOpenNewTask={() => setTaskModal({ isOpen: true })}
          onOpenWizard={() => setIsWizardOpen(true)}
          onToggleMobileNav={() => setIsMobileNavOpen(true)}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-24 md:pb-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2a9d8f]" />
            </div>
          ) : (
            <>
              {activePage === 'dashboard' && (
                <DashboardView
                  onNavigate={setActivePage}
                  onOpenNewTask={(date) => setTaskModal({ isOpen: true, defaultDueDate: date })}
                  onOpenEditTask={(task) => setTaskModal({ isOpen: true, taskToEdit: task })}
                  onOpenNewProject={() => setProjectModal({ isOpen: true })}
                />
              )}

              {activePage === 'tasks' && (
                <TasksView
                  onOpenNewTask={(date) => setTaskModal({ isOpen: true, defaultDueDate: date })}
                  onOpenEditTask={(task) => setTaskModal({ isOpen: true, taskToEdit: task })}
                  onConfirmDeleteTask={(task) => setTaskToDelete(task)}
                />
              )}

              {activePage === 'projects' && (
                <ProjectsView
                  onOpenNewProject={() => setProjectModal({ isOpen: true })}
                  onOpenEditProject={(project) => setProjectModal({ isOpen: true, projectToEdit: project })}
                  onConfirmDeleteProject={(project) => setProjectToDelete(project)}
                  onOpenNewTaskForProject={(projectId) => setTaskModal({ isOpen: true, taskToEdit: null })}
                  onOpenEditTask={(task) => setTaskModal({ isOpen: true, taskToEdit: task })}
                />
              )}

              {activePage === 'calendar' && (
                <CalendarView
                  onOpenNewTaskForDate={(date) => setTaskModal({ isOpen: true, defaultDueDate: date })}
                  onOpenEditTask={(task) => setTaskModal({ isOpen: true, taskToEdit: task })}
                />
              )}

              {activePage === 'settings' && (
                <SettingsView onOpenWizard={() => setIsWizardOpen(true)} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Drawer and Bottom Nav */}
      <MobileNav
        activePage={activePage}
        setActivePage={setActivePage}
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        onOpenWizard={() => setIsWizardOpen(true)}
      />

      {/* Modals & Dialogs */}
      <TaskModal
        isOpen={taskModal.isOpen}
        taskToEdit={taskModal.taskToEdit}
        defaultDueDate={taskModal.defaultDueDate}
        projects={projects}
        onSave={handleSaveTask}
        onDelete={async (id) => {
          const tsk = tasks.find((t) => t.id === id);
          if (tsk) {
            setTaskModal({ isOpen: false });
            setTaskToDelete(tsk);
          }
        }}
        onClose={() => setTaskModal({ isOpen: false })}
      />

      <ProjectModal
        isOpen={projectModal.isOpen}
        projectToEdit={projectModal.projectToEdit}
        onSave={handleSaveProject}
        onClose={() => setProjectModal({ isOpen: false })}
      />

      {/* Delete Task Confirmation */}
      <ConfirmModal
        isOpen={Boolean(taskToDelete)}
        title={t('taskDeleteConfirmTitle')}
        description={taskToDelete ? `"${taskToDelete.title}" - ${t('taskDeleteConfirmDesc')}` : ''}
        confirmLabel={t('taskDeleteBtn')}
        cancelLabel={t('cancel')}
        isDestructive={true}
        onConfirm={handleDeleteTask}
        onCancel={() => setTaskToDelete(null)}
      />

      {/* Delete Project Confirmation with Cascade toggle */}
      <ConfirmModal
        isOpen={Boolean(projectToDelete)}
        title={t('projectDeleteConfirmTitle')}
        description={projectToDelete ? `"${projectToDelete.name}" - ${t('projectDeleteConfirmDesc')}` : ''}
        confirmLabel={t('projectDeleteBtn')}
        cancelLabel={t('cancel')}
        isDestructive={true}
        onConfirm={handleDeleteProject}
        onCancel={() => setProjectToDelete(null)}
      >
        <div className="space-y-2 mt-3 pt-3 border-t border-gray-100 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-gray-700">
            <input
              type="radio"
              name="cascadeChoice"
              checked={!cascadeProjectTasks}
              onChange={() => setCascadeProjectTasks(false)}
              className="text-[#2a9d8f]"
            />
            <span>{t('projectDeleteKeepTasks')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-[#e76f51] font-semibold">
            <input
              type="radio"
              name="cascadeChoice"
              checked={cascadeProjectTasks}
              onChange={() => setCascadeProjectTasks(true)}
              className="text-[#e76f51]"
            />
            <span>{t('projectDeleteCascadeTasks')}</span>
          </label>
        </div>
      </ConfirmModal>

      {/* Guided Setup Wizard */}
      <SetupWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <StorageProvider>
        <ToastProvider>
          <MainAppShell />
        </ToastProvider>
      </StorageProvider>
    </I18nProvider>
  );
}
