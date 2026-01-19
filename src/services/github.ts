import * as core from '@actions/core'
import { Context, Effect, Layer } from 'effect'

export class GitHubActions extends Context.Tag('GitHubActions')<
  GitHubActions,
  {
    readonly getInput: (name: string) => Effect.Effect<string>
    readonly setOutput: (name: string, value: string) => Effect.Effect<void>
    readonly setFailed: (message: string) => Effect.Effect<void>
    readonly info: (message: string) => Effect.Effect<void>
  }
>() {}

export const GitHubActionsLive = Layer.succeed(GitHubActions, {
  getInput: (name) => Effect.sync(() => core.getInput(name)),
  setOutput: (name, value) => Effect.sync(() => core.setOutput(name, value)),
  setFailed: (message) => Effect.sync(() => core.setFailed(message)),
  info: (message) => Effect.sync(() => core.info(message)),
})

export const GitHubActionsTest = Layer.succeed(GitHubActions, {
  getInput: () => Effect.succeed('test-value'),
  setOutput: () => Effect.void,
  setFailed: () => Effect.void,
  info: () => Effect.void,
})
