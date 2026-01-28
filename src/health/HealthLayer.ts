import { Platform } from 'react-native';
import * as iosProvider from './providers/iosHealthKit';
import * as androidProvider from './providers/androidHealthConnect';
import { DailyMetrics, HealthStatus, HourlyMetrics } from './models';
import type { HealthProvider } from './HealthProvider';
import {
  createEmptyDailySeries,
  createEmptyHourlySeries,
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

export const HealthLayer = {
  ensurePermissions: async (): Promise<HealthStatus> => {
    try {
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
};
