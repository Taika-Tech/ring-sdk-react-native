const { getDefaultConfig } = require('@react-native/metro-config');
const path = require('path');

// Get the default Metro configuration
const defaultConfig = getDefaultConfig(__dirname);

const extraNodeModules = {
  'ring-sdk-react-native': path.resolve(__dirname, '../../'),
};

const watchFolders = [
  path.resolve(__dirname, '../../'), // Path to your SDK package
];

module.exports = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    extraNodeModules,
  },
  watchFolders,
};
