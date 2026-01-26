export enum HealthStatus {
  OK = 'OK',
  NOT_SUPPORTED = 'NOT_SUPPORTED',
  NOT_AUTHORIZED = 'NOT_AUTHORIZED',
  NO_DATA = 'NO_DATA',
  UNKNOWN = 'UNKNOWN',
}

export type DailyMetrics = {
  date: string; // YYYY-MM-DD local
  steps: number;
  activeCaloriesKcal: number;
  distanceMeters: number;
};

export type HourlyMetrics = {
  hourIndex: number; // 0..23 local
  steps: number;
  activeCaloriesKcal: number;
  distanceMeters: number;
};

export type MetricType = 'steps' | 'activeCaloriesKcal' | 'distanceMeters';
