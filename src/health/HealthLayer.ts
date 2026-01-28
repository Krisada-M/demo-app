import { Platform } from 'react-native';
import * as iosProvider from './providers/iosHealthKit';
import * as androidProvider from './providers/androidHealthConnect';
import { DailyMetrics, HealthStatus, HourlyMetrics } from './models';
import type { HealthProvider } from './HealthProvider';
import {
  createEmptyDailySeries,
  createEmptyHourlySeries,
} from './utils/timeBuckets';

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
      return await provider.ensurePermissions();
    } catch (error) {
      console.error('HealthLayer ensurePermissions error:', error);
      return HealthStatus.UNKNOWN;
    }
  },

  getDailyLast7Days: async (): Promise<DailyMetrics[]> => {
    try {
      return await provider.getDailyLast7Days();
    } catch (error) {
      console.error('HealthLayer getDailyLast7Days error:', error);
      return createEmptyDailySeries();
    }
  },

  getTodayHourly: async (): Promise<HourlyMetrics[]> => {
    try {
      return await provider.getTodayHourly();
    } catch (error) {
      console.error('HealthLayer getTodayHourly error:', error);
      return createEmptyHourlySeries();
    }
  },
};
