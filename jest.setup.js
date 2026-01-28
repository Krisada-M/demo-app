jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const SafeAreaProvider = ({ children }) =>
    React.createElement(React.Fragment, null, children);

  return {
    SafeAreaProvider,
    SafeAreaView: SafeAreaProvider,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
  screensEnabled: jest.fn(),
}));
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    ...jest.requireActual('@react-navigation/native'),
    NavigationContainer: ({ children }) =>
      React.createElement(React.Fragment, null, children),
  };
});
jest.mock('@react-navigation/native-stack', () => {
  const React = require('react');
  return {
    createNativeStackNavigator: jest.fn(() => ({
      Navigator: ({ children }) =>
        React.createElement(React.Fragment, null, children),
      Screen: ({ component: Component, children }) =>
        Component
          ? React.createElement(Component, null)
          : React.createElement(React.Fragment, null, children),
    })),
  };
});
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('victory-native', () => {
  const React = require('react');
  const { View } = require('react-native');

  const Mock = ({ children }) => React.createElement(View, null, children);

  return {
    VictoryBar: Mock,
    VictoryChart: Mock,
    VictoryAxis: Mock,
    VictoryTheme: { material: {} },
  };
});

jest.mock('./src/health/HealthLayer', () => {
  const { HealthStatus } = require('./src/health/models');
  const {
    createEmptyDailySeries,
    createEmptyHourlySeries,
  } = require('./src/health/utils/timeBuckets');

  return {
    HealthLayer: {
      ensurePermissions: jest.fn(async () => HealthStatus.OK),
      getDailyLast7Days: jest.fn(async () => createEmptyDailySeries()),
      getTodayHourly: jest.fn(async () => createEmptyHourlySeries()),
    },
  };
});

jest.mock('./src/navigation/AppNavigator', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  const MockNavigator = () =>
    React.createElement(
      View,
      null,
      React.createElement(Text, null, 'AppNavigator'),
    );

  return {
    __esModule: true,
    default: MockNavigator,
  };
});
