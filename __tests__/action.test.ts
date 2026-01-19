import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as core from '@actions/core'
import { run } from '../src/action'

vi.mock('@actions/core')
vi.mock('@actions/github', () => ({
  context: {
    eventName: 'push',
    repo: {
      owner: 'test-owner',
      repo: 'test-repo'
    }
  }
}))

describe('action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should run successfully with default input', async () => {
    vi.mocked(core.getInput).mockReturnValue('default value')

    await run()

    expect(core.info).toHaveBeenCalledWith('Example input: default value')
    expect(core.setOutput).toHaveBeenCalledWith(
      'example-output',
      'Processed: default value'
    )
    expect(core.info).toHaveBeenCalledWith('Action completed successfully!')
  })

  it('should run successfully with custom input', async () => {
    vi.mocked(core.getInput).mockReturnValue('custom value')

    await run()

    expect(core.info).toHaveBeenCalledWith('Example input: custom value')
    expect(core.setOutput).toHaveBeenCalledWith(
      'example-output',
      'Processed: custom value'
    )
  })
})
