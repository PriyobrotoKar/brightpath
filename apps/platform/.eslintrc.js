module.exports = {
  extends: ['@brightpath/eslint-config/next.js'],
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
};
