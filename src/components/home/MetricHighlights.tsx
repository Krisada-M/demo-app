import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '../../ui/tokens';

interface MetricHighlight {
  label: string;
  value: string | number;
  unit: string;
  icon: string;
  color?: string;
}

interface MetricHighlightsProps {
  metrics: MetricHighlight[];
}

const MetricHighlights: React.FC<MetricHighlightsProps> = ({ metrics }) => {
  return (
    <View style={styles.container}>
      {metrics.map((metric) => (
        <View key={metric.label} style={styles.card}>
          <View style={[styles.iconContainer,
          metric.label === 'Steps' && { backgroundColor: tokens.colors.stepsSoft },
          metric.label === 'Calories' && { backgroundColor: tokens.colors.caloriesSoft },
          metric.label === 'Distance' && { backgroundColor: tokens.colors.distanceSoft },
          ]}>
            <Text style={[styles.icon,
            metric.label === 'Steps' && { color: tokens.colors.steps },
            metric.label === 'Calories' && { color: tokens.colors.calories },
            metric.label === 'Distance' && { color: tokens.colors.distance },
            ]}>{metric.icon}</Text>
          </View>
          <Text style={styles.label}>{metric.label}</Text>
          <View style={styles.valueRow}>
            <Text style={styles.value}>{typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}</Text>
            <Text style={styles.unit}>{metric.unit}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: tokens.spacing.sm,
    marginVertical: tokens.spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: tokens.colors.card,
    borderRadius: tokens.radius.card,
    padding: tokens.spacing.md,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    alignItems: 'flex-start',
    ...tokens.shadows.soft,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing.sm,
  },
  icon: {
    fontSize: 18,
    fontWeight: '900',
  },
  label: {
    ...tokens.typography.caption,
    color: tokens.colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  value: {
    ...tokens.typography.heading,
    fontSize: 18,
    color: tokens.colors.textPrimary,
  },
  unit: {
    ...tokens.typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: tokens.colors.textMuted,
    marginLeft: 2,
  },
});

export default MetricHighlights;
