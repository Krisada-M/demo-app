import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { tokens } from '../../ui/tokens';

interface QuickAction {
  title: string;
  description: string;
  onPress: () => void;
  icon: string;
}

interface QuickActionsGridProps {
  actions: QuickAction[];
}

const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({ actions }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Tools & Settings</Text>
      <View style={styles.grid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.title}
            style={styles.card}
            onPress={action.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{action.icon}</Text>
            </View>
            <View>
              <Text style={styles.title}>{action.title}</Text>
              <Text style={styles.description}>{action.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: tokens.colors.textPrimary,
    marginBottom: tokens.spacing.sm,
    paddingHorizontal: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.sm,
  },
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: tokens.colors.card,
    borderRadius: tokens.radius.card,
    padding: tokens.spacing.md,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: tokens.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
    color: tokens.colors.accent,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: tokens.colors.textPrimary,
  },
  description: {
    fontSize: 12,
    color: tokens.colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
});

export default QuickActionsGrid;
