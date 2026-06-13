import { create } from 'zustand';
import { UsageStats, TaskType } from '../types';
import { storageService } from '../services/storageService';

interface StatsState {
  weeklyStats: UsageStats[];
  totalCount: number;
  successCount: number;
  topFunctions: { name: string; count: number }[];
  loadWeeklyStats: () => void;
  recordUsage: (taskType: TaskType, success: boolean) => void;
  getStatsByType: (taskType: TaskType) => number;
}

export const useStatsStore = create<StatsState>((set, get) => ({
  weeklyStats: [],
  totalCount: 0,
  successCount: 0,
  topFunctions: [],

  loadWeeklyStats: () => {
    const allStats = storageService.loadStats();
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weeklyStats = allStats.filter(stat => {
      const statDate = new Date(stat.date);
      return statDate >= weekAgo && statDate <= now;
    });

    const totalCount = weeklyStats.reduce((sum, stat) => sum + stat.count, 0);
    const successCount = weeklyStats.reduce((sum, stat) => sum + stat.successCount, 0);

    const typeCountMap: Record<string, number> = {};
    weeklyStats.forEach(stat => {
      typeCountMap[stat.taskType] = (typeCountMap[stat.taskType] || 0) + stat.count;
    });

    const topFunctions = Object.entries(typeCountMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    set({ weeklyStats, totalCount, successCount, topFunctions });
  },

  recordUsage: (taskType, success) => {
    const today = new Date().toISOString().split('T')[0];

    set(state => {
      const existingIndex = state.weeklyStats.findIndex(
        stat => stat.date === today && stat.taskType === taskType
      );

      let newStats: UsageStats[];

      if (existingIndex >= 0) {
        newStats = state.weeklyStats.map((stat, index) =>
          index === existingIndex
            ? {
                ...stat,
                count: stat.count + 1,
                successCount: success ? stat.successCount + 1 : stat.successCount,
              }
            : stat
        );
      } else {
        newStats = [
          ...state.weeklyStats,
          {
            date: today,
            taskType,
            count: 1,
            successCount: success ? 1 : 0,
            userId: 'current',
          },
        ];
      }

      const totalCount = newStats.reduce((sum, stat) => sum + stat.count, 0);
      const successCount = newStats.reduce((sum, stat) => sum + stat.successCount, 0);

      storageService.saveStats(newStats);

      return {
        weeklyStats: newStats,
        totalCount,
        successCount,
      };
    });
  },

  getStatsByType: (taskType) => {
    const { weeklyStats } = get();
    return weeklyStats
      .filter(stat => stat.taskType === taskType)
      .reduce((sum, stat) => sum + stat.count, 0);
  },
}));
