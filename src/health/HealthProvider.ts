import { DailyMetrics, HealthStatus, HourlyMetrics } from './models';

export interface HealthProvider {
  ensurePermissions(): Promise<HealthStatus>;
  getDailyLast7Days(): Promise<DailyMetrics[]>;
  getTodayHourly(): Promise<HourlyMetrics[]>;
}
