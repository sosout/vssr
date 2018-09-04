import { exec } from 'child_process'
import { resolve } from 'path'
import { promisify } from 'util'

const execify = promisify(exec)
const rootDir = __dirname
const vssrBin = resolve(__dirname, '..', '..', '..', 'bin', 'vssr')

describe.skip.appveyor('cli build', () => {
  test('vssr build', async () => {
    const { stdout } = await execify(`node ${vssrBin} build ${rootDir} -c cli.build.config.js`)

    expect(stdout.includes('Compiled successfully')).toBe(true)
  }, 80000)

  test('vssr build -> error config', async () => {
    await expect(execify(`node ${vssrBin} build ${rootDir} -c config.js`)).rejects.toMatchObject({
      stdout: expect.stringContaining('Could not load config file: config.js')
    })
  })
})
