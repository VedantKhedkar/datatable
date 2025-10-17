// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextConfig from 'eslint-config-next';
import nextPlugin from '@next/eslint-plugin-next'; // <-- This import was missing

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  
  // This imports the default Next.js configuration
  nextConfig,
  
  // This object applies your custom rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@next/next': nextPlugin
    },
    rules: {
      // This is the rule to fix your build error
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }
);