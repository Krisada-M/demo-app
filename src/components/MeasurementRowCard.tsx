import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '../ui/tokens';

type Props = {
  iconLabel: string;
  value: number;
  unit: string;
  timeLabel: string;
};

const MeasurementRowCard: React.FC<Props> = ({
  iconLabel,
  value,
  unit,
  timeLabel,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>{iconLabel}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.value}>
          {value.toLocaleString()} <Text style={styles.unit}>{unit}</Text>
        </Text>
        <Text style={styles.time}>{timeLabel}</Text>
      </View>
      <View style={styles.sparkline}>
        {[0, 1, 2, 3, 4].map(idx => (
          <View
            key={idx}
            style={[
              styles.sparkBar,
              { height: 5 + idx * 3, opacity: idx === 4 ? 1 : 0.3 },
              idx === 4 && { backgroundColor: tokens.colors.accent },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.card,
    borderRadius: 20,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.sm,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.accentSoft,
  },
  iconText: {
    color: tokens.colors.accent,
    fontWeight: '700',
    fontSize: 14,
  },
  content: {
    flex: 1,
    marginLeft: tokens.spacing.sm,
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    color: tokens.colors.textPrimary,
  },
  unit: {
    fontSize: 12,
    fontWeight: '500',
    color: tokens.colors.textMuted,
  },
  time: {
    marginTop: 2,
    fontSize: 11,
    color: tokens.colors.textMuted,
    fontWeight: '500',
  },
  sparkline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  sparkBar: {
    width: 3.5,
    borderRadius: 2,
    backgroundColor: tokens.colors.border,
  },
});

export default MeasurementRowCard;
