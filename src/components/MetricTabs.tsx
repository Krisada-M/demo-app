import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MetricType } from '../health/models';

interface Props {
  selected: MetricType;
  onSelect: (type: MetricType) => void;
}

const MetricTabs: React.FC<Props> = ({ selected, onSelect }) => {
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
          style={[styles.tab, selected === tab.type && styles.activeTab]}
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
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 4,
    marginVertical: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
  },
});

export default MetricTabs;
