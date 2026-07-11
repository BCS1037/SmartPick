import globals from 'globals';
import importPlugin from 'eslint-plugin-import';
import obsidianPlugin from 'eslint-plugin-obsidianmd';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        activeDocument: 'readonly',
        activeWindow: 'readonly',
      },
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      import: importPlugin,
      obsidianmd: obsidianPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      'import/no-nodejs-modules': 'error',
      'no-restricted-globals': ['error', {
        name: 'fetch',
        message: 'Use requestUrl for network requests in Obsidian.',
      }],
      'obsidianmd/no-static-styles-assignment': 'error',
    },
  }
);
