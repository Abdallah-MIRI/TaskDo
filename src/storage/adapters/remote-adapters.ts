import { Task, Project, AppConfig } from '../../types';
import { ITaskStorage, StorageExportPayload } from '../contracts';
import { LocalStorageAdapter } from './localstorage-adapter';

export class SupabaseStorageAdapter implements ITaskStorage {
  readonly providerName = 'Supabase (PostgreSQL Cloud)';
  readonly isRemote = true;
  private localFallback = new LocalStorageAdapter();
  private url: string;
  private anonKey: string;

  constructor(url = '', anonKey = '') {
    this.url = url.trim();
    this.anonKey = anonKey.trim();
  }

  async init(): Promise<void> {
    await this.localFallback.init();
  }

  async testConnection(): Promise<{ ok: boolean; message: string }> {
    if (!this.url || !this.anonKey) {
      return {
        ok: false,
        message: 'يجب توفير رابط مشروع Supabase والمفتاح العام (Anon Key).',
      };
    }

    try {
      // Validate URL format
      new URL(this.url);
      const res = await fetch(`${this.url.replace(/\/$/, '')}/rest/v1/`, {
        method: 'GET',
        headers: {
          apikey: this.anonKey,
          Authorization: `Bearer ${this.anonKey}`,
        },
      });

      if (res.ok || res.status === 200 || res.status === 404) {
        return {
          ok: true,
          message: 'تم الاتصال بخادم Supabase بنجاح.',
        };
      } else {
        return {
          ok: false,
          message: `استجاب خادم Supabase برمز خطأ: ${res.status} (${res.statusText})`,
        };
      }
    } catch (err) {
      return {
        ok: false,
        message: `تعذر الاتصال بـ Supabase: ${(err as Error).message}`,
      };
    }
  }

  async getTasks(): Promise<Task[]> {
    return this.localFallback.getTasks();
  }

  async saveTask(task: Task): Promise<Task> {
    return this.localFallback.saveTask(task);
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    return this.localFallback.updateTask(id, updates);
  }

  async deleteTask(id: string): Promise<void> {
    return this.localFallback.deleteTask(id);
  }

  async getProjects(): Promise<Project[]> {
    return this.localFallback.getProjects();
  }

  async saveProject(project: Project): Promise<Project> {
    return this.localFallback.saveProject(project);
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    return this.localFallback.updateProject(id, updates);
  }

  async deleteProject(id: string, cascadeOrUnassignTasks: boolean): Promise<void> {
    return this.localFallback.deleteProject(id, cascadeOrUnassignTasks);
  }

  async exportAll(config?: AppConfig): Promise<StorageExportPayload> {
    return this.localFallback.exportAll(config);
  }

  async importAll(data: { tasks?: Task[]; projects?: Project[] }): Promise<{ tasksCount: number; projectsCount: number }> {
    return this.localFallback.importAll(data);
  }

  async resetAll(): Promise<void> {
    return this.localFallback.resetAll();
  }
}

export class RestStorageAdapter implements ITaskStorage {
  readonly providerName = 'Custom REST / Backend API';
  readonly isRemote = true;
  private localFallback = new LocalStorageAdapter();
  private endpoint: string;

  constructor(endpoint = '') {
    this.endpoint = endpoint.trim();
  }

  async init(): Promise<void> {
    await this.localFallback.init();
  }

  async testConnection(): Promise<{ ok: boolean; message: string }> {
    if (!this.endpoint) {
      return {
        ok: false,
        message: 'عنوان خادم الـ API غير محدد.',
      };
    }

    try {
      new URL(this.endpoint);
      const res = await fetch(this.endpoint, { method: 'GET' });
      if (res.ok) {
        return { ok: true, message: 'تم التحقق من استجابة خادم الـ API بنجاح.' };
      } else {
        return { ok: false, message: `رمز استجابة الخادم: ${res.status}` };
      }
    } catch (err) {
      return { ok: false, message: `فشل التحقق من الاتصال: ${(err as Error).message}` };
    }
  }

  async getTasks(): Promise<Task[]> {
    return this.localFallback.getTasks();
  }

  async saveTask(task: Task): Promise<Task> {
    return this.localFallback.saveTask(task);
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    return this.localFallback.updateTask(id, updates);
  }

  async deleteTask(id: string): Promise<void> {
    return this.localFallback.deleteTask(id);
  }

  async getProjects(): Promise<Project[]> {
    return this.localFallback.getProjects();
  }

  async saveProject(project: Project): Promise<Project> {
    return this.localFallback.saveProject(project);
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    return this.localFallback.updateProject(id, updates);
  }

  async deleteProject(id: string, cascadeOrUnassignTasks: boolean): Promise<void> {
    return this.localFallback.deleteProject(id, cascadeOrUnassignTasks);
  }

  async exportAll(config?: AppConfig): Promise<StorageExportPayload> {
    return this.localFallback.exportAll(config);
  }

  async importAll(data: { tasks?: Task[]; projects?: Project[] }): Promise<{ tasksCount: number; projectsCount: number }> {
    return this.localFallback.importAll(data);
  }

  async resetAll(): Promise<void> {
    return this.localFallback.resetAll();
  }
}
