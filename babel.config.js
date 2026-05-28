module.exports = function (api) {
  const isTest = process.env.NODE_ENV === 'test';
  api.cache(!isTest);

  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxImportSource: 'nativewind',
          // Disable reanimated plugin in test environment to avoid native deps
          reanimated: !isTest,
        },
      ],
      ...(isTest ? [] : ['nativewind/babel']),
    ],
    plugins: [],
  };
};
