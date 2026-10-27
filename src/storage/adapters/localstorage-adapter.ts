import { Task, Project, AppConfig } from '../../types';
import { ITaskStorage, StorageExportPayload } from '../contracts';
import { getInitialSeedData } from '../seed-data';

const LS_TASKS_KEY = 'taskdo_tasks_v1';
const LS_PROJECTS_KEY = 'taskdo_projects_v1';

export class LocalStorageAdapter implements ITaskStorage {
  readonly providerName = 'Browser LocalStorage';
  readonly isRemote = false;

  async init(): Promise<void> {
    if (!localStorage.getItem(LS_TASKS_KEY) && !localStorage.getItem(LS_PROJECTS_KEY)) {
      const { projects, tasks } = getInitialSeedData();
      localStorage.setItem(LS_PROJECTS_KEY, JSON.stringify(projects));
      localStorage.setItem(LS_TASKS_KEY, JSON.stringify(tasks));
    }
  }

  private readTasks(): Task[] {
    try {
      const raw = localStorage.getItem(LS_TASKS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private writeTasks(tasks: Task[]): void {
    localStorage.setItem(LS_TASKS_KEY, JSON.stringify(tasks));
  }

  private readProjects(): Project[] {
    try {
      const raw = localStorage.getItem(LS_PROJECTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private writeProjects(projects: Project[]): void {
    localStorage.setItem(LS_PROJECTS_KEY, JSON.stringify(projects));
  }

  async getTasks(): Promise<Task[]> {
    await this.init();
    return this.readTasks();
  }

  async saveTask(task: Task): Promise<Task> {
    await this.init();
    const tasks = this.readTasks();
    const existingIndex = tasks.findIndex(t => t.id === task.id);
    if (existingIndex >= 0) {
      tasks[existingIndex] = task;
    } else {
      tasks.push(task);
    }
    this.writeTasks(tasks);
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    await this.init();
    const tasks = this.readTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Task with ID ${id} not found.`);
    }
    const updated: Task = {
      ...tasks[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    tasks[index] = updated;
    this.writeTasks(tasks);
    return updated;
  }

  async deleteTask(id: string): Promise<void> {
    await this.init();
    const tasks = this.readTasks().filter(t => t.id !== id);
    this.writeTasks(tasks);
  }

  async getProjects(): Promise<Project[]> {
    await this.init();
    return this.readProjects();
  }

  async saveProject(project: Project): Promise<Project> {
    await this.init();
    const projects = this.readProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id);
    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.push(project);
    }
    this.writeProjects(projects);
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    await this.init();
    const projects = this.readProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Project with ID ${id} not found.`);
    }
    const updated: Project = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    projects[index] = updated;
    this.writeProjects(projects);
    return updated;
  }

  async deleteProject(id: string, cascadeOrUnassignTasks: boolean): Promise<void> {
    await this.init();
    const projects = this.readProjects().filter(p => p.id !== id);
    this.writeProjects(projects);

    let tasks = this.readTasks();
    if (cascadeOrUnassignTasks) {
      tasks = tasks.filter(t => t.projectId !== id);
    } else {
      tasks = tasks.map(t => (t.projectId === id ? { ...t, projectId: undefined } : t));
    }
    this.writeTasks(tasks);
  }

  async exportAll(config?: AppConfig): Promise<StorageExportPayload> {
    await this.init();
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      tasks: this.readTasks(),
      projects: this.readProjects(),
      config,
    };
  }

  async importAll(data: { tasks?: Task[]; projects?: Project[] }): Promise<{ tasksCount: number; projectsCount: number }> {
    await this.init();
    let tasksCount = 0;
    let projectsCount = 0;

    if (data.projects) {
      const currentProjects = this.readProjects();
      for (const p of data.projects) {
        const idx = currentProjects.findIndex(cp => cp.id === p.id);
        if (idx >= 0) currentProjects[idx] = p;
        else currentProjects.push(p);
        projectsCount++;
      }
      this.writeProjects(currentProjects);
    }

    if (data.tasks) {
      const currentTasks = this.readTasks();
      for (const t of data.tasks) {
        const idx = currentTasks.findIndex(ct => ct.id === t.id);
        if (idx >= 0) currentTasks[idx] = t;
        else currentTasks.push(t);
        tasksCount++;
      }
      this.writeTasks(currentTasks);
    }

    return { tasksCount, projectsCount };
  }

  async resetAll(): Promise<void> {
    localStorage.removeItem(LS_TASKS_KEY);
    localStorage.removeItem(LS_PROJECTS_KEY);
    await this.init();
  }

  async testConnection(): Promise<{ ok: boolean; message: string }> {
    try {
      localStorage.setItem('__test_ls__', '1');
      localStorage.removeItem('__test_ls__');
      return { ok: true, message: 'LocalStorage is operational and accessible.' };
    } catch (err) {
      return { ok: false, message: (err as Error).message };
    }
  }
}
