import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { VictoryTheme } from 'victory-native';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryArea, VictoryScatter } from './NativeVictory';
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
  // Determine color based on metric type if accentColor not provided or generic
  let activeColor = tokens.colors.accent;
  if (metric === 'steps') activeColor = tokens.colors.steps;
  if (metric === 'activeCaloriesKcal') activeColor = tokens.colors.calories;
  if (metric === 'distanceMeters') activeColor = tokens.colors.distance;

  const fillColor = accentColor && accentColor !== tokens.colors.accent ? accentColor : activeColor;
  const maxValue = Math.max(...chartData.map(point => point.y), 1);

  // Future Zone Data (shade from next hour to 23)
  const futureStart = currentHour + 1;
  const futureData = [
    { x: futureStart, y: maxValue * 1.25 },
    { x: 23, y: maxValue * 1.25 },
  ];

  return (
    <View style={styles.chartContainer}>
      <VictoryChart
        theme={VictoryTheme.material}
        domainPadding={{ x: 12 }}
        width={Dimensions.get('window').width - 130} // Nearly full width
        height={240}
        padding={{ top: 20, bottom: 40, left: 10, right: 10 }}
        prependDefaultAxes={false}
        domain={{ x: [0, 23], y: [0, maxValue * 1.25] }}
      >

        {/* Y-Axis Guidelines */}
        <VictoryAxis
          dependentAxis
          style={{
            axis: { stroke: 'transparent' },
            grid: { stroke: tokens.colors.border, strokeDasharray: '4, 4', strokeWidth: 1 },
            tickLabels: { fill: tokens.colors.textMuted, fontSize: 10, padding: 4 },
          }}
          tickValues={[maxValue]}
          tickFormat={(t) => Math.round(t).toLocaleString()}
        />

        <VictoryBar
          data={chartData}
          style={{
            data: {
              fill: ({ datum }) => (datum.x === currentHour ? fillColor : tokens.colors.textMuted),
              fillOpacity: ({ datum }) => (datum.x === currentHour ? 1 : datum.x > currentHour ? 0.1 : 0.4),
              width: 10,
            },
          }}
          cornerRadius={{ top: 4, bottom: 4 }}
          animate={{
            duration: 600,
            onLoad: { duration: 400 },
          }}
        />

        {/* "Current Hour" Label */}
        {chartData.find(d => d.x === currentHour) && (
          <VictoryScatter
            data={[{ x: currentHour, y: maxValue * 1.15 }]}
            size={0}
            labels={() => "Now"}
            style={{ labels: { fill: fillColor, fontSize: 10, fontWeight: "bold" } }}
          />
        )}
      </VictoryChart>
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    alignItems: 'center',
    backgroundColor: tokens.colors.card,
    borderRadius: tokens.radius.card,
    paddingVertical: 16,
    marginVertical: 10,
    borderWidth: 0,
    ...tokens.shadows.soft,
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
