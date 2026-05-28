module.exports = function (api) {
  const isTest = process.env.NODE_ENV === 'test';
  api.cache(!isTest);

  return {
    presets: [
      [
        'babel-preset-expo',
        {
          reanimated: !isTest,
        },
      ],
    ],
    plugins: [],
  };
};
