import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getPendingBuckets,
  getSyncStatus,
  startTracking,
  stopTracking,
  syncNow,
} from '../health/android/HealthTracking';
import type {
  PendingBucket,
  SyncStatus,
} from '../health/android/HealthTracking';

const DebugScreen = () => {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [pending, setPending] = useState<PendingBucket[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const refreshAll = async () => {
    if (Platform.OS !== 'android') return;
    setRefreshing(true);
    const nextStatus = await getSyncStatus();
    const nextPending = await getPendingBuckets(24);
    setStatus(nextStatus);
    setPending(nextPending);
    setRefreshing(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleToggleTracking = () => {
    if (!status?.trackingEnabled) {
      startTracking();
    } else {
      stopTracking();
    }
    setTimeout(refreshAll, 600);
  };

  const handleSync = () => {
    syncNow();
    setTimeout(refreshAll, 600);
  };

  const formatBangkokTime = (utcMs?: number) => {
    if (!utcMs) return 'Never synced';
    const offsetMs = 7 * 60 * 60 * 1000;
    const date = new Date(utcMs + offsetMs);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const mins = String(date.getUTCMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${mins} BKK`;
  };

  if (Platform.OS !== 'android') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.messageText}>Debug tools are Android-only.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={pending}
        keyExtractor={item => `${item.dateLocal}-${item.hourLocal}`}
        contentContainerStyle={styles.content}
        refreshing={refreshing}
        onRefresh={refreshAll}
        ListHeaderComponent={
          <>
            <View style={styles.card}>
              <Text style={styles.title}>Tracking & Sync</Text>
              <Text style={styles.metaText}>
                Tracking: {status?.trackingEnabled ? 'On' : 'Off'}
              </Text>
              <Text style={styles.metaText}>
                Last write: {formatBangkokTime(status?.lastWriteUtcMs)}
              </Text>
              <Text style={styles.metaText}>
                Pending buckets: {status?.pendingCount ?? 0}
              </Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleSync}
                >
                  <Text style={styles.primaryButtonText}>Sync now</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleToggleTracking}
                >
                  <Text style={styles.secondaryButtonText}>
                    {status?.trackingEnabled ? 'Stop' : 'Start'} tracking
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.linkButton} onPress={refreshAll}>
                <Text style={styles.linkButtonText}>
                  {refreshing ? 'Refreshing...' : 'Refresh status'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Pending hourly buckets</Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.bucketRow}>
            <View>
              <Text style={styles.bucketTitle}>
                {item.dateLocal} - {String(item.hourLocal).padStart(2, '0')}:00
              </Text>
              <Text style={styles.bucketMeta}>
                Steps {item.steps.toFixed(0)} | Dist{' '}
                {item.distanceMeters.toFixed(1)}m | Kcal{' '}
                {item.activeKcal.toFixed(1)}
              </Text>
            </View>
            <Text style={styles.bucketVersion}>
              v{item.clientRecordVersion}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No pending buckets.</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F3EF',
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#1B1F23',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B1C2E',
    fontFamily: Platform.select({
      ios: 'AvenirNext-DemiBold',
      android: 'serif',
    }),
  },
  metaText: {
    marginTop: 6,
    fontSize: 12,
    color: '#64748B',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#0B1C2E',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1E293B',
    fontSize: 13,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#1E5FBF',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    marginTop: 18,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1C2E',
  },
  bucketRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#1B1F23',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  bucketTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  bucketMeta: {
    marginTop: 4,
    fontSize: 11,
    color: '#6B7280',
  },
  bucketVersion: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 20,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    color: '#64748B',
    fontSize: 14,
  },
});

export default DebugScreen;
