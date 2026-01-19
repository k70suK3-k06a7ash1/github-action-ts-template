import { Effect } from 'effect'
import { type ProcessingError, ValidationError } from '../errors'
import { decodeInput } from '../schemas/input'
import type { Output } from '../schemas/output'
import { GitHubActions } from '../services/github'

export const run: Effect.Effect<Output, ValidationError | ProcessingError, GitHubActions> =
  Effect.gen(function* () {
    const github = yield* GitHubActions

    const rawInput = yield* github.getInput('example-input')
    const input = yield* decodeInput({ exampleInput: rawInput }).pipe(
      Effect.mapError(
        () => new ValidationError({ message: 'Invalid input', field: 'example-input' })
      )
    )

    const result = `Processed: ${input.exampleInput}`

    yield* github.setOutput('example-output', result)
    yield* github.info('Action completed successfully')

    return { exampleOutput: result }
  })
