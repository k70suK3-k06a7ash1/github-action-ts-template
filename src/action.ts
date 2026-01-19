import * as core from '@actions/core'
import * as github from '@actions/github'

export async function run(): Promise<void> {
  try {
    // Get inputs
    const exampleInput = core.getInput('example-input')

    core.info(`Example input: ${exampleInput}`)

    // Get the GitHub context
    const context = github.context

    core.info(`Event: ${context.eventName}`)
    core.info(`Repo: ${context.repo.owner}/${context.repo.repo}`)

    // Your action logic goes here
    const result = await doSomething(exampleInput)

    // Set outputs
    core.setOutput('example-output', result)

    core.info('Action completed successfully!')
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed('An unexpected error occurred')
    }
  }
}

async function doSomething(input: string): Promise<string> {
  // Implement your action logic here
  return `Processed: ${input}`
}
