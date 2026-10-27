import { Task, Project, AppConfig } from '../types';

export interface StorageExportPayload {
  version: string;
  exportedAt: string;
  tasks: Task[];
  projects: Project[];
  config?: Partial<AppConfig>;
}

export interface ITaskStorage {
  readonly providerName: string;
  readonly isRemote: boolean;

  init(): Promise<void>;
  
  getTasks(): Promise<Task[]>;
  saveTask(task: Task): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  deleteTask(id: string): Promise<void>;

  getProjects(): Promise<Project[]>;
  saveProject(project: Project): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project>;
  deleteProject(id: string, cascadeOrUnassignTasks: boolean): Promise<void>;

  exportAll(config?: AppConfig): Promise<StorageExportPayload>;
  importAll(data: { tasks?: Task[]; projects?: Project[] }): Promise<{ tasksCount: number; projectsCount: number }>;
  resetAll(): Promise<void>;
  
  testConnection?(): Promise<{ ok: boolean; message: string }>;
}
