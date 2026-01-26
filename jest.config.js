module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules[/\\](?!((react-native|@react-native|@react-navigation/native|@react-navigation/native-stack|@react-navigation/.*|react-native-safe-area-context|react-native-screens|react-native-worklets|react-native-reanimated|react-native-svg|victory-native)/))',
  ],
};
