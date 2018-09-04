import { loadFixture, getPort, Vssr, rp } from '../utils'

let port
const url = route => 'http://localhost:' + port + route

let vssr = null

describe('dist options', () => {
  beforeAll(async () => {
    const options = await loadFixture('basic')
    vssr = new Vssr(Object.assign(options, { dev: false }))
    port = await getPort()
    await vssr.listen(port, '0.0.0.0')
  })

  test('Specify maxAge/index in render.dist options', async () => {
    const { body } = await rp(url('/'), {
      resolveWithFullResponse: true
    })
    try {
      await rp(url('/_vssr/'), {
        resolveWithFullResponse: true
      })
    } catch (err) {
      expect(err.toString().includes('StatusCodeError'))
    }
    const distFile = body.match(/\/_vssr\/.+?\.js/)[0]
    const { headers } = await rp(url(distFile), {
      resolveWithFullResponse: true
    })
    const twoYears = (((60 * 60 * 24 * 365) * 2) / 1000).toString()
    expect(headers['cache-control'].includes(twoYears)).toBe(true)
  })

  // Close server and ask vssr to stop listening to file changes
  afterAll(async () => {
    await vssr.close()
  })
})
