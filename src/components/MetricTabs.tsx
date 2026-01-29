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
              { borderColor: accentColor },
            ],
          ]}
          onPress={() => onSelect(tab.type)}
        >
          <Text
            style={[
              styles.tabText,
              selected === tab.type && [
                styles.activeTabText,
                { color: accentColor },
              ],
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
    backgroundColor: '#F7EDE9',
    borderRadius: tokens.radius.pill,
    padding: 6,
    marginVertical: tokens.spacing.md,
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
    color: tokens.colors.textPrimary,
  },
});

export default MetricTabs;
