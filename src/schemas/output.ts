import { Schema } from 'effect'

export const OutputSchema = Schema.Struct({
  exampleOutput: Schema.String,
})

export type Output = typeof OutputSchema.Type
