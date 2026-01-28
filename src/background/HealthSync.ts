import { Platform } from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import { HealthLayer } from '../health/HealthLayer';
import { HEALTH_SYNC_URL } from '../config/api';

type HealthSyncPayload = {
  timestamp: string;
  platform: string;
  daily: Awaited<ReturnType<typeof HealthLayer.getDailyLast7Days>>;
  hourly: Awaited<ReturnType<typeof HealthLayer.getTodayHourly>>;
};

const buildPayload = async (): Promise<HealthSyncPayload> => {
  const [daily, hourly] = await Promise.all([
    HealthLayer.getDailyLast7Days(),
    HealthLayer.getTodayHourly(),
  ]);

  return {
    timestamp: new Date().toISOString(),
    platform: Platform.OS,
    daily,
    hourly,
  };
};

const postPayload = async (payload: HealthSyncPayload): Promise<void> => {
  const response = await fetch(HEALTH_SYNC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Health sync failed with status ${response.status}`);
  }
};

const runSync = async (): Promise<void> => {
  const payload = await buildPayload();
  await postPayload(payload);
};

const handleTask = async (taskId: string): Promise<void> => {
  try {
    await runSync();
  } catch (error) {
    console.error('[HealthSync] task error', error);
  } finally {
    BackgroundFetch.finish(taskId);
  }
};

export const HealthSync = {
  configure: async (): Promise<void> => {
    const status = await BackgroundFetch.configure(
      {
        minimumFetchInterval: 60,
        stopOnTerminate: false,
        startOnBoot: true,
        enableHeadless: true,
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
      },
      async taskId => {
        await handleTask(taskId);
      },
      async taskId => {
        console.warn('[HealthSync] timeout', taskId);
        BackgroundFetch.finish(taskId);
      },
    );

    console.log('[HealthSync] status', status);
    if (status !== BackgroundFetch.STATUS_DENIED) {
      await BackgroundFetch.start();
    }
  },
  headlessTask: async (event: { taskId: string; timeout: boolean }) => {
    const { taskId, timeout } = event;
    if (timeout) {
      BackgroundFetch.finish(taskId);
      return;
    }

    await handleTask(taskId);
  },
  runSync,
};
