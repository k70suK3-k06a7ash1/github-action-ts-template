import { Effect } from 'effect'
import { run } from './action/run'
import { GitHubActions, GitHubActionsLive } from './services/github'

const program = run.pipe(
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      const github = yield* GitHubActions
      yield* github.setFailed(error.message)
    })
  ),
  Effect.provide(GitHubActionsLive)
)

Effect.runPromise(program)
