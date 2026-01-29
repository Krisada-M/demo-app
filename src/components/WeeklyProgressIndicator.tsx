import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '../ui/tokens';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const WeeklyProgressIndicator = () => {
  const todayIndex = ((new Date().getDay() + 6) % 7) as number;
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {DAYS.map((label, index) => {
          const isToday = index === todayIndex;
          return (
            <View key={`${label}-${index}`} style={styles.item}>
              <View
                style={[
                  styles.dot,
                  isToday && {
                    backgroundColor: tokens.colors.accent,
                    transform: [{ scale: 1.2 }],
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: tokens.spacing.md,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: tokens.spacing.md,
  },
  item: {
    alignItems: 'center',
    width: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.colors.border,
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: tokens.colors.textMuted,
  },
  labelActive: {
    color: tokens.colors.textPrimary,
    fontWeight: '700',
  },
});

export default WeeklyProgressIndicator;
