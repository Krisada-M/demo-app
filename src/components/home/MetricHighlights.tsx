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
            metric.label === 'Steps' && { backgroundColor: tokens.colors.steps + '15' },
            metric.label === 'Calories' && { backgroundColor: tokens.colors.calories + '15' },
            metric.label === 'Distance' && { backgroundColor: tokens.colors.distance + '15' },
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
    gap: 12,
    marginVertical: tokens.spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: tokens.colors.card,
    borderRadius: tokens.radius.card,
    padding: 16,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    alignItems: 'flex-start',
    ...tokens.shadows.soft,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: tokens.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 16,
    fontWeight: '900',
    color: tokens.colors.accent,
  },
  label: {
    fontSize: 13,
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
    fontSize: 18,
    fontWeight: '800',
    color: tokens.colors.textPrimary,
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 11,
    fontWeight: '700',
    color: tokens.colors.textMuted,
    marginLeft: 2,
  },
});

export default MetricHighlights;
