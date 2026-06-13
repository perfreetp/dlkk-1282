import { create } from 'zustand';
import { User, BrandTone, Template, TaskType } from '../types';
import { storageService } from '../services/storageService';
import { generateId } from '../utils/formatters';

interface UserState {
  user: User | null;
  brandTones: BrandTone[];
  templates: Template[];
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  addBrandTone: (tone: Omit<BrandTone, 'id' | 'createdAt' | 'createdBy'>) => void;
  updateBrandTone: (id: string, updates: Partial<BrandTone>) => void;
  deleteBrandTone: (id: string) => void;
  addTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'userId'>) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  loadUserData: () => void;
  initializeUser: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  brandTones: [],
  templates: [],
  isInitialized: false,

  setUser: (user) => {
    storageService.saveUser(user);
    set({ user });
  },

  addBrandTone: (tone) => {
    const { user } = get();
    const newTone: BrandTone = {
      ...tone,
      id: generateId(),
      createdBy: user?.id || 'system',
      createdAt: new Date(),
    };

    set(state => {
      const brandTones = [...state.brandTones, newTone];
      storageService.saveBrandTones(brandTones);
      return { brandTones };
    });
  },

  updateBrandTone: (id, updates) => {
    set(state => {
      const brandTones = state.brandTones.map(tone =>
        tone.id === id ? { ...tone, ...updates } : tone
      );
      storageService.saveBrandTones(brandTones);
      return { brandTones };
    });
  },

  deleteBrandTone: (id) => {
    set(state => {
      const brandTones = state.brandTones.filter(tone => tone.id !== id);
      storageService.saveBrandTones(brandTones);
      return { brandTones };
    });
  },

  addTemplate: (template) => {
    const { user } = get();
    const newTemplate: Template = {
      ...template,
      id: generateId(),
      createdAt: new Date(),
      userId: user?.id || 'system',
    };

    set(state => {
      const templates = [newTemplate, ...state.templates];
      storageService.saveTemplates(templates);
      return { templates };
    });
  },

  updateTemplate: (id, updates) => {
    set(state => {
      const templates = state.templates.map(template =>
        template.id === id ? { ...template, ...updates } : template
      );
      storageService.saveTemplates(templates);
      return { templates };
    });
  },

  deleteTemplate: (id) => {
    set(state => {
      const templates = state.templates.filter(template => template.id !== id);
      storageService.saveTemplates(templates);
      return { templates };
    });
  },

  loadUserData: () => {
    const user = storageService.loadUser();
    const brandTones = storageService.loadBrandTones();
    const templates = storageService.loadTemplates();

    set({ user, brandTones, templates, isInitialized: true });
  },

  initializeUser: () => {
    const existingUser = storageService.loadUser();
    if (!existingUser) {
      const newUser: User = {
        id: generateId(),
        name: '运营专员',
        email: 'operator@example.com',
        role: 'member',
        createdAt: new Date(),
      };
      storageService.saveUser(newUser);
      set({ user: newUser });
    }
    get().loadUserData();
  },
}));
