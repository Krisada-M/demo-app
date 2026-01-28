import { DailyMetrics, HourlyMetrics, createStoreSources } from '../models';
import dayjs from 'dayjs';

const pad2 = (value: number) => String(value).padStart(2, '0');
const pad3 = (value: number) => String(value).padStart(3, '0');

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
};

export const toLocalISOString = (date: Date): string => {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absOffset = Math.abs(offsetMinutes);
  const offsetHours = pad2(Math.floor(absOffset / 60));
  const offsetMins = pad2(absOffset % 60);

  return (
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
      date.getDate(),
    )}` +
    `T${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(
      date.getSeconds(),
    )}.` +
    `${pad3(date.getMilliseconds())}${sign}${offsetHours}:${offsetMins}`
  );
};

export const getStartOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

export const getEndOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

export const getLast7DaysRanges = () => {
  const ranges: { date: Date; start: Date; end: Date }[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    ranges.push({
      date,
      start: getStartOfDay(date),
      end: getEndOfDay(date),
    });
  }

  return ranges;
};

export const getTodayHourlyRanges = () => {
  const ranges: { hourIndex: number; start: Date; end: Date }[] = [];
  const today = new Date();

  for (let hour = 0; hour < 24; hour += 1) {
    const start = new Date(today);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(today);
    end.setHours(hour, 59, 59, 999);
    ranges.push({ hourIndex: hour, start, end });
  }

  return ranges;
};

export const createEmptyDailyMetrics = (date: Date): DailyMetrics => ({
  date: formatDate(date),
  steps: 0,
  activeCaloriesKcal: 0,
  distanceMeters: 0,
  sources: createStoreSources(),
});

export const createEmptyHourlyMetrics = (hourIndex: number): HourlyMetrics => ({
  hourIndex,
  steps: 0,
  activeCaloriesKcal: 0,
  distanceMeters: 0,
  sources: createStoreSources(),
});

export const createEmptyDailySeries = (): DailyMetrics[] =>
  getLast7DaysRanges().map(({ date }) => createEmptyDailyMetrics(date));

export const createEmptyHourlySeries = (): HourlyMetrics[] =>
  getTodayHourlyRanges().map(({ hourIndex }) =>
    createEmptyHourlyMetrics(hourIndex),
  );

export const getLast7DaysRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  return {
    start: getStartOfDay(start),
    end: getEndOfDay(end),
  };
};

export const getTodayRange = () => {
  const date = new Date();
  return {
    start: getStartOfDay(date),
    end: getEndOfDay(date),
  };
};

/**
 * Returns a date string in YYYY-MM-DD for the current Asia/Bangkok day.
 */
export const todayBangkokDate = (): string => {
  return dayjs
    .utc()
    .utcOffset(7 * 60)
    .format('YYYY-MM-DD');
};

/**
 * Formats an ISO timestamp to a readable Bangkok local time.
 */
export const formatBangkokTime = (utcMs?: number): string => {
  if (!utcMs) return 'Never synced';
  const local = dayjs.utc(utcMs).utcOffset(7 * 60);
  const formatted = local.format('D MMM, YYYY, h:mm a');
  return `${formatted} BKK`;
};
