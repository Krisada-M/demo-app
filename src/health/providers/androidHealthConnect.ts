import {
  aggregateGroupByDuration,
  aggregateRecord,
  getSdkStatus,
  initialize,
  insertRecords,
  Permission,
  readRecords,
  requestPermission,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';
import {
  DailyMetrics,
  HealthStatus,
  HourlyMetrics,
  createStoreSources,
} from '../models';
import {
  createEmptyDailySeries,
  createEmptyHourlySeries,
  formatDate,
  getLast7DaysRanges,
  getTodayHourlyRanges,
  toLocalISOString,
} from '../utils/timeBuckets';

type MetricRecordType = 'Steps' | 'ActiveCaloriesBurned' | 'Distance';

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

    return HealthStatus.OK;
  } catch (error) {
    console.error('Android Health Connect Auth Error:', error);
    return HealthStatus.NOT_AUTHORIZED;
  }
};

export const getDailyLast7Days = async (): Promise<DailyMetrics[]> => {
  try {
    const ranges = getLast7DaysRanges();
    if (ranges.length === 0) return [];

    const [steps, calories, distance] = await Promise.all([
      getDailySeries('Steps', ranges),
      getDailySeries('ActiveCaloriesBurned', ranges),
      getDailySeries('Distance', ranges),
    ]);

    return ranges.map((range, index) => ({
      date: formatDate(range.date),
      steps: Math.round(steps[index] ?? 0),
      activeCaloriesKcal: Math.round(calories[index] ?? 0),
      distanceMeters: Math.round(distance[index] ?? 0),
      sources: createStoreSources(),
    }));
  } catch (error) {
    console.error('Android getDailyLast7Days error:', error);
    return createEmptyDailySeries();
  }
};

export const mockWriteRecords = async (): Promise<void> => {
  try {
    const today = new Date();
    const startTime = new Date(today);
    startTime.setHours(today.getHours() - 1, 0, 0, 0);
    const endTime = new Date(today);
    endTime.setHours(today.getHours(), 0, 0, 0);

    const steps = [
      {
        recordType: 'Steps',
        count: 1250,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      },
    ];
    const calories = [
      {
        recordType: 'ActiveCaloriesBurned',
        energy: { value: 45.5, unit: 'kilocalories' },
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      },
    ];
    const distance = [
      {
        recordType: 'Distance',
        distance: { value: 850.0, unit: 'meters' },
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      },
    ];

    console.log('[HealthConnect] Starting isolated mock injection...');
    
    try {
      const res = await insertRecords(steps as any);
      console.log('[HealthConnect] Steps mock OK:', res);
    } catch (e: any) {
      console.error('[HealthConnect] Steps mock FAILED:', e.message);
    }

    try {
      const res = await insertRecords(calories as any);
      console.log('[HealthConnect] Calories mock OK:', res);
    } catch (e: any) {
      console.error('[HealthConnect] Calories mock FAILED:', e.message);
    }

    try {
      const res = await insertRecords(distance as any);
      console.log('[HealthConnect] Distance mock OK:', res);
    } catch (e: any) {
      console.error('[HealthConnect] Distance mock FAILED:', e.message);
    }
    
    console.log('[HealthConnect] Mock injection process completed.');
  } catch (error) {
    console.error('Android mockWriteRecords error:', error);
    throw error;
  }
};

export const getTodayHourly = async (): Promise<HourlyMetrics[]> => {
  try {
    const ranges = getTodayHourlyRanges();
    if (ranges.length === 0) return [];

    const [steps, calories, distance] = await Promise.all([
      getHourlySeries('Steps', ranges),
      getHourlySeries('ActiveCaloriesBurned', ranges),
      getHourlySeries('Distance', ranges),
    ]);

    return ranges.map((range, index) => ({
      hourIndex: range.hourIndex,
      steps: Math.round(steps[index] ?? 0),
      activeCaloriesKcal: Math.round(calories[index] ?? 0),
      distanceMeters: Math.round(distance[index] ?? 0),
      sources: createStoreSources(),
    }));
  } catch (error) {
    console.error('Android getTodayHourly error:', error);
    return createEmptyHourlySeries();
  }
};

