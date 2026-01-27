import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import HourlyScreen from '../screens/HourlyScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DebugScreen from '../screens/DebugScreen';
import { MetricType } from '../health/models';

export type RootStackParamList = {
  Home: undefined;
  Hourly: { initialMetric: MetricType };
  Profile: undefined;
  Debug: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Health Connect Overview' }}
        />
        <Stack.Screen
          name="Hourly"
          component={HourlyScreen}
          options={{ title: 'Today Breakdown' }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'Profile & Estimates' }}
        />
        <Stack.Screen
          name="Debug"
          component={DebugScreen}
          options={{ title: 'Debug Tools' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
