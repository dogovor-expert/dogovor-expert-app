import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      'src/lib/workers/**',
      'src/lib/workers/ocr-worker.js',
      'scripts/**',
      'coverage/**',
      'audit/**',
      'e2e/**',
      'test-results/**',
      'playwright-report/**',
      '.opencode/**',
      'next-env.d.ts',
      'fix-escape.js',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'node_modules/**',
      'public/**',
      '.storybook/**',
      'storybook-static/**',
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
      '.lintstagedrc.js',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/__integration__/**',
    ],
  },
  // ===== Web Workers (Tesseract/OCR) — Node + Web Worker глобалы, без parserOptions.project =====
  {
    files: ['src/lib/workers/**/*'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: false },
      },
      globals: {
        // Web Worker
        self: 'readonly',
        // Node-style (для node-polyfill в tesseract.js)
        process: 'readonly',
        Buffer: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        crypto: 'readonly',
      },
    },
    rules: {
      'no-empty': 'off',
      'no-undef': 'off', // глобалы заданы выше, но worker-API варьируется
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        crypto: 'readonly',
        self: 'readonly',
        indexedDB: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooks,
      '@next/next': nextPlugin,
    },
    rules: {
      // TypeScript
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // Supabase/API-роуты вручную типизированы как `any`; не блокируем линтом,
      // но оставляем предупреждения для постепенной миграции на строгие типы.
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-base-to-string': 'warn',

      // Критически важные правила правильной работы с промисами (из type-checking набора).
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',

      // React
      ...reactPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-key': 'error',

      // React Hooks
      ...reactHooks.configs.recommended.rules,

      // Next.js
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,

      // TypeScript сам ловит неопределённые/переопределённые переменные (tsc --noEmit),
      // поэтому базовые JS-правила дают ложные срабатывания с type-aware линтингом.
      'no-undef': 'off',
      'no-redeclare': 'off',

      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-duplicate-imports': 'error',
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always'],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  prettier,
];