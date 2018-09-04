import { exec } from 'child_process'
import { resolve } from 'path'
import { promisify } from 'util'

const execify = promisify(exec)
const rootDir = __dirname
const vssrBin = resolve(__dirname, '..', '..', '..', 'bin', 'vssr')

describe.skip.appveyor('cli generate', () => {
  test('vssr generate', async () => {
    const { stdout } = await execify(`node ${vssrBin} generate ${rootDir} -c cli.gen.config.js`)

    expect(stdout.includes('Generated successfully')).toBe(true)
  }, 80000)
})
