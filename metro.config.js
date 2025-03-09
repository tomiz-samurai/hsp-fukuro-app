/**
 * Metro Configuration
 * 
 * Metro is the JavaScript bundler used by React Native.
 * This file configures Metro for the Fukuro HSP app.
 */

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Get the default Metro configuration for Expo
const config = getDefaultConfig(__dirname);

// Configure Metro to handle the app's directory structure
config.watchFolders = [path.resolve(__dirname)];

// Add additional file extensions to handle
config.resolver.sourceExts = [
  'js',
  'jsx',
  'ts',
  'tsx',
  'json',
  'cjs',
  'mjs',
];

// Enable the use of Node.js modules in Metro
config.resolver.extraNodeModules = {
  'stream': require.resolve('stream-browserify'),
  'crypto': require.resolve('crypto-browserify'),
};

// Add support for absolute imports
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Export the configured Metro options
module.exports = config;
