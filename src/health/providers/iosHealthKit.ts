import HealthKit, {
  QuantityTypeIdentifier,
  StatisticsOptions,
} from '@kingstinct/react-native-healthkit';
import { DailyMetrics, HealthStatus, HourlyMetrics } from '../models';
import {
  createEmptyDailySeries,
  createEmptyHourlySeries,
  formatDate,
  getLast7DaysRanges,
  getTodayHourlyRanges,
} from '../utils/timeBuckets';

const PERMISSIONS = [
  'HKQuantityTypeIdentifierStepCount',
  'HKQuantityTypeIdentifierActiveEnergyBurned',
  'HKQuantityTypeIdentifierDistanceWalkingRunning',
] as QuantityTypeIdentifier[];

const STATISTICS: StatisticsOptions[] = ['cumulativeSum'];

const UNIT_BY_IDENTIFIER: Record<string, string> = {
  HKQuantityTypeIdentifierStepCount: 'count',
  HKQuantityTypeIdentifierActiveEnergyBurned: 'kcal',
  HKQuantityTypeIdentifierDistanceWalkingRunning: 'm',
};

export const ensurePermissions = async (): Promise<HealthStatus> => {
  try {
    const isAvailable =
      typeof HealthKit.isHealthDataAvailableAsync === 'function'
        ? await HealthKit.isHealthDataAvailableAsync()
        : HealthKit.isHealthDataAvailable();
    if (!isAvailable) return HealthStatus.NOT_SUPPORTED;

    const granted = await HealthKit.requestAuthorization({
      toRead: PERMISSIONS,
    });
    return granted ? HealthStatus.OK : HealthStatus.NOT_AUTHORIZED;
  } catch (error) {
    console.error('iOS HealthKit Auth Error:', error);
    return HealthStatus.NOT_AUTHORIZED;
  }
};

export const getDailyLast7Days = async (): Promise<DailyMetrics[]> => {
  try {
    const ranges = getLast7DaysRanges();
    if (ranges.length === 0) return [];

    const [steps, calories, distance] = await Promise.all([
      getDailySeries('HKQuantityTypeIdentifierStepCount', ranges),
      getDailySeries('HKQuantityTypeIdentifierActiveEnergyBurned', ranges),
      getDailySeries('HKQuantityTypeIdentifierDistanceWalkingRunning', ranges),
    ]);

    return ranges.map((range, index) => ({
      date: formatDate(range.date),
      steps: Math.round(steps[index] ?? 0),
      activeCaloriesKcal: Math.round(calories[index] ?? 0),
      distanceMeters: Math.round(distance[index] ?? 0),
    }));
  } catch (error) {
    console.error('iOS getDailyLast7Days error:', error);
    return createEmptyDailySeries();
  }
};

export const getTodayHourly = async (): Promise<HourlyMetrics[]> => {
  try {
    const ranges = getTodayHourlyRanges();
    if (ranges.length === 0) return [];

    const [steps, calories, distance] = await Promise.all([
      getHourlySeries('HKQuantityTypeIdentifierStepCount', ranges),
      getHourlySeries('HKQuantityTypeIdentifierActiveEnergyBurned', ranges),
      getHourlySeries('HKQuantityTypeIdentifierDistanceWalkingRunning', ranges),
    ]);

    return ranges.map((range, index) => ({
      hourIndex: range.hourIndex,
      steps: Math.round(steps[index] ?? 0),
      activeCaloriesKcal: Math.round(calories[index] ?? 0),
      distanceMeters: Math.round(distance[index] ?? 0),
    }));
  } catch (error) {
    console.error('iOS getTodayHourly error:', error);
    return createEmptyHourlySeries();
  }
};

const getDailySeries = async (
  identifier: QuantityTypeIdentifier,
  ranges: { date: Date; start: Date; end: Date }[],
): Promise<number[]> => {
  const start = ranges[0].start;
  const end = ranges[ranges.length - 1].end;
  const unit = UNIT_BY_IDENTIFIER[identifier] ?? undefined;

  try {
    // VERIFY IN DOCS: queryStatisticsCollectionForQuantity options & unit strings
    const statistics = await HealthKit.queryStatisticsCollectionForQuantity(
      identifier,
      STATISTICS,
      start,
      { day: 1 },
      {
        filter: { date: { startDate: start, endDate: end } },
        unit,
      },
    );

    const byDate = new Map<string, number>();
    statistics.forEach(entry => {
      if (!entry.startDate) return;
      byDate.set(formatDate(entry.startDate), entry.sumQuantity?.quantity ?? 0);
    });

    return ranges.map(({ date }) => byDate.get(formatDate(date)) ?? 0);
  } catch (error) {
    console.warn(
      'iOS daily statistics collection failed, falling back to samples.',
      error,
    );
  }

  return sumSamplesByDay(identifier, start, end, unit, ranges);
};

const getHourlySeries = async (
  identifier: QuantityTypeIdentifier,
  ranges: { hourIndex: number; start: Date; end: Date }[],
): Promise<number[]> => {
  const start = ranges[0].start;
  const end = ranges[ranges.length - 1].end;
  const unit = UNIT_BY_IDENTIFIER[identifier] ?? undefined;

  try {
    // VERIFY IN DOCS: queryStatisticsCollectionForQuantity options & unit strings
    const statistics = await HealthKit.queryStatisticsCollectionForQuantity(
      identifier,
      STATISTICS,
      start,
      { hour: 1 },
      {
        filter: { date: { startDate: start, endDate: end } },
        unit,
      },
    );

    const byHour = new Map<number, number>();
    statistics.forEach(entry => {
      if (!entry.startDate) return;
      byHour.set(entry.startDate.getHours(), entry.sumQuantity?.quantity ?? 0);
    });

    return ranges.map(({ hourIndex }) => byHour.get(hourIndex) ?? 0);
  } catch (error) {
    console.warn(
      'iOS hourly statistics collection failed, falling back to samples.',
      error,
    );
  }

  return sumSamplesByHour(identifier, start, end, unit, ranges);
};

const sumSamplesByDay = async (
  identifier: QuantityTypeIdentifier,
  start: Date,
  end: Date,
  unit: string | undefined,
  ranges: { date: Date }[],
): Promise<number[]> => {
  const samples = await HealthKit.queryQuantitySamples(identifier, {
    limit: 0,
    ascending: true,
    unit,
    filter: { date: { startDate: start, endDate: end } },
  });

  const totals = new Map<string, number>();
  samples.forEach(sample => {
    const key = formatDate(sample.startDate);
    totals.set(key, (totals.get(key) ?? 0) + sample.quantity);
  });

  return ranges.map(({ date }) => totals.get(formatDate(date)) ?? 0);
};

const sumSamplesByHour = async (
  identifier: QuantityTypeIdentifier,
  start: Date,
  end: Date,
  unit: string | undefined,
  ranges: { hourIndex: number }[],
): Promise<number[]> => {
  const samples = await HealthKit.queryQuantitySamples(identifier, {
    limit: 0,
    ascending: true,
    unit,
    filter: { date: { startDate: start, endDate: end } },
  });

  const totals = new Map<number, number>();
  samples.forEach(sample => {
    const key = sample.startDate.getHours();
    totals.set(key, (totals.get(key) ?? 0) + sample.quantity);
  });

  return ranges.map(({ hourIndex }) => totals.get(hourIndex) ?? 0);
};
