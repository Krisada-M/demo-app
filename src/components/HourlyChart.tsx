import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { VictoryTheme } from 'victory-native';
import { VictoryAxis, VictoryBar, VictoryChart } from './NativeVictory';
import { HourlyMetrics, MetricType } from '../health/models';

interface Props {
  data: HourlyMetrics[];
  metric: MetricType;
}

const HourlyChart: React.FC<Props> = ({ data, metric }) => {
  const chartData = data.map(d => ({
    x: d.hourIndex,
    y: d[metric],
  }));

  return (
    <View style={styles.chartContainer}>
      <VictoryChart
        theme={VictoryTheme.material}
        domainPadding={{ x: 10 }}
        width={Dimensions.get('window').width - 32}
        height={220}
      >
        <VictoryAxis
          tickValues={[0, 4, 8, 12, 16, 20]}
          tickFormat={t => `${t}h`}
          style={{
            tickLabels: { fontSize: 8, padding: 5 },
          }}
        />
        <VictoryAxis
          dependentAxis
          style={{
            tickLabels: { fontSize: 8, padding: 5 },
          }}
        />
        <VictoryBar
          data={chartData}
          style={{
            data: { fill: '#34C759' },
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
    marginVertical: 10,
  },
});

export default HourlyChart;
