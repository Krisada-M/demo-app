import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '../ui/tokens';

type Props = {
  hourRange: string;
  value: number;
  unit: string;
};

const HourlyRow: React.FC<Props> = ({ hourRange, value, unit }) => {
  return (
    <View style={styles.row}>
      <Text style={styles.hour}>{hourRange}</Text>
      <Text style={styles.value}>
        {value.toLocaleString()} <Text style={styles.unit}>{unit}</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: tokens.colors.card,
    borderRadius: 14,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.sm,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  hour: {
    fontSize: 13,
    color: tokens.colors.textMuted,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.textPrimary,
  },
  unit: {
    fontSize: 12,
    color: tokens.colors.textMuted,
    fontWeight: '500',
  },
});

export default HourlyRow;
