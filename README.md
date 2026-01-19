# GitHub Action TypeScript Template

A template repository for creating GitHub Actions with TypeScript.

## Features

- TypeScript support with strict type checking
- Bundled with [@vercel/ncc](https://github.com/vercel/ncc) for single-file distribution
- Testing with [Vitest](https://vitest.dev/)
- Linting with ESLint
- Formatting with Prettier
- CI workflow included

## Usage

### Use this template

Click "Use this template" to create a new repository based on this template.

### Customize your action

1. Update `action.yml` with your action's name, description, inputs, and outputs
2. Implement your logic in `src/action.ts`
3. Add tests in `__tests__/`

### Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format

# Build the action
npm run build

# Run all checks
npm run all
```

### Example workflow

```yaml
name: Example

on:
  push:
    branches: [main]

jobs:
  example:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run action
        uses: your-username/your-action@v1
        with:
          example-input: 'hello'
```

## Project Structure

```
.
├── .github/workflows/   # CI workflows
├── __tests__/           # Test files
├── dist/                # Bundled action (committed to repo)
├── src/
│   ├── action.ts        # Main action logic
│   └── main.ts          # Entry point
├── action.yml           # Action definition
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Publishing

1. Build and commit the `dist/` folder:
   ```bash
   npm run build
   git add dist/
   git commit -m "Build action"
   ```

2. Create a release tag:
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

3. Create a major version tag (recommended):
   ```bash
   git tag -fa v1 -m "Update v1 tag"
   git push origin v1 --force
   ```

## License

MIT
