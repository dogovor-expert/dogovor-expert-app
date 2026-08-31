export default {
  '*.{ts,tsx}': [
    'eslint --fix --max-warnings=0',
    'prettier --write',
    'tsc --noEmit',
  ],
  '*.{js,jsx}': [
    'eslint --fix --max-warnings=0',
    'prettier --write',
  ],
  '*.{css,scss,json,md}': [
    'prettier --write',
  ],
};