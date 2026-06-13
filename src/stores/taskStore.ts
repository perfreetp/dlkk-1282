import { create } from 'zustand';
import { Task, TaskType, Output } from '../types';
import { storageService } from '../services/storageService';
import { generateId } from '../utils/formatters';

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  isLoading: boolean;
  addTask: (type: TaskType, input: string, outputs: Output[], category?: string) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setCurrentTask: (task: Task | null) => void;
  setTaskOutputs: (id: string, outputs: Output[]) => void;
  selectOutput: (id: string, index: number) => void;
  markOutput: (taskId: string, outputIndex: number, status: 'available' | 'pending' | 'rejected') => void;
  loadTasks: () => void;
  setLoading: (loading: boolean) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  currentTask: null,
  isLoading: false,

  addTask: (type, input, outputs, category) => {
    const newTask: Task = {
      id: generateId(),
      type,
      input,
      category,
      outputs,
      selectedIndex: outputs.length > 0 ? 0 : -1,
      status: outputs.length > 0 ? 'completed' : 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set(state => {
      const tasks = [newTask, ...state.tasks];
      storageService.saveTasks(tasks);
      return { tasks, currentTask: newTask };
    });

    return newTask.id;
  },

  updateTask: (id, updates) => {
    set(state => {
      const tasks = state.tasks.map(task =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      );
      storageService.saveTasks(tasks);

      const currentTask = state.currentTask?.id === id
        ? { ...state.currentTask, ...updates, updatedAt: new Date() }
        : state.currentTask;

      return { tasks, currentTask };
    });
  },

  deleteTask: (id) => {
    set(state => {
      const tasks = state.tasks.filter(task => task.id !== id);
      storageService.saveTasks(tasks);

      const currentTask = state.currentTask?.id === id ? null : state.currentTask;

      return { tasks, currentTask };
    });
  },

  setCurrentTask: (task) => {
    set({ currentTask: task });
  },

  setTaskOutputs: (id, outputs) => {
    set(state => {
      const tasks = state.tasks.map(task =>
        task.id === id
          ? {
              ...task,
              outputs,
              selectedIndex: 0,
              status: 'completed' as const,
              updatedAt: new Date(),
            }
          : task
      );
      storageService.saveTasks(tasks);

      const currentTask = state.currentTask?.id === id
        ? {
            ...state.currentTask,
            outputs,
            selectedIndex: 0,
            status: 'completed' as const,
            updatedAt: new Date(),
          }
        : state.currentTask;

      return { tasks, currentTask };
    });
  },

  selectOutput: (id, index) => {
    set(state => {
      const tasks = state.tasks.map(task =>
        task.id === id
          ? { ...task, selectedIndex: index, updatedAt: new Date() }
          : task
      );
      storageService.saveTasks(tasks);

      const currentTask = state.currentTask?.id === id
        ? { ...state.currentTask, selectedIndex: index, updatedAt: new Date() }
        : state.currentTask;

      return { tasks, currentTask };
    });
  },

  markOutput: (taskId, outputIndex, status) => {
    set(state => {
      const tasks = state.tasks.map(task => {
        if (task.id !== taskId) return task;

        const outputs = task.outputs.map((output, index) =>
          index === outputIndex
            ? { ...output, markStatus: status, isMarked: status === 'available' }
            : output
        );

        return { ...task, outputs, updatedAt: new Date() };
      });

      storageService.saveTasks(tasks);

      const currentTask = state.currentTask?.id === taskId
        ? (() => {
            const outputs = state.currentTask.outputs.map((output, index) =>
              index === outputIndex
                ? { ...output, markStatus: status, isMarked: status === 'available' }
                : output
            );
            return { ...state.currentTask, outputs, updatedAt: new Date() };
          })()
        : state.currentTask;

      return { tasks, currentTask };
    });
  },

  loadTasks: () => {
    const tasks = storageService.loadTasks();
    set({ tasks });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },
}));
