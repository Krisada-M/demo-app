import {
  getSdkStatus,
  initialize,
  Permission,
  requestPermission,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';
import { DailyMetrics, HealthStatus, HourlyMetrics } from '../models';
import {
  createEmptyDailySeries,
  createEmptyHourlySeries,
} from '../utils/timeBuckets';
import {
  ensureActivityPermissions,
  getDailyLast7Days as getDailyLast7DaysNative,
  getTodayHourlyBuckets as getTodayHourlyBucketsNative,
  startTracking,
  syncNow,
} from '../android/HealthTracking';

const PERMISSIONS: Permission[] = [
  { accessType: 'read', recordType: 'Steps' },
  { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
  { accessType: 'read', recordType: 'Distance' },
  { accessType: 'write', recordType: 'Steps' },
  { accessType: 'write', recordType: 'ActiveCaloriesBurned' },
  { accessType: 'write', recordType: 'Distance' },
];

export const ensurePermissions = async (): Promise<HealthStatus> => {
  try {
    const status = await getSdkStatus();
    if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
      return HealthStatus.NOT_SUPPORTED;
    }

    const isInitialized = await initialize();
    if (!isInitialized) return HealthStatus.UNKNOWN;

    const grantedPermissions = await requestPermission(PERMISSIONS);
    const grantedSet = new Set(
      grantedPermissions.map(
        permission => `${permission.accessType}:${permission.recordType}`,
      ),
    );
    const allGranted = PERMISSIONS.every(permission =>
      grantedSet.has(`${permission.accessType}:${permission.recordType}`),
    );
    if (!allGranted) return HealthStatus.NOT_AUTHORIZED;

    const activityGranted = await ensureActivityPermissions();
    if (!activityGranted) return HealthStatus.NOT_AUTHORIZED;

    startTracking();
    syncNow();

    return HealthStatus.OK;
  } catch (error) {
    console.error('Android Health Connect Auth Error:', error);
    return HealthStatus.NOT_AUTHORIZED;
  }
};

export const getDailyLast7Days = async (): Promise<DailyMetrics[]> => {
  try {
    const data = await getDailyLast7DaysNative();
    return data.map(day => ({
      date: day.date,
      steps: Math.round(day.steps ?? 0),
      activeCaloriesKcal: Math.round(day.activeCaloriesKcal ?? 0),
      distanceMeters: Math.round(day.distanceMeters ?? 0),
    }));
  } catch (error) {
    console.error('Android getDailyLast7Days error:', error);
    return createEmptyDailySeries();
  }
};

export const getTodayHourly = async (): Promise<HourlyMetrics[]> => {
  try {
    const data = await getTodayHourlyBucketsNative();
    return data.map((hour: HourlyMetrics) => ({
      hourIndex: hour.hourIndex,
      steps: Math.round(hour.steps ?? 0),
      activeCaloriesKcal: Math.round(hour.activeCaloriesKcal ?? 0),
      distanceMeters: Math.round(hour.distanceMeters ?? 0),
    }));
  } catch (error) {
    console.error('Android getTodayHourly error:', error);
    return createEmptyHourlySeries();
  }
};
