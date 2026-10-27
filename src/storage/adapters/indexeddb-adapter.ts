import Dexie, { Table } from 'dexie';
import { Task, Project, AppConfig } from '../../types';
import { ITaskStorage, StorageExportPayload } from '../contracts';
import { getInitialSeedData } from '../seed-data';

class TaskDoDexieDB extends Dexie {
  tasks!: Table<Task, string>;
  projects!: Table<Project, string>;

  constructor() {
    super('TaskDoDB');
    this.version(1).stores({
      tasks: 'id, status, priority, dueDate, projectId, createdAt',
      projects: 'id, name, createdAt',
    });
  }
}

export class IndexedDBAdapter implements ITaskStorage {
  readonly providerName = 'IndexedDB (Dexie.js)';
  readonly isRemote = false;
  private db: TaskDoDexieDB;
  private initialized = false;

  constructor() {
    this.db = new TaskDoDexieDB();
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    await this.db.open();
    
    // Check if initial seeding is required
    const tasksCount = await this.db.tasks.count();
    const projectsCount = await this.db.projects.count();
    
    if (tasksCount === 0 && projectsCount === 0) {
      const { projects, tasks } = getInitialSeedData();
      await this.db.projects.bulkAdd(projects);
      await this.db.tasks.bulkAdd(tasks);
    }
    
    this.initialized = true;
  }

  async getTasks(): Promise<Task[]> {
    await this.init();
    return this.db.tasks.toArray();
  }

  async saveTask(task: Task): Promise<Task> {
    await this.init();
    await this.db.tasks.put(task);
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    await this.init();
    const existing = await this.db.tasks.get(id);
    if (!existing) {
      throw new Error(`Task with ID ${id} not found.`);
    }
    const updated: Task = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await this.db.tasks.put(updated);
    return updated;
  }

  async deleteTask(id: string): Promise<void> {
    await this.init();
    await this.db.tasks.delete(id);
  }

  async getProjects(): Promise<Project[]> {
    await this.init();
    return this.db.projects.toArray();
  }

  async saveProject(project: Project): Promise<Project> {
    await this.init();
    await this.db.projects.put(project);
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    await this.init();
    const existing = await this.db.projects.get(id);
    if (!existing) {
      throw new Error(`Project with ID ${id} not found.`);
    }
    const updated: Project = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await this.db.projects.put(updated);
    return updated;
  }

  async deleteProject(id: string, cascadeOrUnassignTasks: boolean): Promise<void> {
    await this.init();
    await this.db.transaction('rw', this.db.projects, this.db.tasks, async () => {
      await this.db.projects.delete(id);
      
      const associatedTasks = await this.db.tasks.where('projectId').equals(id).toArray();
      if (cascadeOrUnassignTasks) {
        // Cascade delete
        const taskIds = associatedTasks.map(t => t.id);
        await this.db.tasks.bulkDelete(taskIds);
      } else {
        // Unassign project from tasks
        for (const t of associatedTasks) {
          await this.db.tasks.update(t.id, { projectId: undefined, updatedAt: new Date().toISOString() });
        }
      }
    });
  }

  async exportAll(config?: AppConfig): Promise<StorageExportPayload> {
    await this.init();
    const tasks = await this.db.tasks.toArray();
    const projects = await this.db.projects.toArray();
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      tasks,
      projects,
      config,
    };
  }

  async importAll(data: { tasks?: Task[]; projects?: Project[] }): Promise<{ tasksCount: number; projectsCount: number }> {
    await this.init();
    let tasksCount = 0;
    let projectsCount = 0;

    await this.db.transaction('rw', this.db.projects, this.db.tasks, async () => {
      if (data.projects && data.projects.length > 0) {
        for (const p of data.projects) {
          await this.db.projects.put(p);
          projectsCount++;
        }
      }
      if (data.tasks && data.tasks.length > 0) {
        for (const t of data.tasks) {
          await this.db.tasks.put(t);
          tasksCount++;
        }
      }
    });

    return { tasksCount, projectsCount };
  }

  async resetAll(): Promise<void> {
    await this.init();
    await this.db.tasks.clear();
    await this.db.projects.clear();
    const { projects, tasks } = getInitialSeedData();
    await this.db.projects.bulkAdd(projects);
    await this.db.tasks.bulkAdd(tasks);
  }

  async testConnection(): Promise<{ ok: boolean; message: string }> {
    try {
      await this.init();
      return { ok: true, message: 'IndexedDB storage is active and functioning perfectly.' };
    } catch (err) {
      return { ok: false, message: (err as Error).message };
    }
  }
}
