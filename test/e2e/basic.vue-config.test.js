import Browser from '../utils/browser'
import { getPort, loadFixture, Vssr } from '../utils'

let port
const browser = new Browser()
const url = route => 'http://localhost:' + port + route

let vssr = null
let page = null

const startServer = async (type = 'basic') => {
  const config = await loadFixture(type)
  vssr = new Vssr(config)
  port = await getPort()
  await vssr.listen(port, 'localhost')

  return vssr
}

describe('basic vue-config', () => {
  beforeAll(async () => {
    await browser.start({
      // slowMo: 50,
      // headless: false
    })
  })

  test('default', async () => {
    vssr = await startServer()
    expect(vssr.options.vue.config).toEqual({ silent: true, performance: false })
    page = await browser.page(url('/config'))

    expect(await page.$text('#silent')).toBe('true')
    expect(await page.$text('#performance')).toBe('false')
  })

  test('explicit', async () => {
    vssr = await startServer('config-explicit')
    page = await browser.page(url('/config'))

    expect(vssr.options.vue.config).toEqual({ silent: false, performance: true, devtools: true })

    expect(await page.$text('#silent')).toBe('false')
    expect(await page.$text('#performance')).toBe('true')
    expect(await page.$text('#devtools')).toBe('true')
  })

  afterEach(async () => {
    await vssr.close()
  })

  afterAll(async () => {
    await page.close()
    await browser.close()
  })
})
