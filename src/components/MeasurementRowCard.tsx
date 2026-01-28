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
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Text style={styles.iconText}>{iconLabel}</Text>
      </View>
      <View style={styles.textCol}>
        <Text style={styles.value}>
          {value.toLocaleString()} {unit}
        </Text>
        <Text style={styles.time}>{timeLabel}</Text>
      </View>
      <View style={styles.sparkline}>
        {[0, 1, 2, 3, 4].map(index => (
          <View
            key={index}
            style={[
              styles.sparkBar,
              { height: 6 + index * 2 },
              index === 4 && styles.sparkBarActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.card,
    borderRadius: 18,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.sm,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.accentSoft,
  },
  iconText: {
    color: tokens.colors.accent,
    fontWeight: '700',
    fontSize: 13,
  },
  textCol: {
    flex: 1,
    marginLeft: tokens.spacing.sm,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.textPrimary,
  },
  time: {
    marginTop: 2,
    fontSize: 11,
    color: tokens.colors.textMuted,
  },
  sparkline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  sparkBar: {
    width: 4,
    borderRadius: 4,
    backgroundColor: tokens.colors.border,
  },
  sparkBarActive: {
    backgroundColor: tokens.colors.accent,
  },
});

export default MeasurementRowCard;
