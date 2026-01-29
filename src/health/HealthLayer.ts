import { Platform } from 'react-native';
import * as iosProvider from './providers/iosHealthKit';
import * as androidProvider from './providers/androidHealthConnect';
import {
  DailyMetrics,
  HealthStatus,
  HourlyMetrics,
  createStoreSources,
} from './models';
import type { HealthProvider } from './HealthProvider';
import {
  createEmptyDailySeries,
  createEmptyHourlySeries,
  formatDate,
} from './utils/timeBuckets';
import { applyDailyFallbacks, applyHourlyFallbacks } from './utils/fallbacks';
import { getUserProfile, setUserProfile } from './userProfile';

const fallbackProvider: HealthProvider = {
  ensurePermissions: async () => HealthStatus.NOT_SUPPORTED,
  getDailyLast7Days: async () => createEmptyDailySeries(),
  getTodayHourly: async () => createEmptyHourlySeries(),
};

const provider: HealthProvider =
  Platform.OS === 'ios'
    ? iosProvider
    : Platform.OS === 'android'
    ? androidProvider
    : fallbackProvider;

let useMockData = false;

export const HealthLayer = {
  setMockData: (enabled: boolean) => {
    useMockData = enabled;
  },
  
  ensurePermissions: async (): Promise<HealthStatus> => {
    try {
      if (useMockData) return HealthStatus.OK;
      const status = await provider.ensurePermissions();
      console.log('[HealthLayer] permissions', {
        platform: Platform.OS,
        status,
      });
      return status;
    } catch (error) {
      console.error('HealthLayer ensurePermissions error:', error);
      return HealthStatus.UNKNOWN;
    }
  },

  getDailyLast7Days: async (): Promise<DailyMetrics[]> => {
    try {
      const todayStr = formatDate(new Date());
      const mockData: DailyMetrics[] = [
        { date: '2026-01-23', steps: 8432, activeCaloriesKcal: 420, distanceMeters: 5200, sources: createStoreSources() },
        { date: '2026-01-24', steps: 11204, activeCaloriesKcal: 560, distanceMeters: 7100, sources: createStoreSources() },
        { date: '2026-01-25', steps: 9800, activeCaloriesKcal: 490, distanceMeters: 6200, sources: createStoreSources() },
        { date: '2026-01-26', steps: 12400, activeCaloriesKcal: 620, distanceMeters: 8000, sources: createStoreSources() },
        { date: '2026-01-27', steps: 7600, activeCaloriesKcal: 380, distanceMeters: 4800, sources: createStoreSources() },
        { date: '2026-01-28', steps: 10254, activeCaloriesKcal: 512, distanceMeters: 7800, sources: createStoreSources() },
        { date: todayStr, steps: 10254, activeCaloriesKcal: 1850.5, distanceMeters: 7800, sources: createStoreSources() },
      ];

      if (useMockData) {
        const { data } = applyDailyFallbacks(mockData);
        return data;
      }

      const storeData = await provider.getDailyLast7Days();
      const { data, stats } = applyDailyFallbacks(storeData);
      if (stats.missingDistance || stats.missingCalories) {
        console.log('[HealthLayer] daily missing data', {
          missingDistance: stats.missingDistance,
          missingCalories: stats.missingCalories,
        });
      }
      if (stats.distanceEstimated || stats.caloriesEstimated) {
        console.log('[HealthLayer] daily fallback usage', {
          distanceEstimated: stats.distanceEstimated,
          caloriesEstimated: stats.caloriesEstimated,
          caloriesClamped: stats.caloriesClamped,
        });
      }
      return data;
    } catch (error) {
      console.error('HealthLayer getDailyLast7Days error:', error);
      return createEmptyDailySeries();
    }
  },

  getTodayHourly: async (): Promise<HourlyMetrics[]> => {
    try {
      if (useMockData) {
        // Return some logical hourly mock data if needed, or just standard empty with fallbacks
        const { data } = applyHourlyFallbacks(createEmptyHourlySeries());
        return data;
      }
      const storeData = await provider.getTodayHourly();
      const { data, stats } = applyHourlyFallbacks(storeData);
      if (stats.missingDistance || stats.missingCalories) {
        console.log('[HealthLayer] hourly missing data', {
          missingDistance: stats.missingDistance,
          missingCalories: stats.missingCalories,
        });
      }
      if (stats.distanceEstimated || stats.caloriesEstimated) {
        console.log('[HealthLayer] hourly fallback usage', {
          distanceEstimated: stats.distanceEstimated,
          caloriesEstimated: stats.caloriesEstimated,
          caloriesClamped: stats.caloriesClamped,
        });
      }
      return data;
    } catch (error) {
      console.error('HealthLayer getTodayHourly error:', error);
      return createEmptyHourlySeries();
    }
  },
  setUserProfile,
  getUserProfile,
  
  mockWrite: async (): Promise<void> => {
    if (Platform.OS !== 'android') return;
    try {
      await androidProvider.mockWriteRecords();
    } catch (error) {
      console.error('HealthLayer mockWrite error:', error);
      throw error;
    }
  },
};
