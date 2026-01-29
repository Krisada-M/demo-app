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
  startHourlyHealthSync,
  stopHourlyHealthSync,
  syncNow,
} from '../health/android/HealthTracking';
import type { PendingBucket } from '../health/android/HealthTracking';
import { formatBangkokTime } from '../health/utils/formatTime';
import { useSyncStatus } from '../health/android/useSyncStatus';
import { tokens } from '../ui/tokens';

// Debug screen for tracking and sync status
const DebugScreen = () => {
  const [pending, setPending] = useState<PendingBucket[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { status: syncStatus, refresh: refreshStatus } = useSyncStatus({
    autoRefresh: false,
  });

  const refreshAll = async () => {
    if (Platform.OS !== 'android') return;
    setRefreshing(true);
    const [nextPending] = await Promise.all([
      getPendingBuckets(24),
      refreshStatus(),
    ]);
    setPending(nextPending);
    setRefreshing(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleToggleTracking = () => {
    if (!syncStatus?.trackingEnabled) {
      startHourlyHealthSync();
    } else {
      stopHourlyHealthSync();
    }
    setTimeout(refreshAll, 600);
  };

  const handleSync = () => {
    syncNow();
    setTimeout(refreshAll, 600);
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
                Tracking: {syncStatus?.trackingEnabled ? 'On' : 'Off'}
              </Text>
              <Text style={styles.metaText}>
                Status: {syncStatus?.status ?? 'IDLE'}
              </Text>
              <Text style={styles.metaText}>
                Last sync: {formatBangkokTime(syncStatus?.lastWriteUtcMs)}
              </Text>
              {syncStatus?.status === 'ERROR' ? (
                <Text style={styles.errorText}>
                  {syncStatus.lastError ?? 'Sync failed'}
                </Text>
              ) : null}
              <Text style={styles.metaText}>
                Pending buckets: {syncStatus?.pendingCount ?? 0}
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
                    {syncStatus?.trackingEnabled ? 'Stop' : 'Start'} tracking
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
    backgroundColor: tokens.colors.background,
  },
  content: {
    padding: tokens.spacing.md,
    paddingBottom: 28,
  },
  card: {
    backgroundColor: tokens.colors.card,
    borderRadius: tokens.radius.card,
    padding: tokens.spacing.md,
    ...tokens.shadows.medium,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: tokens.colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  metaText: {
    marginTop: 6,
    fontSize: 13,
    color: tokens.colors.textMuted,
    fontWeight: '500',
  },
  errorText: {
    marginTop: 6,
    fontSize: 13,
    color: tokens.colors.warning,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: tokens.colors.textPrimary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    ...tokens.shadows.soft,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: tokens.colors.background,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  secondaryButtonText: {
    color: tokens.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 8,
  },
  linkButtonText: {
    color: tokens.colors.info,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 15,
    fontWeight: '700',
    color: tokens.colors.textPrimary,
    paddingHorizontal: 4,
  },
  bucketRow: {
    backgroundColor: tokens.colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.border,
    ...tokens.shadows.soft,
  },
  bucketTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: tokens.colors.textPrimary,
  },
  bucketMeta: {
    marginTop: 4,
    fontSize: 12,
    color: tokens.colors.textMuted,
    fontWeight: '500',
  },
  bucketVersion: {
    fontSize: 11,
    color: tokens.colors.textMuted,
    fontWeight: '600',
    backgroundColor: tokens.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  emptyText: {
    textAlign: 'center',
    color: tokens.colors.textMuted,
    marginTop: 24,
    fontSize: 14,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    color: tokens.colors.textMuted,
    fontSize: 15,
    fontWeight: '500',
  },
});

export default DebugScreen;
