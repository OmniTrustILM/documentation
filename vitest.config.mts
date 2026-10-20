import {defineConfig} from 'vitest/config';
import {fileURLToPath} from 'node:url';

const local = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@site': local('./'),
      '@theme/Layout': local('./test/support/Layout.tsx'),
      '@theme/Icon/LightMode': local('./node_modules/@docusaurus/theme-classic/lib/theme/Icon/LightMode/index.js'),
      '@theme/Icon/DarkMode': local('./node_modules/@docusaurus/theme-classic/lib/theme/Icon/DarkMode/index.js'),
      '@theme/Icon/SystemColorMode': local('./node_modules/@docusaurus/theme-classic/lib/theme/Icon/SystemColorMode/index.js'),
      '@theme/CodeBlock': local('./node_modules/@docusaurus/theme-classic/src/theme/CodeBlock'),
      '@theme/Icon': local('./node_modules/@docusaurus/theme-classic/src/theme/Icon'),
      '@docusaurus/BrowserOnly': local('./node_modules/@docusaurus/core/lib/client/exports/BrowserOnly.js'),
      '@docusaurus/Translate': local('./node_modules/@docusaurus/core/lib/client/exports/Translate.js'),
      '@docusaurus/Link': local('./test/support/Link.tsx'),
      '@docusaurus/useBaseUrl': local('./test/support/useBaseUrl.ts'),
      '@docusaurus/useIsBrowser': local('./test/support/useIsBrowser.ts'),
      '@docusaurus/useBrokenLinks': local('./test/support/useBrokenLinks.ts'),
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.tsx'],
    setupFiles: ['./test/setup.ts'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.tsx', 'src/**/*.ts'],
      exclude: ['src/**/*.test.tsx', 'src/**/*.d.ts'],
      reporter: ['text', 'lcov', 'json-summary'],
      reportsDirectory: 'coverage-ui',
      thresholds: {lines: 80, branches: 80, functions: 80, statements: 80},
    },
  },
});
