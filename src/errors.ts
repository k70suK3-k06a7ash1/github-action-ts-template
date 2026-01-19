import { Data } from 'effect'

export class ValidationError extends Data.TaggedError('ValidationError')<{
  readonly message: string
  readonly field: string
}> {}

export class ProcessingError extends Data.TaggedError('ProcessingError')<{
  readonly message: string
  readonly cause?: unknown
}> {}

export type ActionError = ValidationError | ProcessingError
