import { Task, BrandTone, Template, User, UsageStats } from '../types';

const STORAGE_KEYS = {
  TASKS: 'ai_toolbox_tasks',
  BRAND_TONES: 'ai_toolbox_brand_tones',
  TEMPLATES: 'ai_toolbox_templates',
  USER: 'ai_toolbox_user',
  STATS: 'ai_toolbox_stats',
};

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export const storageService = {
  saveTasks(tasks: Task[]): void {
    setItem(STORAGE_KEYS.TASKS, tasks.slice(0, 100));
  },

  loadTasks(): Task[] {
    return getItem<Task[]>(STORAGE_KEYS.TASKS, []);
  },

  saveBrandTones(tones: BrandTone[]): void {
    setItem(STORAGE_KEYS.BRAND_TONES, tones);
  },

  loadBrandTones(): BrandTone[] {
    return getItem<BrandTone[]>(STORAGE_KEYS.BRAND_TONES, []);
  },

  saveTemplates(templates: Template[]): void {
    setItem(STORAGE_KEYS.TEMPLATES, templates);
  },

  loadTemplates(): Template[] {
    return getItem<Template[]>(STORAGE_KEYS.TEMPLATES, []);
  },

  saveUser(user: User | null): void {
    if (user) {
      setItem(STORAGE_KEYS.USER, user);
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  loadUser(): User | null {
    return getItem<User | null>(STORAGE_KEYS.USER, null);
  },

  saveStats(stats: UsageStats[]): void {
    setItem(STORAGE_KEYS.STATS, stats);
  },

  loadStats(): UsageStats[] {
    return getItem<UsageStats[]>(STORAGE_KEYS.STATS, []);
  },

  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },

  exportData(): string {
    const data = {
      tasks: this.loadTasks(),
      brandTones: this.loadBrandTones(),
      templates: this.loadTemplates(),
      stats: this.loadStats(),
    };
    return JSON.stringify(data, null, 2);
  },

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.tasks) this.saveTasks(data.tasks);
      if (data.brandTones) this.saveBrandTones(data.brandTones);
      if (data.templates) this.saveTemplates(data.templates);
      if (data.stats) this.saveStats(data.stats);
      return true;
    } catch {
      return false;
    }
  },
};
