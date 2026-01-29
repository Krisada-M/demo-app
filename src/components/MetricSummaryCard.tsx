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
  badgeText?: string;
};

const MetricSummaryCard: React.FC<Props> = ({
  label,
  value,
  unit,
  accentColor = tokens.colors.accent,
  subtitle = 'Today',
  iconLabel,
  badgeText,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: tokens.colors.accentSoft }]}>
          <Text style={[styles.iconText, { color: accentColor }]}>
            {iconLabel ?? label[0]}
          </Text>
        </View>
        <View style={styles.titleArea}>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
        {badgeText && (
          <View style={[styles.badge, { borderColor: accentColor }]}>
            <Text style={[styles.badgeText, { color: accentColor }]}>{badgeText}</Text>
          </View>
        )}
      </View>

      <View style={styles.valueContainer}>
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
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.md,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    ...tokens.shadows.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: tokens.radius.icon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
    fontWeight: '700',
  },
  titleArea: {
    flex: 1,
    marginLeft: tokens.spacing.sm,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: tokens.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  label: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '700',
    color: tokens.colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    backgroundColor: tokens.colors.accentSoft,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 42,
    fontWeight: '800',
    color: tokens.colors.textPrimary,
    letterSpacing: -0.5,
  },
  unit: {
    marginLeft: tokens.spacing.xs,
    fontSize: 16,
    fontWeight: '500',
    color: tokens.colors.textMuted,
    marginBottom: 4,
  },
});

export default MetricSummaryCard;
