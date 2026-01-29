import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HealthLayer } from '../health/HealthLayer';
import { HealthStatus, HourlyMetrics, MetricType } from '../health/models';
import HourlyChart from '../components/HourlyChart';
import MeasurementRowCard from '../components/MeasurementRowCard';
import SegmentedMetricTabs from '../components/SegmentedMetricTabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { tokens } from '../ui/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Hourly'>;

const PERIOD_OPTIONS = ['Day', 'Week', 'Month', 'Year'] as const;

const HourlyScreen: React.FC<Props> = ({ route }) => {
  const { initialMetric } = route.params;
  const [hourlyData, setHourlyData] = useState<HourlyMetrics[]>([]);
  const [selectedMetric, setSelectedMetric] =
    useState<MetricType>(initialMetric);
  const [status, setStatus] = useState<HealthStatus>(HealthStatus.UNKNOWN);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const permissionStatus = await HealthLayer.ensurePermissions();
    if (permissionStatus !== HealthStatus.OK) {
      setStatus(permissionStatus);
      setHourlyData([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const data = await HealthLayer.getTodayHourly();
    setHourlyData(data);
    const hasData = data.some(
      hour =>
        hour.steps > 0 ||
        hour.activeCaloriesKcal > 0 ||
        hour.distanceMeters > 0,
    );
    setStatus(hasData ? HealthStatus.OK : HealthStatus.NO_DATA);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const renderStatusMessage = () => {
    if (status === HealthStatus.NOT_SUPPORTED) {
      return 'Health data is not available on this device.';
    }
    if (status === HealthStatus.NOT_AUTHORIZED) {
      return 'Health permissions are required to show hourly data.';
    }
    if (status === HealthStatus.NO_DATA) {
      return 'No hourly data yet for today.';
    }
    if (status === HealthStatus.UNKNOWN) {
      return 'Something went wrong while loading hourly data.';
    }
    return '';
  };

  const isErrorStatus =
    status === HealthStatus.NOT_SUPPORTED ||
    status === HealthStatus.NOT_AUTHORIZED ||
    status === HealthStatus.UNKNOWN;

  const renderItem = ({ item }: { item: HourlyMetrics }) => {
    const unit =
      selectedMetric === 'steps'
        ? 'steps'
        : selectedMetric === 'activeCaloriesKcal'
        ? 'kcal'
        : 'm';
    const icon =
      selectedMetric === 'steps'
        ? 'S'
        : selectedMetric === 'activeCaloriesKcal'
        ? 'C'
        : 'D';
    const hour = String(item.hourIndex).padStart(2, '0');
    return (
      <MeasurementRowCard
        iconLabel={icon}
        value={item[selectedMetric]}
        unit={unit}
        timeLabel={`${hour}:00–${hour}:59`}
      />
    );
  };

  const isEstimated = hourlyData.some(hour =>
    selectedMetric === 'steps'
      ? hour.sources.steps === 'estimated'
      : selectedMetric === 'activeCaloriesKcal'
      ? hour.sources.activeCalories === 'estimated'
      : hour.sources.distance === 'estimated',
  );

  const listHeader = (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Today</Text>
        <Text style={styles.subtitle}>Hourly detail</Text>
      </View>

      <View style={styles.periodRow}>
        {PERIOD_OPTIONS.map((label, index) => (
          <TouchableOpacity
            key={label}
            style={[styles.periodPill, index === 0 && styles.periodPillActive]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.periodText,
                index === 0 && styles.periodTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <SegmentedMetricTabs
        selected={selectedMetric}
        onSelect={setSelectedMetric}
      />

      {status !== HealthStatus.OK ? (
        <View style={isErrorStatus ? styles.alertBox : styles.infoBox}>
          <Text style={isErrorStatus ? styles.alertText : styles.infoText}>
            {renderStatusMessage()}
          </Text>
        </View>
      ) : null}

      <View style={styles.chartWrapper}>
        <HourlyChart
          data={hourlyData}
          metric={selectedMetric}
          accentColor={tokens.colors.accent}
        />
      </View>
      {isEstimated ? (
        <Text style={styles.estimatedNote}>
          Estimated values are approximate.
        </Text>
      ) : null}
      <Text style={styles.listTitle}>Measurements</Text>
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <View style={styles.backgroundGradient} />
      <View style={styles.backgroundGlow} />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={tokens.colors.accent} />
          <Text style={styles.loadingText}>Loading hourly data...</Text>
        </View>
      ) : (
        <FlatList
          data={[...hourlyData].reverse()}
          keyExtractor={item => item.hourIndex.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={listHeader}
          refreshing={refreshing}
          onRefresh={() => loadData(true)}
          ListEmptyComponent={
            <Text style={styles.noDataText}>No hourly data available.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background,
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
    top: 80,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: tokens.colors.accentSoft,
    opacity: 0.6,
  },
  header: {
    paddingHorizontal: tokens.spacing.md,
    paddingTop: tokens.spacing.sm,
    marginBottom: tokens.spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: tokens.colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 14,
    color: tokens.colors.textMuted,
    fontWeight: '500',
  },
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
    gap: 8,
  },
  periodPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  periodPillActive: {
    backgroundColor: tokens.colors.textPrimary,
    borderWidth: 1,
    borderColor: tokens.colors.textPrimary,
  },
  periodText: {
    fontSize: 12,
    color: tokens.colors.textMuted,
    fontWeight: '600',
  },
  periodTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  chartWrapper: {
    paddingHorizontal: tokens.spacing.md,
    paddingBottom: tokens.spacing.sm,
    marginTop: tokens.spacing.sm,
  },
  estimatedNote: {
    marginTop: 8,
    fontSize: 12,
    color: tokens.colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  listContent: {
    padding: tokens.spacing.md,
    paddingBottom: 40,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: tokens.spacing.md,
    color: tokens.colors.textPrimary,
  },
  noDataText: {
    textAlign: 'center',
    color: tokens.colors.textMuted,
    paddingVertical: 20,
    fontSize: 14,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: tokens.colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  // Reused status styles
  alertBox: {
    backgroundColor: '#FFE5E5',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
  },
  alertText: {
    color: tokens.colors.warning,
    textAlign: 'center',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: tokens.colors.accentSoft,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
  },
  infoText: {
    color: tokens.colors.accent,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default HourlyScreen;
