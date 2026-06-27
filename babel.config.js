module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Reanimated 4 → worklets 플러그인. 반드시 맨 마지막.
    plugins: ['react-native-worklets/plugin'],
  };
};
