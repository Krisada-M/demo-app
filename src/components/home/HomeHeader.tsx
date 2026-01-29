import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { tokens } from '../../ui/tokens';

interface HomeHeaderProps {
  greeting: string;
  dateLabel: string;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ greeting, dateLabel }) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.textBlock}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.dateText}>{dateLabel}</Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Text style={styles.iconText}>🔔</Text>
          <View style={styles.dot} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: tokens.spacing.sm,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textBlock: {
    flex: 1,
  },
  greeting: {
    ...tokens.typography.title,
    fontSize: 28, // Overriding size while keeping weight and letterSpacing
    color: tokens.colors.textPrimary,
  },
  dateText: {
    marginTop: 4,
    ...tokens.typography.body,
    fontSize: 14,
    color: tokens.colors.textMuted,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.border,
    ...tokens.shadows.soft,
  },
  iconText: {
    fontSize: 20,
  },
  dot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.colors.accent,
    borderWidth: 1.5,
    borderColor: tokens.colors.card,
  },
});

export default HomeHeader;
