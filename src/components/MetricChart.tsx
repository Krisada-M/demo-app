import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { VictoryTheme } from 'victory-native';
import { VictoryAxis, VictoryBar, VictoryChart } from './NativeVictory';
import { DailyMetrics, MetricType } from '../health/models';

interface Props {
  data: DailyMetrics[];
  metric: MetricType;
}

const MetricChart: React.FC<Props> = ({ data, metric }) => {
  const chartData = data.map(d => ({
    x: d.date.substring(5),
    y: d[metric],
  }));

  return (
    <View style={styles.chartContainer}>
      <VictoryChart
        theme={VictoryTheme.material}
        domainPadding={{ x: 20 }}
        width={Dimensions.get('window').width - 32}
        height={250}
      >
        <VictoryAxis
          fixLabelOverlap={true}
          style={{
            tickLabels: { fontSize: 10, padding: 5 },
          }}
        />
        <VictoryAxis
          dependentAxis
          style={{
            tickLabels: { fontSize: 10, padding: 5 },
          }}
        />
        <VictoryBar
          data={chartData}
          style={{
            data: { fill: '#007AFF' },
          }}
          animate={{
            duration: 500,
            onLoad: { duration: 200 },
          }}
        />
      </VictoryChart>
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default MetricChart;
