/**
 * @format
 */

import { AppRegistry } from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import App from './App';
import { name as appName } from './app.json';
import { HealthSync } from './src/background/HealthSync';

AppRegistry.registerComponent(appName, () => App);
BackgroundFetch.registerHeadlessTask(HealthSync.headlessTask);
