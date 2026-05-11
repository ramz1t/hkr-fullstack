import { reactConfig } from '@repo/eslint-config/react'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  ...reactConfig,
])
