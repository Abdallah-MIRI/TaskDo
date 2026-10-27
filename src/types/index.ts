export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string; // YYYY-MM-DD
  projectId?: string;
  tags?: string[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
  completedAt?: string; // ISO
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string; // hex
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export type StorageProviderType = 
  | 'indexeddb' 
  | 'localstorage' 
  | 'supabase' 
  | 'postgresql' 
  | 'rest_api';

export type DeploymentMode = 
  | 'github_pages' 
  | 'local_dev' 
  | 'self_hosted';

export type WorkspaceMode = 
  | 'single_device' 
  | 'sync_devices' 
  | 'shared_team';

export interface AppConfig {
  language: 'ar' | 'en';
  storageProvider: StorageProviderType;
  deploymentMode: DeploymentMode;
  workspaceMode: WorkspaceMode;
  setupCompleted: boolean;
  theme: 'light' | 'system';
  supabaseConfig?: {
    url: string;
    anonKey: string;
    isConfigured: boolean;
  };
  postgresConfig?: {
    apiEndpoint: string;
    isConfigured: boolean;
  };
  restApiConfig?: {
    baseUrl: string;
    apiKey?: string;
    isConfigured: boolean;
  };
}

export interface TaskFilterOptions {
  searchQuery?: string;
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  projectId?: string | 'all';
  dueRange?: 'all' | 'today' | 'upcoming' | 'overdue';
}

export type TaskSortOption = 
  | 'dueDate_asc' 
  | 'dueDate_desc' 
  | 'priority_desc' 
  | 'title_asc' 
  | 'createdAt_desc';

export interface ProjectWithStats extends Project {
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  dueTodayTasks: number;
  upcomingTasks: number;
  completionRate: number;
}
