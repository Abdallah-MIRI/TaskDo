import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Task, Project, AppConfig, StorageProviderType } from '../types';
import { ITaskStorage } from './contracts';
import { IndexedDBAdapter } from './adapters/indexeddb-adapter';
import { LocalStorageAdapter } from './adapters/localstorage-adapter';
import { SupabaseStorageAdapter, RestStorageAdapter } from './adapters/remote-adapters';

const CONFIG_KEY = 'taskdo_app_config_v1';

const DEFAULT_CONFIG: AppConfig = {
  language: 'ar',
  storageProvider: 'indexeddb',
  deploymentMode: 'github_pages',
  workspaceMode: 'single_device',
  setupCompleted: false,
  theme: 'light',
};

interface StorageContextValue {
  tasks: Task[];
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  config: AppConfig;
  activeAdapterName: string;
  isRemote: boolean;
  createTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<Task>;
  createProject: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string, cascadeOrUnassignTasks: boolean) => Promise<void>;
  updateConfig: (newConfig: Partial<AppConfig>) => Promise<void>;
  exportBackup: () => Promise<string>;
  importBackup: (jsonContent: string) => Promise<{ tasksCount: number; projectsCount: number }>;
  resetAllData: () => Promise<void>;
  testCurrentConnection: () => Promise<{ ok: boolean; message: string }>;
  refreshData: () => Promise<void>;
}

const StorageContext = createContext<StorageContextValue | null>(null);

function createAdapter(config: AppConfig): ITaskStorage {
  switch (config.storageProvider) {
    case 'localstorage':
      return new LocalStorageAdapter();
    case 'supabase':
      return new SupabaseStorageAdapter(
        config.supabaseConfig?.url,
        config.supabaseConfig?.anonKey
      );
    case 'postgresql':
    case 'rest_api':
      return new RestStorageAdapter(
        config.postgresConfig?.apiEndpoint || config.restApiConfig?.baseUrl
      );
    case 'indexeddb':
    default:
      return new IndexedDBAdapter();
  }
}

export function StorageProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const stored = localStorage.getItem(CONFIG_KEY);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_CONFIG;
  });

  const [adapter, setAdapter] = useState<ITaskStorage>(() => createAdapter(config));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize and load data whenever adapter changes
  const loadData = useCallback(async (currentAdapter: ITaskStorage) => {
    setIsLoading(true);
    setError(null);
    try {
      await currentAdapter.init();
      const [loadedTasks, loadedProjects] = await Promise.all([
        currentAdapter.getTasks(),
        currentAdapter.getProjects(),
      ]);
      setTasks(loadedTasks);
      setProjects(loadedProjects);
    } catch (err) {
      setError((err as Error).message || 'Failed to load data from storage.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const newAdapter = createAdapter(config);
    setAdapter(newAdapter);
    loadData(newAdapter);
  }, [config.storageProvider, config.supabaseConfig, config.postgresConfig, config.restApiConfig, loadData]);

  const updateConfig = async (newConfig: Partial<AppConfig>) => {
    const merged = { ...config, ...newConfig };
    setConfig(merged);
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(merged));
    } catch (err) {
      console.error('Failed to save config to localStorage:', err);
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    const saved = await adapter.saveTask(newTask);
    setTasks((prev) => [saved, ...prev]);
    return saved;
  };

  const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
    const updated = await adapter.updateTask(id, updates);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  };

  const deleteTask = async (id: string): Promise<void> => {
    await adapter.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTaskComplete = async (id: string): Promise<Task> => {
    const task = tasks.find((t) => t.id === id);
    if (!task) throw new Error(`Task ${id} not found`);

    const isCurrentlyCompleted = task.status === 'completed';
    const newStatus = isCurrentlyCompleted ? 'todo' : 'completed';
    const completedAt = isCurrentlyCompleted ? undefined : new Date().toISOString();

    return updateTask(id, {
      status: newStatus,
      completedAt,
    });
  };

  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
    const now = new Date().toISOString();
    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    const saved = await adapter.saveProject(newProject);
    setProjects((prev) => [...prev, saved]);
    return saved;
  };

  const updateProject = async (id: string, updates: Partial<Project>): Promise<Project> => {
    const updated = await adapter.updateProject(id, updates);
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const deleteProject = async (id: string, cascadeOrUnassignTasks: boolean): Promise<void> => {
    await adapter.deleteProject(id, cascadeOrUnassignTasks);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (cascadeOrUnassignTasks) {
      setTasks((prev) => prev.filter((t) => t.projectId !== id));
    } else {
      setTasks((prev) => prev.map((t) => (t.projectId === id ? { ...t, projectId: undefined } : t)));
    }
  };

  const exportBackup = async (): Promise<string> => {
    const payload = await adapter.exportAll(config);
    return JSON.stringify(payload, null, 2);
  };

  const importBackup = async (jsonContent: string): Promise<{ tasksCount: number; projectsCount: number }> => {
    let parsed: any;
    try {
      parsed = JSON.parse(jsonContent);
    } catch {
      throw new Error('Invalid JSON format');
    }
    const result = await adapter.importAll({
      tasks: parsed.tasks,
      projects: parsed.projects,
    });
    // Reload into state
    await loadData(adapter);
    return result;
  };

  const resetAllData = async (): Promise<void> => {
    await adapter.resetAll();
    await loadData(adapter);
  };

  const testCurrentConnection = async (): Promise<{ ok: boolean; message: string }> => {
    if (adapter.testConnection) {
      return adapter.testConnection();
    }
    return { ok: true, message: 'Provider is active.' };
  };

  const refreshData = async () => {
    await loadData(adapter);
  };

  const value = useMemo(
    () => ({
      tasks,
      projects,
      isLoading,
      error,
      config,
      activeAdapterName: adapter.providerName,
      isRemote: adapter.isRemote,
      createTask,
      updateTask,
      deleteTask,
      toggleTaskComplete,
      createProject,
      updateProject,
      deleteProject,
      updateConfig,
      exportBackup,
      importBackup,
      resetAllData,
      testCurrentConnection,
      refreshData,
    }),
    [tasks, projects, isLoading, error, config, adapter, loadData]
  );

  return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>;
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
}
