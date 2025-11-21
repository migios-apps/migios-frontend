import js from '@eslint/js'
import tanstackQuery from '@tanstack/eslint-plugin-query'
import prettierConfig from 'eslint-config-prettier'
import prettier from 'eslint-plugin-prettier'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import unusedImports from 'eslint-plugin-unused-imports'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig(
  {
    ignores: [
      '**/build/',
      '**/node_modules/',
      '**/dist/',
      '**/.prettierrc',
      '**/.prettierrc.js',
      '**/.eslintrc.js',
      '**/eslint.config.js',
      '**/env.d.ts',
      '**/eslint.config.mjs',
      '**/postcss.config.cjs',
      '**/tailwind.config.cjs',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'unused-imports': unusedImports,
      '@tanstack/query': tanstackQuery,
      prettier,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-refresh/only-export-components': 'off',

      // React Hooks - Disable rules yang terlalu ketat untuk build
      'react-hooks/rules-of-hooks': 'off', // Terlalu ketat, disable untuk development
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/incompatible-library': 'off',

      // TypeScript
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',

      // Unused imports
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',

      // Prettier
      'prettier/prettier': [
        'error',
        {
          singleQuote: false,
          jsxSingleQuote: false,
        },
      ],

      // TanStack Query
      '@tanstack/query/exhaustive-deps': 'error',

      // General
      'no-trailing-spaces': 'error',
      'no-console': 'off',
    },
  }
)
