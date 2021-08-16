module.exports = {
  'src/**/*.{ts,tsx,js,jsx}': ['eslint'],
  'src/**/*.tsx?': () => 'tsc -p .',
  'src/**/*.{css,scss}': ['stylelint'],
  'src/**/*.{ts,tsx,js,jsx,json,html,yml,css,scss,md}': ['prettier --write'],
};
