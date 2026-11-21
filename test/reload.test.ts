import { spawnSync } from 'node:child_process'
import { expect, it } from 'vitest'

it('loads the reload command in Pi', () => {
  const result = spawnSync('./node_modules/.bin/pi', [
    '--offline',
    '--mode',
    'rpc',
    '--no-session',
    '--no-extensions',
    '--no-mcp',
    '--no-skills',
    '--no-context-files',
    '-e',
    './src/index.ts',
  ], {
    input: `${JSON.stringify({ type: 'get_commands' })}\n`,
    encoding: 'utf8',
    timeout: 30_000,
  })

  expect(result.status).toBe(0)
  const response = JSON.parse(result.stdout)
  expect(response.success).toBe(true)
  expect(response.data.commands).toEqual(expect.arrayContaining([
    expect.objectContaining({ name: 'pi-reload-self-run', source: 'extension' }),
  ]))
}, 35_000)
