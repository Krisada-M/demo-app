import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import type { Permission } from 'react-native';
import type { DailyMetrics, HourlyMetrics } from '../models';

type PendingBucket = {
  dateLocal: string;
  hourLocal: number;
  startTimeUtc: string;
  endTimeUtc: string;
  steps: number;
  distanceMeters: number;
  activeKcal: number;
  clientRecordVersion: number;
};

type SyncStatus = {
  status: string;
  trackingEnabled: boolean;
  lastWriteUtcMs: number;
  pendingCount: number;
  lastError?: string;
};

type UserProfile = {
  weightKg: number;
  heightCm?: number;
  strideLengthMeters: number;
};

type NativeHealthTracking = {
  startTracking: () => void;
  stopTracking: () => void;
  syncNow: () => void;
  getTodayHourlyBuckets: () => Promise<NativeHourlyMetrics[]>;
  getDailyLast7Days: () => Promise<NativeDailyMetrics[]>;
  getUserProfile: () => Promise<UserProfile>;
  setUserProfile: (
    weightKg: number,
    heightCm: number,
    strideLengthMeters: number,
  ) => void;
  getSyncStatus: () => Promise<SyncStatus>;
  getPendingBuckets: (limit: number) => Promise<PendingBucket[]>;
};

type NativeDailyMetrics = Omit<DailyMetrics, 'sources'>;
type NativeHourlyMetrics = Omit<HourlyMetrics, 'sources'>;

const HealthTracking = NativeModules.HealthTracking as
  | NativeHealthTracking
  | undefined;
const isAndroidNative = Platform.OS === 'android' && !!HealthTracking;

export const ensureActivityPermissions = async () => {
  if (Platform.OS !== 'android') return true;

  const permissions: Permission[] = [
    PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
  ];
  if (Platform.Version >= 33) {
    permissions.push(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  }

  const results = await PermissionsAndroid.requestMultiple(permissions);
  return permissions.every(permission => results[permission] === 'granted');
};

export function startHourlyHealthSync() {
  if (!isAndroidNative) return;
  HealthTracking.startTracking();
}

export function stopHourlyHealthSync() {
  if (!isAndroidNative) return;
  HealthTracking.stopTracking();
}

export const syncNow = () => {
  if (!isAndroidNative) return;
  HealthTracking.syncNow();
};

export const getTodayHourlyBuckets = async (): Promise<
  NativeHourlyMetrics[]
> => {
  if (!isAndroidNative) return [];
  return HealthTracking.getTodayHourlyBuckets();
};

export const getDailyLast7Days = async (): Promise<NativeDailyMetrics[]> => {
  if (!isAndroidNative) return [];
  return HealthTracking.getDailyLast7Days();
};

export const setUserProfile = (
  weightKg: number,
  heightCm: number,
  strideLengthMeters: number,
): void => {
  if (!isAndroidNative) return;
  HealthTracking.setUserProfile(weightKg, heightCm, strideLengthMeters);
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  if (!isAndroidNative) return null;
  return HealthTracking.getUserProfile();
};

export const getSyncStatus = async (): Promise<SyncStatus | null> => {
  if (!isAndroidNative) return null;
  return HealthTracking.getSyncStatus();
};

export const getPendingBuckets = async (
  limit = 24,
): Promise<PendingBucket[]> => {
  if (!isAndroidNative) return [];
  return HealthTracking.getPendingBuckets(limit);
};

export type { PendingBucket, SyncStatus, UserProfile };
