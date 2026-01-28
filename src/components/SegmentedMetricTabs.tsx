import React from 'react';
import MetricTabs from './MetricTabs';
import { MetricType } from '../health/models';
import { tokens } from '../ui/tokens';

type Props = {
  selected: MetricType;
  onSelect: (type: MetricType) => void;
};

const SegmentedMetricTabs: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <MetricTabs
      selected={selected}
      onSelect={onSelect}
      accentColor={tokens.colors.accent}
    />
  );
};

export default SegmentedMetricTabs;
