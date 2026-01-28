import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '../ui/tokens';

type Props = {
  label: string;
  value: number;
  unit: string;
  accentColor?: string;
  subtitle?: string;
  iconLabel?: string;
};

const MetricSummaryCard: React.FC<Props> = ({
  label,
  value,
  unit,
  accentColor = tokens.colors.accent,
  subtitle = 'Today',
  iconLabel,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.iconWrap, { borderColor: accentColor }]}>
          <View style={[styles.iconDot, { backgroundColor: accentColor }]} />
          <Text style={[styles.iconText, { color: accentColor }]}>
            {iconLabel ?? label[0]}
          </Text>
        </View>
        <View style={styles.textCol}>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value.toLocaleString()}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.card,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
    shadowColor: '#5B4134',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.accentSoft,
  },
  iconDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    top: 8,
    right: 8,
  },
  iconText: {
    fontSize: 16,
    fontWeight: '700',
  },
  textCol: {
    marginLeft: tokens.spacing.sm,
  },
  subtitle: {
    fontSize: 12,
    color: tokens.colors.textMuted,
  },
  label: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.textPrimary,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: tokens.spacing.sm,
  },
  value: {
    fontSize: 30,
    fontWeight: '700',
    color: tokens.colors.textPrimary,
    letterSpacing: 0.3,
  },
  unit: {
    marginLeft: tokens.spacing.xs,
    fontSize: 13,
    color: tokens.colors.textMuted,
    paddingBottom: 4,
  },
});

export default MetricSummaryCard;
