import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { tokens } from '../../ui/tokens';
import WeeklyProgressIndicator from '../WeeklyProgressIndicator';

interface HomeHeaderProps {
  greeting: string;
  dateLabel: string;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ greeting, dateLabel }) => {
  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={styles.todayLabel}>Today</Text>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.dateText}>{dateLabel}</Text>
      </View>
      <View style={styles.statsRow}>
        <WeeklyProgressIndicator />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: tokens.spacing.md,
    alignItems: 'center',
  },
  textBlock: {
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
  },
  todayLabel: {
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '700',
    color: tokens.colors.accent,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: tokens.colors.textPrimary,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'AvenirNext-Bold',
      android: 'sans-serif-medium',
    }),
    letterSpacing: -0.5,
  },
  dateText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.textMuted,
  },
  statsRow: {
    width: '100%',
    marginTop: tokens.spacing.sm,
  },
});

export default HomeHeader;
