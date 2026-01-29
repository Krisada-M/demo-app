import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HealthLayer } from '../health/HealthLayer';
import { DailyMetrics, HealthStatus, MetricType } from '../health/models';
import { syncNow } from '../health/android/HealthTracking';
import { useSyncStatus } from '../health/android/useSyncStatus';
import { formatBangkokTime } from '../health/utils/formatTime';
import { formatDate } from '../health/utils/timeBuckets';
import DailyChart from '../components/DailyChart';
import MetricSummaryCard from '../components/MetricSummaryCard';
import SegmentedMetricTabs from '../components/SegmentedMetricTabs';
import WeeklyProgressIndicator from '../components/WeeklyProgressIndicator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { tokens } from '../ui/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const METRIC_META: Record<
  MetricType,
  { label: string; unit: string; icon: string }
> = {
  steps: {
    label: 'Steps',
    unit: 'steps',
    icon: 'S',
  },
  activeCaloriesKcal: {
    label: 'Calories',
    unit: 'kcal',
    icon: 'C',
  },
  distanceMeters: {
    label: 'Distance',
    unit: 'm',
    icon: 'D',
  },
};

const formatFullDate = (date: Date) =>
  `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('steps');
  const [dailyData, setDailyData] = useState<DailyMetrics[]>([]);
  const [status, setStatus] = useState<HealthStatus>(HealthStatus.UNKNOWN);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const { status: syncStatus, refresh: refreshSyncStatus } = useSyncStatus();
  const [syncing, setSyncing] = useState(false);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const permissionStatus = await HealthLayer.ensurePermissions();
    if (permissionStatus !== HealthStatus.OK) {
      setStatus(permissionStatus);
      setDailyData([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const data = await HealthLayer.getDailyLast7Days();
    setDailyData(data);
    const hasData = data.some(
      day =>
        day.steps > 0 || day.activeCaloriesKcal > 0 || day.distanceMeters > 0,
    );
    setStatus(hasData ? HealthStatus.OK : HealthStatus.NO_DATA);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      refreshSyncStatus();
    }
  }, [loading, refreshSyncStatus]);

  useEffect(() => {
    if (!loading) {
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }).start();
    }
  }, [contentOpacity, loading]);

  // Find today's data from the 7-day array to match hourly page
  const today = formatDate(new Date());
  const todayData = dailyData.find(day => day.date === today);
  const steps = Math.round(todayData?.steps ?? 0);
  const calories = Math.round(todayData?.activeCaloriesKcal ?? 0);
  const distance = Math.round(todayData?.distanceMeters ?? 0);

  // Calculate averages for the last 7 days (rounded for UI)
  const averageSteps =
    dailyData.length > 0
      ? Math.round(
          dailyData.reduce((sum, d) => sum + d.steps, 0) / dailyData.length,
        )
      : 0;
  const averageCalories =
    dailyData.length > 0
      ? Math.round(
          dailyData.reduce((sum, d) => sum + d.activeCaloriesKcal, 0) /
            dailyData.length,
        )
      : 0;
  const averageDistance =
    dailyData.length > 0
      ? Math.round(
          dailyData.reduce((sum, d) => sum + d.distanceMeters, 0) /
            dailyData.length,
        )
      : 0;

  const renderStatusMessage = () => {
    if (status === HealthStatus.NOT_SUPPORTED) {
      return 'Health data is not available on this device.';
    }
    if (status === HealthStatus.NOT_AUTHORIZED) {
      return 'Health permissions are required to show your activity.';
    }
    if (status === HealthStatus.NO_DATA) {
      return 'No health data found yet. Try again later.';
    }
    if (status === HealthStatus.UNKNOWN) {
      return 'Something went wrong while loading health data.';
    }
    return '';
  };

  const isErrorStatus =
    status === HealthStatus.NOT_SUPPORTED ||
    status === HealthStatus.NOT_AUTHORIZED ||
    status === HealthStatus.UNKNOWN;
  const isNavigationDisabled =
    status === HealthStatus.NOT_SUPPORTED ||
    status === HealthStatus.NOT_AUTHORIZED;

  const selectedMeta = METRIC_META[selectedMetric];
  const selectedSource =
    todayData?.sources?.[
      selectedMetric === 'steps'
        ? 'steps'
        : selectedMetric === 'activeCaloriesKcal'
        ? 'activeCalories'
        : 'distance'
    ] ?? 'store';
  const estimatedBadge =
    selectedSource === 'estimated' ? 'Estimated' : undefined;
  const selectedValue =
    selectedMetric === 'steps'
      ? steps
      : selectedMetric === 'activeCaloriesKcal'
      ? calories
      : distance;
  const todayLabel = formatFullDate(new Date());

  const handleSync = () => {
    if (Platform.OS !== 'android') return;
    setSyncing(true);
    syncNow();
    setTimeout(() => {
      refreshSyncStatus();
      setSyncing(false);
    }, 600);
  };

  const syncStateLabel = () => {
    if (!syncStatus) return 'Idle';
    if (syncStatus.status === 'SYNCING') return 'Syncing';
    if (syncStatus.status === 'ERROR') return 'Error';
    return 'Idle';
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={tokens.colors.accent} />
          <Text style={styles.loadingText}>Loading your activity...</Text>
        </View>
      ) : (
        <View style={styles.screenWrap}>
          <View style={styles.backgroundGradient} />
          <View style={styles.backgroundGlow} />
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadData(true)}
              />
            }
            contentContainerStyle={styles.content}
          >
            <View style={styles.headerBlock}>
              <Text style={styles.todayLabel}>Today</Text>
              <Text style={styles.headline}>Nurture your daily balance</Text>
              <Text style={styles.dateTextCentered}>{todayLabel}</Text>
            </View>

            <WeeklyProgressIndicator />

            {status !== HealthStatus.OK ? (
              <View style={isErrorStatus ? styles.alertBox : styles.infoBox}>
                <Text
                  style={isErrorStatus ? styles.alertText : styles.infoText}
                >
                  {renderStatusMessage()}
                </Text>
              </View>
            ) : null}

            <Animated.View
              style={{
                opacity: contentOpacity,
                transform: [
                  {
                    translateY: contentOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [8, 0],
                    }),
                  },
                ],
              }}
            >
              <MetricSummaryCard
                label={selectedMeta.label}
                value={selectedValue}
                unit={selectedMeta.unit}
                iconLabel={selectedMeta.icon}
                accentColor={tokens.colors.accent}
                badgeText={estimatedBadge}
              />

              <SegmentedMetricTabs
                selected={selectedMetric}
                onSelect={setSelectedMetric}
              />

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Last 7 Days</Text>
                <Text style={styles.sectionMeta}>Daily totals</Text>
              </View>

              {dailyData.length === 0 ? (
                <Text style={styles.noDataText}>No chart data available.</Text>
              ) : (
                <DailyChart
                  data={dailyData}
                  metric={selectedMetric}
                  accentColor={tokens.colors.accent}
                />
              )}

              {Platform.OS === 'android' ? (
                <Text style={styles.syncMeta}>
                  Last synced at {formatBangkokTime(syncStatus?.lastWriteUtcMs)}
                </Text>
              ) : null}

              {Platform.OS === 'android' ? (
                <View style={styles.syncStatusCard}>
                  <View>
                    <Text style={styles.syncStatusTitle}>Sync status</Text>
                    <Text style={styles.syncStatusText}>
                      {syncStateLabel()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.syncButton,
                      syncing && styles.syncButtonDisabled,
                    ]}
                    onPress={handleSync}
                    disabled={syncing}
                  >
                    <Text style={styles.syncButtonText}>
                      {syncing ? 'Syncing...' : 'Sync now'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {Platform.OS === 'android' ? (
                <View style={styles.quickActionsSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <Text style={styles.sectionMeta}>Adjust your data</Text>
                  </View>
                  <View style={styles.quickActionsRow}>
                    <TouchableOpacity
                      style={styles.quickActionCard}
                      onPress={() => navigation.navigate('Profile')}
                    >
                      <Text style={styles.quickActionTitle}>Profile</Text>
                      <Text style={styles.quickActionText}>
                        Weight & stride length
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickActionCard}
                      onPress={() => navigation.navigate('Debug')}
                    >
                      <Text style={styles.quickActionTitle}>Debug</Text>
                      <Text style={styles.quickActionText}>
                        Sync status & buckets
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}

              <View style={styles.followingRow}>
                {[
                  { label: 'Activity', value: steps, unit: 'steps', icon: 'A' },
                  { label: 'Body', value: distance, unit: 'm', icon: 'B' },
                  { label: 'Heart', value: calories, unit: 'kcal', icon: 'H' },
                ].map(card => (
                  <View key={card.label} style={styles.followingCard}>
                    <View style={styles.followingIcon}>
                      <Text style={styles.followingIconText}>{card.icon}</Text>
                    </View>
                    <Text style={styles.followingValue}>
                      {Math.round(card.value).toLocaleString()}
                    </Text>
                    <Text style={styles.followingLabel}>{card.label}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.sectionHeaderWide}>
                <Text style={styles.sectionTitle}>All Health Data</Text>
                <Text style={styles.sectionMeta}>Today</Text>
              </View>

              {(
                [
                  'steps',
                  'activeCaloriesKcal',
                  'distanceMeters',
                ] as MetricType[]
              ).map(metricKey => {
                const meta = METRIC_META[metricKey];
                const series = dailyData.map(day => day[metricKey]);
                const maxValue = Math.max(...series, 1);
                return (
                  <View key={metricKey} style={styles.dataRow}>
                    <View>
                      <Text style={styles.dataLabel}>{meta.label}</Text>
                      <Text style={styles.dataValue}>
                        {(metricKey === 'distanceMeters'
                          ? distance
                          : metricKey === 'steps'
                          ? steps
                          : calories
                        ).toLocaleString()}{' '}
                        <Text style={styles.dataUnit}>{meta.unit}</Text>
                      </Text>
                      <Text style={styles.dataAvg}>
                        7d avg:{' '}
                        {(metricKey === 'distanceMeters'
                          ? averageDistance
                          : metricKey === 'steps'
                          ? averageSteps
                          : averageCalories
                        ).toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.miniTrend}>
                      {series.map((value, index) => (
                        <View
                          key={`${metricKey}-${index}`}
                          style={[
                            styles.miniBar,
                            {
                              height: 6 + (value / maxValue) * 18,
                              opacity: index === series.length - 1 ? 1 : 0.4,
                            },
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                );
              })}

              <TouchableOpacity
                style={[
                  styles.button,
                  isNavigationDisabled && styles.buttonDisabled,
                ]}
                onPress={() =>
                  navigation.navigate('Hourly', {
                    initialMetric: selectedMetric,
                  })
                }
                disabled={isNavigationDisabled}
              >
                <Text style={styles.buttonText}>View Today Hourly →</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  screenWrap: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: tokens.colors.gradientTop,
  },
  backgroundGlow: {
    position: 'absolute',
    top: 140,
    left: -60,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#FBDFD3',
    opacity: 0.35,
  },
  content: {
    padding: tokens.spacing.md,
    paddingTop: tokens.spacing.sm,
    paddingBottom: 40,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
    marginTop: tokens.spacing.sm,
  },
  todayLabel: {
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: '600',
    color: tokens.colors.textMuted,
  },
  headline: {
    marginTop: 8,
    fontSize: 26,
    fontWeight: '800',
    color: tokens.colors.textPrimary,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'AvenirNext-Bold',
      android: 'serif',
    }),
    letterSpacing: -0.2,
  },
  dateTextCentered: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
    color: tokens.colors.textMuted,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  sectionHeaderWide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: tokens.spacing.lg,
    marginBottom: tokens.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: tokens.colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionMeta: {
    fontSize: 13,
    fontWeight: '600',
    color: tokens.colors.textMuted,
  },
  noDataText: {
    textAlign: 'center',
    marginVertical: 40,
    color: tokens.colors.textMuted,
    fontSize: 15,
  },
  syncMeta: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '500',
    color: tokens.colors.textMuted,
    textAlign: 'right',
  },
  syncStatusCard: {
    marginTop: tokens.spacing.md,
    backgroundColor: tokens.colors.card,
    borderRadius: tokens.radius.card,
    padding: tokens.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  syncStatusTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: tokens.colors.textPrimary,
  },
  syncStatusText: {
    marginTop: 4,
    fontSize: 14,
    color: tokens.colors.textPrimary,
    fontWeight: '600',
  },
  syncButton: {
    backgroundColor: tokens.colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  syncButtonDisabled: {
    opacity: 0.6,
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  quickActionsSection: {
    marginTop: tokens.spacing.lg,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: tokens.spacing.sm,
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: tokens.colors.card,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    padding: tokens.spacing.md,
    shadowColor: '#5B4134',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: tokens.colors.textPrimary,
  },
  quickActionText: {
    marginTop: 6,
    fontSize: 13,
    color: tokens.colors.textMuted,
    fontWeight: '500',
  },
  followingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg,
    gap: 10,
  },
  followingCard: {
    flex: 1,
    backgroundColor: tokens.colors.card,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    padding: tokens.spacing.md,
    alignItems: 'center',
  },
  followingIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: tokens.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  followingIconText: {
    fontSize: 13,
    fontWeight: '800',
    color: tokens.colors.accent,
  },
  followingValue: {
    fontSize: 15,
    fontWeight: '800',
    color: tokens.colors.textPrimary,
  },
  followingLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    color: tokens.colors.textMuted,
    textTransform: 'uppercase',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: tokens.colors.card,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.sm,
  },
  dataLabel: {
    fontSize: 13,
    color: tokens.colors.textMuted,
  },
  dataValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '700',
    color: tokens.colors.textPrimary,
  },
  dataUnit: {
    fontSize: 12,
    color: tokens.colors.textMuted,
    fontWeight: '500',
  },
  dataAvg: {
    marginTop: 2,
    fontSize: 11,
    color: tokens.colors.textMuted,
    fontWeight: '500',
  },
  miniTrend: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  miniBar: {
    width: 6,
    borderRadius: 4,
    backgroundColor: tokens.colors.accent,
  },
  alertBox: {
    backgroundColor: '#FFE5E5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  alertText: {
    color: '#D8000C',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#E8F1FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: {
    color: '#1E5FBF',
    textAlign: 'center',
  },
  button: {
    backgroundColor: tokens.colors.accent,
    padding: 16,
    borderRadius: tokens.radius.card,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  loadingText: {
    marginTop: 12,
    color: tokens.colors.textMuted,
    fontSize: 16,
  },
});

export default HomeScreen;
