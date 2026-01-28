import React from 'react';
import { Dimensions } from 'react-native';
import { G } from 'react-native-svg';
import {
  Background,
  Bar,
  LineSegment,
  VictoryAxis as BaseVictoryAxis,
  VictoryBar as BaseVictoryBar,
  VictoryChart as BaseVictoryChart,
  VictoryContainer,
  VictoryLabel,
} from 'victory-native';

const defaultWidth = Dimensions.get('window').width;

type AxisProps = React.ComponentProps<typeof BaseVictoryAxis>;
type BarProps = React.ComponentProps<typeof BaseVictoryBar>;
type ChartProps = React.ComponentProps<typeof BaseVictoryChart>;

export const VictoryAxis = (props: AxisProps) => (
  <BaseVictoryAxis
    axisComponent={<LineSegment />}
    axisLabelComponent={<VictoryLabel />}
    tickLabelComponent={<VictoryLabel />}
    tickComponent={<LineSegment />}
    gridComponent={<LineSegment />}
    containerComponent={<VictoryContainer />}
    groupComponent={<G />}
    width={defaultWidth}
    {...props}
  />
);

export const VictoryBar = (props: BarProps) => (
  <BaseVictoryBar
    dataComponent={<Bar />}
    labelComponent={<VictoryLabel />}
    containerComponent={<VictoryContainer />}
    groupComponent={<G />}
    width={defaultWidth}
    {...props}
  />
);

export const VictoryChart = (props: ChartProps) => (
  <BaseVictoryChart
    backgroundComponent={<Background />}
    containerComponent={<VictoryContainer />}
    groupComponent={<G />}
    defaultAxes={{
      independent: <VictoryAxis />,
      dependent: <VictoryAxis dependentAxis />,
    }}
    prependDefaultAxes={true}
    width={defaultWidth}
    {...props}
  />
);
