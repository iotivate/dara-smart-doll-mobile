module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-worklets/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        alias: {
          '@assets': './src/assets',
          '@components': './src/components',
          '@loader': './src/components/ContentLoader',
          '@config': './src/config',
          '@navigation': './src/navigation',
          '@services': './src/services',
          '@theme': './src/theme',
          '@utils': './src/utils',
          '@views': './src/views',
          '@redux': './src/redux',
        },
      },
    ],
  ],
};
