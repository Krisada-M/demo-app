import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { GradientBackground } from '../components/GradientBackground';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HealthLayer } from '../health/HealthLayer';
import { DailyMetrics, HealthStatus, MetricType } from '../health/models';
import { syncNow, writeToHealthConnect } from '../health/android/HealthTracking';
import { useSyncStatus } from '../health/android/useSyncStatus';
import { formatBangkokTime } from '../health/utils/formatTime';
import { formatDate } from '../health/utils/timeBuckets';
import MetricChart from '../components/MetricChart';
import SegmentedMetricTabs from '../components/SegmentedMetricTabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { tokens } from '../ui/tokens';

// New Components
import HomeHeader from '../components/home/HomeHeader';
import MetricHighlights from '../components/home/MetricHighlights';
import SyncStatusCard from '../components/home/SyncStatusCard';
import QuickActionsGrid from '../components/home/QuickActionsGrid';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const METRIC_META: Record<
  MetricType,
  { label: string; unit: string; icon: string; color: string }
> = {
  steps: {
    label: 'Steps',
    unit: 'steps',
    icon: 'S',
    color: '#F2994A',
  },
  activeCaloriesKcal: {
    label: 'Calories',
    unit: 'kcal',
    icon: 'C',
    color: '#EB5757',
  },
  distanceMeters: {
    label: 'Distance',
    unit: 'm',
    icon: 'D',
    color: '#2196F3',
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

    // Auto-flush pending DB records to Health Connect on Android
    if (Platform.OS === 'android') {
      try {
        await writeToHealthConnect();
      } catch (e) {
        console.warn('Auto-flush failed:', e);
      }
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
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, contentOpacity]);

  const todayStr = formatDate(new Date());
  const todayData = dailyData.find(day => day.date === todayStr) || dailyData[dailyData.length - 1];

  const metrics = [
    {
      label: 'Steps',
      value: Math.round(todayData?.steps ?? 0),
      unit: 'steps',
      icon: '👣',
      color: METRIC_META.steps.color,
    },
    {
      label: 'Calories',
      value: Math.round(todayData?.activeCaloriesKcal ?? 0),
      unit: 'kcal',
      icon: '🔥',
      color: METRIC_META.activeCaloriesKcal.color,
    },
    {
      label: 'Distance',
      value: ((todayData?.distanceMeters ?? 0) / 1000).toFixed(1),
      unit: 'km',
      icon: '📍',
      color: METRIC_META.distanceMeters.color,
    },
  ];

  const handleSync = () => {
    if (Platform.OS !== 'android') return;
    setSyncing(true);
    syncNow();
    setTimeout(() => {
      refreshSyncStatus();
      setSyncing(false);
    }, 1000);
  };

  const handleMock = async () => {
    try {
      setSyncing(true);
      const perm = await HealthLayer.ensurePermissions();
      if (perm !== HealthStatus.OK) {
        console.warn('Cannot inject mock data: permissions not granted');
        setSyncing(false);
        return;
      }

      await HealthLayer.mockWrite();
      // Brief delay to allow Health Connect to settle before reading back
      setTimeout(async () => {
        await loadData(true);
        setSyncing(false);
      }, 800);
    } catch (error) {
      console.error('Mock write failed:', error);
      setSyncing(false);
    }
  };

  const syncStateLabel = () => {
    if (!syncStatus) return 'Idle';
    if (syncStatus.status === 'SYNCING') return 'Syncing';
    if (syncStatus.status === 'ERROR') return 'Error';
    return 'Up to date';
  };

  const selectedMeta = METRIC_META[selectedMetric];

  const actions = [
    {
      title: 'Profile',
      description: 'Physical info',
      icon: '👤',
      onPress: () => navigation.navigate('Profile'),
    },
    {
      title: 'Debug',
      description: 'System tools',
      icon: '⚙️',
      onPress: () => navigation.navigate('Debug'),
    },
    {
      title: 'Hourly',
      description: 'Analysis',
      icon: '📊',
      onPress: () => navigation.navigate('Hourly', { initialMetric: selectedMetric }),
    },
  ];

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

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={tokens.colors.accent} />
          <Text style={styles.loadingText}>Gathering health insights...</Text>
        </View>
      ) : (
        <View style={styles.screenWrap}>
          <GradientBackground />
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadData(true)}
                tintColor={tokens.colors.accent}
              />
            }
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <HomeHeader
              greeting="Good day"
              dateLabel={formatFullDate(new Date())}
            />

            <Animated.View style={{ opacity: contentOpacity }}>
              {status !== HealthStatus.OK && (
                <View style={isErrorStatus ? styles.alertBox : styles.infoBox}>
                  <Text style={isErrorStatus ? styles.alertText : styles.infoText}>
                    {renderStatusMessage()}
                  </Text>
                </View>
              )}

              <MetricHighlights metrics={metrics} />

              <View style={styles.indicatorsRow}>
                <View style={[styles.indicator, styles.activeIndicator]} />
                <View style={styles.indicator} />
                <View style={styles.indicator} />
              </View>

              <View style={styles.chartSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Weekly Activity</Text>
                </View>

                <View style={styles.chartContainer}>
                  <SegmentedMetricTabs
                    selected={selectedMetric}
                    onSelect={setSelectedMetric}
                  />

                  <MetricChart
                    data={dailyData}
                    metric={selectedMetric}
                    accentColor={selectedMeta.color}
                  />
                </View>
              </View>

              {Platform.OS === 'android' && (
                <SyncStatusCard
                  statusLabel={syncStateLabel()}
                  lastSynced={formatBangkokTime(syncStatus?.lastWriteUtcMs)}
                  onSync={handleSync}
                  onMock={handleMock}
                  isSyncing={syncing}
                />
              )}

              <QuickActionsGrid actions={actions} />
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

  content: {
    paddingHorizontal: tokens.spacing.md,
    paddingBottom: tokens.spacing.xl,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    ...tokens.typography.body,
    fontWeight: '600',
    color: tokens.colors.textMuted,
  },
  chartSection: {
    marginTop: tokens.spacing.lg,
  },
  sectionHeader: {
    marginBottom: tokens.spacing.md,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    ...tokens.typography.heading,
    color: tokens.colors.textPrimary,
  },
  chartContainer: {
    marginTop: tokens.spacing.sm,
    ...tokens.glass.default, // Use new glass token
    borderRadius: tokens.radius.card,
    padding: tokens.spacing.md,
    // ...tokens.shadows.soft,
  },

  indicatorsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: -4,
    marginBottom: tokens.spacing.sm,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tokens.colors.border,
  },
  activeIndicator: {
    backgroundColor: tokens.colors.accent,
    width: 14,
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
    fontWeight: '600',
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
    fontWeight: '600',
  },
});

export default HomeScreen;
