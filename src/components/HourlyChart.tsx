import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { VictoryTheme } from 'victory-native';
import { VictoryBar, VictoryChart } from './NativeVictory';
import { HourlyMetrics, MetricType } from '../health/models';
import { tokens } from '../ui/tokens';

interface Props {
  data: HourlyMetrics[];
  metric: MetricType;
  accentColor?: string;
}

const HourlyChart: React.FC<Props> = ({ data, metric, accentColor }) => {
  const chartData = data.map(d => ({
    x: d.hourIndex,
    y: d[metric],
  }));
  if (chartData.length === 0) {
    return (
      <View style={styles.chartContainer}>
        <View style={styles.emptyState} />
      </View>
    );
  }
  const currentHour = new Date().getHours();
  const fillColor = accentColor ?? tokens.colors.accent;
  const maxValue = Math.max(...chartData.map(point => point.y), 1);

  return (
    <View style={styles.chartContainer}>
      <VictoryChart
        theme={VictoryTheme.material}
        domainPadding={{ x: 10 }}
        width={Dimensions.get('window').width - 32}
        height={220}
        prependDefaultAxes={false}
        domain={{ y: [0, maxValue * 1.25] }}
      >
        <VictoryBar
          data={chartData}
          style={{
            data: {
              fill: fillColor,
              fillOpacity: ({ datum }) => {
                if (datum.y === 0) return 0.12;
                return datum.x === currentHour ? 1 : 0.35;
              },
            },
          }}
          cornerRadius={{ top: 6, bottom: 6 }}
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
    marginVertical: 10,
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
    height: 180,
    borderRadius: 16,
    backgroundColor: tokens.colors.accentSoft,
    opacity: 0.4,
  },
});

export default HourlyChart;
