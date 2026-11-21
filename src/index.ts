import type { ExtensionAPI } from '@earendil-works/pi-coding-agent'
import { Type } from 'typebox'

const COMMAND_NAME = 'pi-reload-self-run'
const RELOAD_PENDING = Symbol.for('@34j/pi-reload-self/pending')

export default function reloadSelfExtension(pi: ExtensionAPI): void {
  let reloadRequested = false

  pi.on('session_start', (event) => {
    if (event.reason === 'reload' && Reflect.has(globalThis, RELOAD_PENDING)) {
      Reflect.deleteProperty(globalThis, RELOAD_PENDING)
      pi.sendUserMessage('[pi-reload-self] Reload completed.', { deliverAs: 'followUp' })
    }
  })

  pi.registerCommand(COMMAND_NAME, {
    description: 'Internal Pi reload command',
    handler: async (_args, ctx) => {
      Reflect.set(globalThis, RELOAD_PENDING, true)
      try {
        await ctx.reload()
      }
      catch (error) {
        Reflect.deleteProperty(globalThis, RELOAD_PENDING)
        throw error
      }
    },
  })

  pi.registerTool({
    name: 'pi_extension_dev_reload_self',
    label: 'Reload Pi',
    description: 'Run /reload without user interaction.',
    promptSnippet: 'Run /reload without user interaction.',
    parameters: Type.Object({}),
    async execute() {
      reloadRequested = true
      return {
        content: [
          { type: 'text', text: 'Reload queued.' },
        ],
        details: {},
        terminate: true,
      }
    },
  })

  pi.on('agent_settled', () => {
    if (!reloadRequested)
      return
    reloadRequested = false
    pi.sendUserMessage(`/${COMMAND_NAME}`, { expandPromptTemplates: true })
  })
}
