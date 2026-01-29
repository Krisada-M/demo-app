import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
      {metrics.map((metric, index) => (
        <View key={metric.label} style={styles.card}>
          <View style={[styles.iconContainer, metric.color ? { backgroundColor: metric.color + '20' } : {}]}>
            <Text style={[styles.icon, metric.color ? { color: metric.color } : {}]}>{metric.icon}</Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.value}>{metric.value.toLocaleString()}</Text>
            <Text style={styles.unit}>{metric.unit}</Text>
            <Text style={styles.label}>{metric.label}</Text>
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
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: tokens.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  icon: {
    fontSize: 16,
    fontWeight: '900',
    color: tokens.colors.accent,
  },
  content: {
    alignItems: 'center',
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    color: tokens.colors.textPrimary,
  },
  unit: {
    fontSize: 11,
    fontWeight: '700',
    color: tokens.colors.textMuted,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  label: {
    fontSize: 12,
    color: tokens.colors.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default MetricHighlights;
