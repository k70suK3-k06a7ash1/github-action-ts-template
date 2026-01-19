import { Schema } from 'effect'

export const InputSchema = Schema.Struct({
  exampleInput: Schema.optionalWith(Schema.String, { default: () => 'default value' }),
})

export type Input = typeof InputSchema.Type

export const decodeInput = Schema.decodeUnknown(InputSchema)
