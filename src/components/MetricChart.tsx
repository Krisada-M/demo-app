import { View, StyleSheet, Dimensions } from 'react-native';
import { VictoryTheme, VictoryLine, VictoryArea, VictoryChart, VictoryAxis, VictoryScatter, VictoryVoronoiContainer, VictoryTooltip } from 'victory-native';
import { Defs, LinearGradient, Stop } from 'react-native-svg';
import { DailyMetrics, MetricType } from '../health/models';
import { tokens } from '../ui/tokens';

interface Props {
  data: DailyMetrics[];
  metric: MetricType;
  accentColor?: string;
}

const MetricChart: React.FC<Props> = ({ data, metric, accentColor }) => {
  const chartData = data.map((d, index) => {
    // Format date "YYYY-MM-DD" -> "Mon", "Tue"
    const dateObj = new Date(d.date);
    const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    return {
      x: index + 1,
      y: Math.max(d[metric], 0),
      label: dayLabel,
    };
  });

  if (chartData.length === 0) {
    return (
      <View style={styles.chartContainer}>
        <View style={styles.emptyState} />
      </View>
    );
  }

  // Determine color based on metric type
  let activeColor = tokens.colors.accent;
  if (metric === 'steps') activeColor = tokens.colors.steps;
  if (metric === 'activeCaloriesKcal') activeColor = tokens.colors.calories;
  if (metric === 'distanceMeters') activeColor = tokens.colors.distance;

  const fillColor = accentColor ?? activeColor;
  const maxValue = Math.max(...chartData.map(point => point.y), 1);

  return (
    <View style={styles.chartContainer}>
      <VictoryChart
        theme={VictoryTheme.material}
        width={Dimensions.get('window').width - 130}
        height={240}
        padding={{ top: 20, bottom: 40, left: 10, right: 10 }}
        domain={{ y: [0, maxValue * 1.25] }}
      >
        <Defs>
          <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={fillColor} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={fillColor} stopOpacity="0.1" />
          </LinearGradient>
        </Defs>

        <VictoryAxis
          style={{
            axis: { stroke: 'transparent' },
            ticks: { stroke: 'transparent' },
            tickLabels: { fill: tokens.colors.textMuted, fontSize: 12, fontWeight: '600' },
            grid: { stroke: tokens.colors.border, strokeWidth: 1 },
          }}
          tickValues={chartData.map(d => d.x)}
          tickFormat={(t) => chartData[t - 1]?.label ?? ''}
        />

        <VictoryArea
          data={chartData}
          interpolation="catmullRom"
          style={{
            data: {
              fill: "url(#chartGradient)",
              stroke: "transparent",
            },
          }}
          animate={{
            duration: 800,
            onLoad: { duration: 600 },
          }}
        />

        <VictoryLine
          data={chartData}
          interpolation="catmullRom"
          style={{
            data: {
              stroke: fillColor,
              strokeWidth: 2,
              strokeLinecap: 'square',
            },
          }}
          animate={{
            duration: 800,
            onLoad: { duration: 600 },
          }}
        />

        <VictoryScatter
          data={chartData}
          size={5}
          style={{
            data: {
              fill: tokens.colors.card,
              stroke: fillColor,
              strokeWidth: 3,
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
    paddingVertical: 12,
    backgroundColor: tokens.colors.card,
    borderRadius: tokens.radius.card,
    marginHorizontal: 0,
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

export default MetricChart;
