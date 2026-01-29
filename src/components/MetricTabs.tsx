import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MetricType } from '../health/models';
import { tokens } from '../ui/tokens';

interface Props {
  selected: MetricType;
  onSelect: (type: MetricType) => void;
  accentColor?: string;
}

const MetricTabs: React.FC<Props> = ({
  selected,
  onSelect,
  accentColor = tokens.colors.accent,
}) => {
  const tabs: { type: MetricType; label: string }[] = [
    { type: 'steps', label: 'Steps' },
    { type: 'activeCaloriesKcal', label: 'Calories' },
    { type: 'distanceMeters', label: 'Distance' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.type}
          style={[
            styles.tab,
            selected === tab.type && [
              styles.activeTab,
              { backgroundColor: accentColor },
            ],
          ]}
          onPress={() => onSelect(tab.type)}
        >
          <Text
            style={[
              styles.tabText,
              selected === tab.type && styles.activeTabText,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: tokens.colors.background, // Cleaner background
    borderRadius: tokens.radius.pill,
    padding: 4,
    marginVertical: tokens.spacing.md,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTab: {
    backgroundColor: tokens.colors.card,
    shadowColor: '#5B4134',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.textMuted,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default MetricTabs;
