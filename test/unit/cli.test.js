import { spawn } from 'child_process'
import { resolve, join } from 'path'
import { writeFileSync } from 'fs-extra'
import { getPort, rp, waitUntil, Utils } from '../utils'

let port
const rootDir = resolve(__dirname, '..', 'fixtures/cli')

const url = route => 'http://localhost:' + port + route
const vssrBin = resolve(__dirname, '..', '..', 'bin', 'vssr')

const close = async (vssrInt) => {
  vssrInt.kill('SIGKILL')
  // Wait max 10s for the process to be killed
  if (await waitUntil(() => vssrInt.killed, 10)) {
    // eslint-disable-next-line no-console
    console.warn(`Unable to close process with pid: ${vssrInt.pid}`)
  }
}

describe.skip.appveyor('cli', () => {
  test('vssr dev', async () => {
    let stdout = ''
    const env = process.env
    env.PORT = port = await getPort()

    const vssrDev = spawn('node', [vssrBin, 'dev', rootDir], { env })
    vssrDev.stdout.on('data', (data) => { stdout += data })

    // Wait max 20s for the starting
    await waitUntil(() => stdout.includes(`${port}`))

    // Change file specified in `watchers` (vssr.config.js)
    const customFilePath = join(rootDir, 'custom.file')
    writeFileSync(customFilePath, 'This file is used to test custom chokidar watchers.')

    // Change file specified in `serverMiddleware` (vssr.config.js)
    const serverMiddlewarePath = join(rootDir, 'middleware.js')
    writeFileSync(serverMiddlewarePath, '// This file is used to test custom chokidar watchers.\n')

    // Wait 2s for picking up changes
    await Utils.waitFor(2000)

    // [Add actual test for changes here]

    await close(vssrDev)
  })

  test('vssr start', async () => {
    let stdout = ''
    let error

    const env = process.env
    env.PORT = port = await getPort()

    await new Promise((resolve) => {
      const vssrBuild = spawn('node', [vssrBin, 'build', rootDir], { env })
      vssrBuild.on('close', () => { resolve() })
    })

    const vssrStart = spawn('node', [vssrBin, 'start', rootDir], { env })

    vssrStart.stdout.on('data', (data) => { stdout += data })
    vssrStart.on('error', (err) => { error = err })

    // Wait max 40s for the starting
    if (await waitUntil(() => stdout.includes(`${port}`), 40)) {
      error = 'server failed to start successfully in 40 seconds'
    }

    expect(error).toBe(undefined)
    expect(stdout.includes('Listening on')).toBe(true)

    const html = await rp(url('/'))
    expect(html).toMatch(('<div>CLI Test</div>'))

    await close(vssrStart)
  })
})
