import React from 'react';
import { DailyMetrics, MetricType } from '../health/models';
import MetricChart from './MetricChart';

type Props = {
  data: DailyMetrics[];
  metric: MetricType;
  accentColor?: string;
};

const DailyChart: React.FC<Props> = ({ data, metric, accentColor }) => {
  return <MetricChart data={data} metric={metric} accentColor={accentColor} />;
};

export default DailyChart;
