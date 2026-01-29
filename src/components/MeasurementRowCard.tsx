import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { tokens } from '../ui/tokens';
import { VictoryGroup, VictoryLine, VictoryArea } from './NativeVictory';

interface MeasurementRowCardProps {
  label: string;
  value: string | number;
  unit?: string;
  statusText?: string;
  icon: string;
  color: string;
  data: { x: number; y: number }[]; // For sparkline
  onPress?: () => void;
}

const MeasurementRowCard: React.FC<MeasurementRowCardProps> = ({
  label,
  value,
  unit,
  statusText,
  icon,
  color,
  data,
  onPress,
}) => {

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftSide}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          <Text style={[styles.icon, { color }]}>{icon}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.valueText}>
            {value}
            {unit && <Text style={styles.unitText}> {unit}</Text>}
          </Text>
          <Text style={styles.label}>{statusText || label}</Text>
        </View>
      </View>

      <View style={styles.rightSide}>
        <View style={styles.chartWrap}>
          <VictoryGroup
            width={80}
            height={30}
            padding={0}
          >
            <VictoryArea
              data={data}
              style={{
                data: {
                  fill: color,
                  fillOpacity: 0.1,
                  strokeWidth: 0,
                },
              }}
              interpolation="monotoneX"
            />
            <VictoryLine
              data={data}
              style={{
                data: {
                  stroke: color,
                  strokeWidth: 2.5,
                },
              }}
              interpolation="monotoneX"
            />
          </VictoryGroup>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.card,
    borderRadius: 24, // Slightly less rounded than main card for list feel
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    ...tokens.shadows.soft,
  },
  leftSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  textContainer: {
    justifyContent: 'center',
  },
  valueText: {
    ...tokens.typography.body,
    fontSize: 17,
    fontWeight: '700',
    color: tokens.colors.textPrimary,
  },
  unitText: {
    fontSize: 12,
    color: tokens.colors.textMuted,
    fontWeight: '500',
  },
  label: {
    ...tokens.typography.caption,
    fontSize: 12,
    color: tokens.colors.textMuted,
    marginTop: 1,
  },
  rightSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chartWrap: {
    width: 80,
    height: 30,
    overflow: 'hidden',
  },
  chevron: {
    fontSize: 20,
    color: tokens.colors.border,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default MeasurementRowCard;
