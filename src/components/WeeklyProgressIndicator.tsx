import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '../ui/tokens';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const WeeklyProgressIndicator = () => {
  const todayIndex = ((new Date().getDay() + 6) % 7) as number;
  return (
    <View style={styles.row}>
      {DAYS.map((label, index) => {
        const isToday = index === todayIndex;
        return (
          <View key={`${label}-${index}`} style={styles.item}>
            <View
              style={[
                styles.ring,
                isToday && {
                  borderColor: tokens.colors.accent,
                  backgroundColor: tokens.colors.accentSoft,
                },
              ]}
            />
            <Text style={[styles.label, isToday && styles.labelActive]}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.md,
  },
  item: {
    alignItems: 'center',
    width: 36,
  },
  ring: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.card,
  },
  label: {
    marginTop: 6,
    fontSize: 10,
    color: tokens.colors.textMuted,
  },
  labelActive: {
    color: tokens.colors.textPrimary,
    fontWeight: '600',
  },
});

export default WeeklyProgressIndicator;