const getDailySeries = async (
  recordType: MetricRecordType,
  ranges: { date: Date; start: Date; end: Date }[],
): Promise<number[]> => {
  const start = ranges[0].start;
  const end = ranges[ranges.length - 1].end;

  const grouped = await aggregateByDuration(recordType, start, end, 'DAYS');
  if (grouped) {
    return ranges.map(({ date }) => grouped.get(formatDate(date)) ?? 0);
  }

  const fromRecords = await sumRecordsByDay(recordType, start, end);
  if (fromRecords) {
    return ranges.map(({ date }) => fromRecords.get(formatDate(date)) ?? 0);
  }

  return ranges.map(() => 0);
};

const getHourlySeries = async (
  recordType: MetricRecordType,
  ranges: { hourIndex: number; start: Date; end: Date }[],
): Promise<number[]> => {
  const start = ranges[0].start;
  const end = ranges[ranges.length - 1].end;

  const grouped = await aggregateByDuration(recordType, start, end, 'HOURS');
  if (grouped) {
    return ranges.map(({ hourIndex }) => grouped.get(hourIndex) ?? 0);
  }

  const fromRecords = await sumRecordsByHour(recordType, start, end);
  if (fromRecords) {
    return ranges.map(({ hourIndex }) => fromRecords.get(hourIndex) ?? 0);
  }

  return ranges.map(() => 0);
};

const aggregateByDuration = async (
  recordType: MetricRecordType,
  start: Date,
  end: Date,
  duration: 'HOURS' | 'DAYS',
): Promise<Map<string | number, number> | null> => {
  try {
    const groups = await aggregateGroupByDuration({
      recordType,
      timeRangeFilter: {
        operator: 'between',
        startTime: toLocalISOString(start),
        endTime: toLocalISOString(end),
      },
      timeRangeSlicer: {
        duration,
        length: 1,
      },
    });

    const results = new Map<string | number, number>();
    groups.forEach(group => {
      const date = new Date(group.startTime);
      const key = duration === 'DAYS' ? formatDate(date) : date.getHours();
      results.set(key, getAggregateValue(recordType, group.result));
    });

    return results;
  } catch (error) {
    console.warn(
      'Android aggregateGroupByDuration failed, falling back.',
      error,
    );
    return null;
  }
};

const sumRecordsByDay = async (
  recordType: MetricRecordType,
  start: Date,
  end: Date,
): Promise<Map<string, number> | null> => {
  try {
    const result = await readRecords(recordType, {
      timeRangeFilter: {
        operator: 'between',
        startTime: toLocalISOString(start),
        endTime: toLocalISOString(end),
      },
    });

    const totals = new Map<string, number>();
    result.records.forEach(record => {
      const key = formatDate(new Date(record.startTime));
      totals.set(
        key,
        (totals.get(key) ?? 0) + getRecordValue(recordType, record),
      );
    });

    return totals;
  } catch (error) {
    console.warn('Android readRecords daily fallback failed.', error);
    return null;
  }
};

const sumRecordsByHour = async (
  recordType: MetricRecordType,
  start: Date,
  end: Date,
): Promise<Map<number, number> | null> => {
  try {
    const result = await readRecords(recordType, {
      timeRangeFilter: {
        operator: 'between',
        startTime: toLocalISOString(start),
        endTime: toLocalISOString(end),
      },
    });

    const totals = new Map<number, number>();
    result.records.forEach(record => {
      const key = new Date(record.startTime).getHours();
      totals.set(
        key,
        (totals.get(key) ?? 0) + getRecordValue(recordType, record),
      );
    });

    return totals;
  } catch (error) {
    console.warn('Android readRecords hourly fallback failed.', error);
    return null;
  }
};

const getAggregateValue = (
  recordType: MetricRecordType,
  result: any,
): number => {
  if (recordType === 'Steps') {
    return result.COUNT_TOTAL ?? 0;
  }
  if (recordType === 'ActiveCaloriesBurned') {
    return result.ACTIVE_CALORIES_TOTAL?.inKilocalories ?? 0;
  }
  if (recordType === 'Distance') {
    return result.DISTANCE?.inMeters ?? 0;
  }
  return 0;
};

const getRecordValue = (recordType: MetricRecordType, record: any): number => {
  if (recordType === 'Steps') {
    return record.count ?? 0;
  }
  if (recordType === 'ActiveCaloriesBurned') {
    return record.energy?.inKilocalories ?? 0;
  }
  if (recordType === 'Distance') {
    return record.distance?.inMeters ?? 0;
  }
  return 0;
};
