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
    fontSize: 20,
    fontWeight: '800',
    color: tokens.colors.textPrimary,
    marginBottom: tokens.spacing.md,
    paddingHorizontal: 4,
    letterSpacing: -0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: tokens.colors.card,
    borderRadius: tokens.radius.card,
    padding: 16,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...tokens.shadows.soft,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: tokens.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  icon: {
    fontSize: 18,
    color: tokens.colors.textPrimary,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: tokens.colors.textPrimary,
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: tokens.colors.textMuted,
    fontWeight: '500',
  },
});

export default QuickActionsGrid;
