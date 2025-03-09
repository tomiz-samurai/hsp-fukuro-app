module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // React Native Reanimated plugin
      'react-native-reanimated/plugin',
      
      // Expo Router
      require.resolve('expo-router/babel'),
      
      // TypeScript path alias resolution
      [
        'module-resolver',
        {
          root: ['.'],
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json',
          ],
          alias: {
            '@': './',
            '@app': './app',
            '@components': './components',
            '@hooks': './hooks',
            '@lib': './lib',
            '@store': './store',
            '@services': './services',
            '@navigation': './navigation',
            '@types': './types',
            '@config': './config',
            '@assets': './assets',
            '@styles': './styles',
          },
        },
      ],
      
      // NativeWind styling
      'nativewind/babel',
    ],
  };
};
