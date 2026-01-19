import { javascript, typescript } from 'projen'

const project = new typescript.TypeScriptProject({
  name: 'github-action-ts-template',
  description: 'A template for creating GitHub Actions with TypeScript',
  defaultReleaseBranch: 'main',
  packageManager: javascript.NodePackageManager.NPM,
  projenrcTs: true,

  // Disable default tools in favor of our custom setup
  eslint: false,
  prettier: false,
  jest: false,

  // Dependencies
  deps: ['@actions/core', '@actions/github', 'effect'],
  devDeps: [
    '@biomejs/biome',
    '@fast-check/vitest',
    '@types/node@^20',
    'esbuild',
    'vitest',
    'xstate',
  ],

  // TypeScript strictest settings
  tsconfig: {
    compilerOptions: {
      target: 'ES2022',
      module: 'commonjs',
      lib: ['ES2022'],
      outDir: './lib',
      rootDir: './src',
      moduleResolution: javascript.TypeScriptModuleResolution.NODE,
      resolveJsonModule: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      declaration: true,
      strict: true,
      noImplicitAny: true,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
      noUncheckedIndexedAccess: true,
      noImplicitOverride: true,
      noPropertyAccessFromIndexSignature: true,
      exactOptionalPropertyTypes: true,
      useUnknownInCatchVariables: true,
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist', 'lib', '__tests__'],
  },

  // Git
  gitignore: ['dist/*.map', 'coverage/', '.env', '.DS_Store'],
})

// Custom scripts for our setup
project.addTask('build:action', {
  description: 'Build the GitHub Action bundle',
  exec: 'esbuild src/main.ts --bundle --platform=node --target=node20 --outfile=dist/index.js',
})

project.addTask('format', {
  description: 'Format code with Biome',
  exec: 'biome format --write .',
})

project.addTask('check', {
  description: 'Check code with Biome',
  exec: 'biome check .',
})

project.addTask('test:unit', {
  description: 'Run unit tests with Vitest',
  exec: 'vitest run',
})

project.addTask('test:watch', {
  description: 'Run tests in watch mode',
  exec: 'vitest',
})

project.addTask('typecheck', {
  description: 'Type check with TypeScript',
  exec: 'tsc --noEmit',
})

project.addTask('all', {
  description: 'Run all checks, tests, and build',
  exec: 'npm run check && npm run typecheck && npm run test:unit && npm run build:action',
})

project.synth()
