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
import MetricTabs from '../components/MetricTabs';
import HourlyChart from '../components/HourlyChart';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

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

  const renderItem = ({ item }: { item: HourlyMetrics }) => (
    <View style={styles.row}>
      <Text style={styles.hourText}>{`${item.hourIndex}:00`}</Text>
      <Text style={styles.valueText}>
        {item[selectedMetric].toLocaleString()}
        <Text style={styles.unitText}>
          {selectedMetric === 'steps'
            ? ' steps'
            : selectedMetric === 'activeCaloriesKcal'
            ? ' kcal'
            : ' m'}
        </Text>
      </Text>
    </View>
  );

  const listHeader = (
    <>
      <View style={styles.header}>
        <MetricTabs selected={selectedMetric} onSelect={setSelectedMetric} />
      </View>

      {status !== HealthStatus.OK ? (
        <View style={isErrorStatus ? styles.alertBox : styles.infoBox}>
          <Text style={isErrorStatus ? styles.alertText : styles.infoText}>
            {renderStatusMessage()}
          </Text>
        </View>
      ) : null}

      <View style={styles.chartWrapper}>
        <HourlyChart data={hourlyData} metric={selectedMetric} />
      </View>
      <Text style={styles.listTitle}>Hourly Breakdown</Text>
    </>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 16,
    backgroundColor: '#fff',
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
    paddingBottom: 32,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  hourText: {
    fontSize: 14,
    color: '#666',
  },
  valueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  unitText: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#999',
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
    color: '#666',
    fontSize: 16,
  },
});

export default HourlyScreen;
