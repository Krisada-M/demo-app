import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { VictoryTheme, VictoryLine } from 'victory-native';
import { VictoryBar, VictoryChart } from './NativeVictory';
import { DailyMetrics, MetricType } from '../health/models';
import { tokens } from '../ui/tokens';

interface Props {
  data: DailyMetrics[];
  metric: MetricType;
  accentColor?: string;
}

const MetricChart: React.FC<Props> = ({ data, metric, accentColor }) => {
  const chartData = data.map((d, index) => ({
    x: index + 1,
    y: d[metric],
  }));
  if (chartData.length === 0) {
    return (
      <View style={styles.chartContainer}>
        <View style={styles.emptyState} />
      </View>
    );
  }
  const lastIndex = chartData.length - 1;
  const fillColor = accentColor ?? tokens.colors.accent;
  const avgValue =
    chartData.length > 0
      ? chartData.reduce((sum, point) => sum + point.y, 0) / chartData.length
      : 0;
  const maxValue = Math.max(...chartData.map(point => point.y), 1);

  return (
    <View style={styles.chartContainer}>
      <VictoryChart
        theme={VictoryTheme.material}
        domainPadding={{ x: 20 }}
        width={Dimensions.get('window').width - 32}
        height={250}
        prependDefaultAxes={false}
        domain={{ y: [0, maxValue * 1.25] }}
      >
        <VictoryBar
          data={chartData}
          style={{
            data: {
              fill: ({ index }) =>
                index === lastIndex ? fillColor : fillColor,
              fillOpacity: ({ index }) => (index === lastIndex ? 1 : 0.35),
            },
          }}
          cornerRadius={{ top: 6, bottom: 6 }}
          animate={{
            duration: 500,
            onLoad: { duration: 200 },
          }}
        />
        <VictoryLine
          data={chartData.map(point => ({ x: point.x, y: avgValue }))}
          style={{
            data: {
              stroke: tokens.colors.textMuted,
              strokeWidth: 1,
              strokeDasharray: '4,6',
              opacity: 0.5,
            },
          }}
        />
      </VictoryChart>
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    alignItems: 'center',
    backgroundColor: tokens.colors.card,
    borderRadius: tokens.radius.card,
    padding: 8,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    shadowColor: '#5B4134',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  emptyState: {
    width: Dimensions.get('window').width - 64,
    height: 200,
    borderRadius: 16,
    backgroundColor: tokens.colors.accentSoft,
    opacity: 0.4,
  },
});

export default MetricChart;
