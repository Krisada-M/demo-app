import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { HealthLayer } from '../health/HealthLayer';
import { HealthStatus, HourlyMetrics, MetricType } from '../health/models';
import HourlyChart from '../components/HourlyChart';
import MeasurementRowCard from '../components/MeasurementRowCard';
import SegmentedMetricTabs from '../components/SegmentedMetricTabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { tokens } from '../ui/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Hourly'>;

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

  const listHeader = (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Today</Text>
        <Text style={styles.subtitle}>Hourly detail</Text>
      </View>

      <View style={styles.periodRow}>
        {['Day', 'Week', 'Month', 'Year'].map((label, index) => (
          <View
            key={label}
            style={[styles.periodPill, index === 0 && styles.periodPillActive]}
          >
            <Text
              style={[
                styles.periodText,
                index === 0 && styles.periodTextActive,
              ]}
            >
              {label}
            </Text>
          </View>
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
      <Text style={styles.listTitle}>Measurements</Text>
    </>
  );

  return (
    <View style={styles.container}>
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
    </View>
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
    height: 220,
    backgroundColor: tokens.colors.gradientTop,
  },
  backgroundGlow: {
    position: 'absolute',
    top: 80,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F9D8C8',
    opacity: 0.35,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: tokens.colors.background,
  },
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: tokens.spacing.sm,
    marginBottom: tokens.spacing.sm,
  },
  periodPill: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 999,
    backgroundColor: '#F6ECE6',
    alignItems: 'center',
  },
  periodPillActive: {
    backgroundColor: tokens.colors.card,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  periodText: {
    fontSize: 12,
    color: tokens.colors.textMuted,
  },
  periodTextActive: {
    color: tokens.colors.textPrimary,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: tokens.colors.textPrimary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: tokens.colors.textMuted,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: tokens.colors.textPrimary,
  },
  noDataText: {
    textAlign: 'center',
    color: tokens.colors.textMuted,
    paddingVertical: 16,
  },
  alertBox: {
    backgroundColor: '#FFE5E5',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
  },
  alertText: {
    color: '#D8000C',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#E8F1FF',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
  },
  infoText: {
    color: '#1E5FBF',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: tokens.colors.textMuted,
    fontSize: 16,
  },
});

export default HourlyScreen;
