import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import { getSyncStatus, syncNow } from '../health/android/HealthTracking';
import type { SyncStatus } from '../health/android/HealthTracking';
import MetricTabs from '../components/MetricTabs';
import MetricChart from '../components/MetricChart';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

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
  { label: string; unit: string; accent: string; tint: string }
> = {
  steps: {
    label: 'Steps',
    unit: 'steps',
    accent: '#1E5FBF',
    tint: '#E8F1FF',
  },
  activeCaloriesKcal: {
    label: 'Calories',
    unit: 'kcal',
    accent: '#D6792B',
    tint: '#FFF1E4',
  },
  distanceMeters: {
    label: 'Distance',
    unit: 'm',
    accent: '#1F8A5C',
    tint: '#E7F6EE',
  },
};

const parseLocalDate = (value: string) => {
  const parts = value.split('-').map(Number);
  if (parts.length !== 3) return new Date();
  const [year, month, day] = parts;
  return new Date(year, month - 1, day);
};

const formatShortDate = (date: Date) =>
  `${MONTHS[date.getMonth()]} ${date.getDate()}`;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('steps');
  const [dailyData, setDailyData] = useState<DailyMetrics[]>([]);
  const [status, setStatus] = useState<HealthStatus>(HealthStatus.UNKNOWN);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
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

  const refreshSyncStatus = useCallback(async () => {
    if (Platform.OS !== 'android') return;
    const healthStatus = await getSyncStatus();

    setSyncStatus(healthStatus);
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

  const latest = dailyData[dailyData.length - 1];
  const steps = latest?.steps ?? 0;
  const calories = latest?.activeCaloriesKcal ?? 0;
  const distance = latest?.distanceMeters ?? 0;

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

  const rangeLabel = useMemo(() => {
    if (dailyData.length >= 2) {
      const startDate = parseLocalDate(dailyData[0].date);
      const endDate = parseLocalDate(dailyData[dailyData.length - 1].date);
      return `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);
    return `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`;
  }, [dailyData]);

  const summaryCards = useMemo(
    () => [
      { key: 'steps', value: steps },
      { key: 'activeCaloriesKcal', value: calories },
      { key: 'distanceMeters', value: distance },
    ],
    [steps, calories, distance],
  );

  const handleSync = () => {
    if (Platform.OS !== 'android') return;
    setSyncing(true);
    syncNow();
    setTimeout(() => {
      refreshSyncStatus();
      setSyncing(false);
    }, 600);
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading your activity...</Text>
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadData(true)}
            />
          }
          contentContainerStyle={styles.content}
        >
          <View style={styles.heroSurface}>
            <View style={styles.heroGlow} />
            <View style={styles.heroGlowSecondary} />
            <View style={styles.heroHeaderRow}>
              <View style={styles.heroPill}>
                <Text style={styles.heroPillText}>Today</Text>
              </View>
              <Text style={styles.heroRange}>{rangeLabel}</Text>
            </View>
            <Text style={styles.heroTitle}>Daily Activity</Text>
            <Text style={styles.heroSubtitle}>
              Track your movement across steps, calories, and distance.
            </Text>
          </View>

          {status !== HealthStatus.OK ? (
            <View style={isErrorStatus ? styles.alertBox : styles.infoBox}>
              <Text style={isErrorStatus ? styles.alertText : styles.infoText}>
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
            <View style={styles.summaryGrid}>
              {summaryCards.map(card => {
                const meta = METRIC_META[card.key as MetricType];
                return (
                  <SummaryCard
                    key={card.key}
                    label={meta.label}
                    value={card.value}
                    unit={meta.unit}
                    accent={meta.accent}
                    tint={meta.tint}
                  />
                );
              })}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Last 7 Days</Text>
              <Text style={styles.sectionMeta}>Daily totals</Text>
            </View>

            <MetricTabs
              selected={selectedMetric}
              onSelect={setSelectedMetric}
            />

            {dailyData.length === 0 ? (
              <Text style={styles.noDataText}>No chart data available.</Text>
            ) : (
              <MetricChart data={dailyData} metric={selectedMetric} />
            )}

            {Platform.OS === 'android' ? (
              <View style={styles.syncStatusCard}>
                <View>
                  <Text style={styles.syncStatusTitle}>Tracking Status</Text>
                  <Text style={styles.syncStatusText}>
                    {syncStatus?.trackingEnabled
                      ? 'Tracking on'
                      : 'Tracking off'}
                  </Text>
                  <Text style={styles.syncStatusMeta}>
                    {formatBangkokTime(syncStatus?.lastWriteUtcMs)}
                  </Text>
                  <Text style={styles.syncStatusMeta}>
                    Pending buckets: {syncStatus?.pendingCount ?? 0}
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

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <Text style={styles.sectionMeta}>Manage your data</Text>
            </View>

            <View style={styles.actionRow}>
              <ActionButton
                label="Profile"
                onPress={() => navigation.navigate('Profile')}
              />
              <View style={styles.actionSpacer} />
              <ActionButton
                label="Debug"
                onPress={() => navigation.navigate('Debug')}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                isNavigationDisabled && styles.buttonDisabled,
              ]}
              onPress={() =>
                navigation.navigate('Hourly', { initialMetric: selectedMetric })
              }
              disabled={isNavigationDisabled}
            >
              <Text style={styles.buttonText}>View hourly breakdown</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const SummaryCard = ({
  label,
  value,
  unit,
  accent,
  tint,
}: {
  label: string;
  value: number;
  unit: string;
  accent: string;
  tint: string;
}) => (
  <View style={[styles.card, { borderColor: accent, backgroundColor: tint }]}>
    <View style={styles.cardHeader}>
      <View style={[styles.cardDot, { backgroundColor: accent }]} />
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
    <Text style={styles.cardValue}>{value.toLocaleString()}</Text>
    {unit ? <Text style={styles.cardUnit}>{unit}</Text> : null}
  </View>
);

const ActionButton = ({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <Text style={styles.actionButtonText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F3EF',
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  heroSurface: {
    backgroundColor: '#0B1C2E',
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#1E5FBF',
    opacity: 0.25,
    top: -100,
    right: -80,
  },
  heroGlowSecondary: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#D6792B',
    opacity: 0.18,
    bottom: -90,
    left: -60,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroPill: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  heroPillText: {
    color: '#F4F7FB',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  heroRange: {
    color: '#B9C7DD',
    fontSize: 12,
  },
  heroTitle: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.3,
    fontFamily: Platform.select({
      ios: 'AvenirNext-DemiBold',
      android: 'serif',
    }),
  },
  heroSubtitle: {
    color: '#C3D1E6',
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Platform.select({
      ios: 'AvenirNext-Regular',
      android: 'serif',
    }),
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 16,
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#1B1F23',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  cardLabel: {
    fontSize: 12,
    color: '#4A5568',
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: Platform.select({ ios: 'AvenirNext-Bold', android: 'serif' }),
  },
  cardUnit: {
    marginTop: 4,
    fontSize: 11,
    color: '#667085',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B1C2E',
    fontFamily: Platform.select({
      ios: 'AvenirNext-DemiBold',
      android: 'serif',
    }),
  },
  sectionMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  noDataText: {
    textAlign: 'center',
    marginVertical: 32,
    color: '#8A94A6',
  },
  syncStatusCard: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#1B1F23',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  syncStatusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1C2E',
  },
  syncStatusText: {
    marginTop: 4,
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '600',
  },
  syncStatusMeta: {
    marginTop: 2,
    fontSize: 11,
    color: '#6B7280',
  },
  syncButton: {
    backgroundColor: '#1E5FBF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  syncButtonDisabled: {
    opacity: 0.6,
  },
  syncButtonText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  actionSpacer: {
    width: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    shadowColor: '#1B1F23',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0B1C2E',
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
    backgroundColor: '#0B1C2E',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#F8FAFC',
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
    color: '#666',
    fontSize: 16,
  },
});

export default HomeScreen;
