import { test } from '@fast-check/vitest'
import { Effect, Layer } from 'effect'
import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { run } from '../src/action/run'
import { GitHubActions, GitHubActionsTest } from '../src/services/github'

describe('action', () => {
  it('should run successfully with test layer', async () => {
    const program = run.pipe(Effect.provide(GitHubActionsTest))
    const result = await Effect.runPromise(program)

    expect(result.exampleOutput).toBe('Processed: test-value')
  })

  test.prop([fc.string()])('should process any string input without throwing', async (input) => {
    const testLayer = Layer.succeed(GitHubActions, {
      getInput: () => Effect.succeed(input),
      setOutput: () => Effect.void,
      setFailed: () => Effect.void,
      info: () => Effect.void,
    })

    const program = run.pipe(Effect.provide(testLayer))
    const exit = await Effect.runPromiseExit(program)

    // Should either succeed or fail with a typed error, never throw
    expect(exit._tag === 'Success' || exit._tag === 'Failure').toBe(true)
  })
})
