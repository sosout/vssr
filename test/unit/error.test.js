// import rp from 'request-promise-native'
import consola from 'consola'
import { loadFixture, getPort, Vssr } from '../utils'

let port
const url = route => 'http://localhost:' + port + route

let vssr = null
// let logSpy

describe('error', () => {
  beforeAll(async () => {
    const config = await loadFixture('error')
    vssr = new Vssr(config)
    port = await getPort()
    await vssr.listen(port, 'localhost')
  })

  test('/ should display an error', async () => {
    await expect(vssr.renderRoute('/')).rejects.toMatchObject({
      message: expect.stringContaining('not_defined is not defined')
    })
  })

  test('/404 should display an error too', async () => {
    const { error } = await vssr.renderRoute('/404')
    expect(error.message.includes('This page could not be found')).toBe(true)
  })

  test('/ with renderAndGetWindow()', async () => {
    await expect(vssr.renderAndGetWindow(url('/'))).rejects.toMatchObject({
      statusCode: 500
    })
  })

  test('Error: resolvePath()', () => {
    expect(() => vssr.resolvePath()).toThrowError()
    expect(() => vssr.resolvePath('@/pages/about.vue')).toThrowError('Cannot resolve "@/pages/about.vue"')
  })

  test('Error: callHook()', async () => {
    consola.error.mockClear()

    const errorHook = jest.fn()
    const error = new Error('test hook error')

    vssr.hook('error', errorHook)
    vssr.hook('test:error', () => { throw error })
    await vssr.callHook('test:error')

    expect(errorHook).toHaveBeenCalledTimes(1)
    expect(errorHook).toHaveBeenCalledWith(error)
    expect(consola.error).toHaveBeenCalledTimes(1)
    expect(consola.error).toHaveBeenCalledWith(error)
  })

  // Close server and ask vssr to stop listening to file changes
  afterAll(async () => {
    await vssr.close()
  })
})
