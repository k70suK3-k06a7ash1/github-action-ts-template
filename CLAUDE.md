# CLAUDE.md

## Overview

TypeScript GitHub Action template with maximum type safety and robustness.

## Architecture

- **Pure functional core, imperative shell**
- All errors are Result types (Effect TS)
- Side effects isolated in Services (Layer pattern)
- Schemas define all data shapes (@effect/schema)

## Project Structure

```
src/
├── main.ts              # Entry point only (orchestration)
├── schemas/
│   ├── input.ts         # Input schema and validation
│   └── output.ts        # Output schema
├── services/
│   └── github.ts        # GitHub Actions API (side effects)
├── action/
│   └── run.ts           # Pure business logic
└── errors.ts            # Error types (Tagged Errors)
```

## Commands

```bash
npm run build      # Build with esbuild
npm run test       # Run all tests
npm run typecheck  # Type check only
npm run lint       # Biome lint
npm run format     # Biome format
npm run all        # Run all checks
```

## Rules

### Type Level
- NO `any` type - use `unknown` instead
- NO type assertions (`as`) - use type guards
- ALL data must have explicit type definitions
- Use `readonly` for all properties
- Use `ReadonlyArray<T>` instead of `T[]`

### Function Level
- Pure functions by default
- Side effects wrapped in Effect TS
- NO throwing exceptions - use `Effect.fail`
- NO `null`/`undefined` returns - use `Option`
- NO implicit returns

### Module Level
- 1 file = 1 responsibility
- MAX 50 lines per file
- NO circular dependencies
- Explicit imports/exports only

## Patterns

### Error Handling
```typescript
// Use Tagged Errors
class ValidationError extends Data.TaggedError('ValidationError')<{
  readonly message: string
  readonly field: string
}> {}

// Return Effect, don't throw
const validate = (input: unknown): Effect<Input, ValidationError> =>
  Schema.decodeUnknown(InputSchema)(input).pipe(
    Effect.mapError((e) => new ValidationError({ message: '...', field: '...' }))
  )
```

### Service Pattern
```typescript
// Define service interface
class MyService extends Context.Tag('MyService')<MyService, {
  readonly doSomething: (x: string) => Effect<string>
}>() {}

// Provide implementation via Layer
const MyServiceLive = Layer.succeed(MyService, { ... })
const MyServiceTest = Layer.succeed(MyService, { ... }) // for testing
```

## When Modifying

1. Update schema first if data shape changes
2. Update tests before implementation (TDD)
3. Run `npm run all` before committing
4. Keep files under 50 lines

## Forbidden

- `any` type
- `as` type assertions
- Throwing exceptions
- `console.log` (use `Effect.log` or service)
- Mutable data structures
- Files over 50 lines
- Circular dependencies
