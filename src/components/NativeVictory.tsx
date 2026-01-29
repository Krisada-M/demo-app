import React from 'react';
import { Dimensions } from 'react-native';
import { G } from 'react-native-svg';
import {
  Background,
  Bar,
  Area,
  Point,
  LineSegment,
  VictoryAxis as BaseVictoryAxis,
  VictoryBar as BaseVictoryBar,
  VictoryArea as BaseVictoryArea,
  VictoryScatter as BaseVictoryScatter,
  VictoryChart as BaseVictoryChart,
  VictoryGroup as BaseVictoryGroup,
  VictoryLine as BaseVictoryLine,
  VictoryContainer,
  VictoryLabel,
  VictoryVoronoiContainer,
  VictoryTooltip,
} from 'victory-native';

const defaultWidth = Dimensions.get('window').width;

type AxisProps = React.ComponentProps<typeof BaseVictoryAxis>;
type BarProps = React.ComponentProps<typeof BaseVictoryBar>;
type AreaProps = React.ComponentProps<typeof BaseVictoryArea>;
type ScatterProps = React.ComponentProps<typeof BaseVictoryScatter>;
type ChartProps = React.ComponentProps<typeof BaseVictoryChart>;
type GroupProps = React.ComponentProps<typeof BaseVictoryGroup>;
type LineProps = React.ComponentProps<typeof BaseVictoryLine>;

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

export const VictoryArea = (props: AreaProps) => (
  <BaseVictoryArea
    dataComponent={<Area />}
    labelComponent={<VictoryLabel />}
    containerComponent={<VictoryContainer />}
    groupComponent={<G />}
    width={defaultWidth}
    {...props}
  />
);

export const VictoryScatter = (props: ScatterProps) => (
  <BaseVictoryScatter
    dataComponent={<Point />}
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

export const VictoryGroup = (props: GroupProps) => (
  <BaseVictoryGroup
    containerComponent={<VictoryContainer />}
    groupComponent={<G />}
    width={defaultWidth}
    {...props}
  />
);

export const VictoryLine = (props: LineProps) => (
  <BaseVictoryLine
    groupComponent={<G />}
    labelComponent={<VictoryLabel />}
    containerComponent={<VictoryContainer />}
    width={defaultWidth}
    {...props}
  />
);
