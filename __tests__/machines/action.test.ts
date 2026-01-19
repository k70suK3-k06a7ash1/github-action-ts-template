import { describe, expect, it } from 'vitest'
import { createActor } from 'xstate'
import { actionMachine } from '../../src/machines/action'

describe('actionMachine', () => {
  it('should start in idle state', () => {
    const actor = createActor(actionMachine)
    actor.start()

    expect(actor.getSnapshot().value).toBe('idle')
    actor.stop()
  })

  it('should transition to validating on START', () => {
    const actor = createActor(actionMachine)
    actor.start()
    actor.send({ type: 'START', input: 'test-input' })

    expect(actor.getSnapshot().value).toBe('validating')
    actor.stop()
  })

  it('should transition to processing on VALIDATE_SUCCESS', () => {
    const actor = createActor(actionMachine)
    actor.start()
    actor.send({ type: 'START', input: 'test-input' })
    actor.send({ type: 'VALIDATE_SUCCESS' })

    expect(actor.getSnapshot().value).toBe('processing')
    actor.stop()
  })

  it('should transition to succeeded on PROCESS_SUCCESS', () => {
    const actor = createActor(actionMachine)
    actor.start()
    actor.send({ type: 'START', input: 'test-input' })
    actor.send({ type: 'VALIDATE_SUCCESS' })
    actor.send({ type: 'PROCESS_SUCCESS', output: 'result' })

    expect(actor.getSnapshot().value).toBe('succeeded')
    actor.stop()
  })

  it('should transition to failed on VALIDATE_FAILURE', () => {
    const actor = createActor(actionMachine)
    actor.start()
    actor.send({ type: 'START', input: 'test-input' })
    actor.send({ type: 'VALIDATE_FAILURE', error: 'Invalid input' })

    expect(actor.getSnapshot().value).toBe('failed')
    actor.stop()
  })

  it('should transition to failed on PROCESS_FAILURE', () => {
    const actor = createActor(actionMachine)
    actor.start()
    actor.send({ type: 'START', input: 'test-input' })
    actor.send({ type: 'VALIDATE_SUCCESS' })
    actor.send({ type: 'PROCESS_FAILURE', error: 'Processing error' })

    expect(actor.getSnapshot().value).toBe('failed')
    actor.stop()
  })
})
