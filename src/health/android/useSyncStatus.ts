import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { getSyncStatus } from './HealthTracking';
import type { SyncStatus } from './HealthTracking';

type UseSyncStatusOptions = {
  autoRefresh?: boolean;
  refreshIntervalMs?: number;
};

type UseSyncStatusResult = {
  status: SyncStatus | null;
  refreshing: boolean;
  refresh: () => Promise<void>;
};

export const useSyncStatus = (
  options: UseSyncStatusOptions = {},
): UseSyncStatusResult => {
  const { autoRefresh = true, refreshIntervalMs } = options;
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (Platform.OS !== 'android') return;
    if (!mountedRef.current) return;
    setRefreshing(true);
    try {
      const next = await getSyncStatus();
      if (!mountedRef.current) return;
      setStatus(next);
    } finally {
      if (mountedRef.current) {
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    refresh();
  }, [autoRefresh, refresh]);

  useEffect(() => {
    if (!refreshIntervalMs) return;
    const id = setInterval(() => {
      refresh();
    }, refreshIntervalMs);
    return () => clearInterval(id);
  }, [refresh, refreshIntervalMs]);

  return { status, refreshing, refresh };
};
