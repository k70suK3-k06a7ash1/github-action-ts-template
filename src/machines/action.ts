import { setup } from 'xstate'

export type ActionContext = {
  readonly input: string | null
  readonly output: string | null
  readonly error: string | null
}

export type ActionEvent =
  | { type: 'START'; input: string }
  | { type: 'VALIDATE_SUCCESS' }
  | { type: 'VALIDATE_FAILURE'; error: string }
  | { type: 'PROCESS_SUCCESS'; output: string }
  | { type: 'PROCESS_FAILURE'; error: string }
  | { type: 'RESET' }

export const actionMachine = setup({
  types: {
    context: {} as ActionContext,
    events: {} as ActionEvent,
  },
}).createMachine({
  id: 'action',
  initial: 'idle',
  context: { input: null, output: null, error: null },
  states: {
    idle: {
      on: {
        START: {
          target: 'validating',
          actions: ({ event }) => ({ input: event.input }),
        },
      },
    },
    validating: {
      on: {
        VALIDATE_SUCCESS: { target: 'processing' },
        VALIDATE_FAILURE: {
          target: 'failed',
          actions: ({ event }) => ({ error: event.error }),
        },
      },
    },
    processing: {
      on: {
        PROCESS_SUCCESS: {
          target: 'succeeded',
          actions: ({ event }) => ({ output: event.output }),
        },
        PROCESS_FAILURE: {
          target: 'failed',
          actions: ({ event }) => ({ error: event.error }),
        },
      },
    },
    succeeded: { type: 'final' },
    failed: { type: 'final' },
  },
})

export type ActionMachine = typeof actionMachine
