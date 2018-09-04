import Browser from '../utils/browser'
import { loadFixture, getPort, Vssr } from '../utils'

let port
const browser = new Browser()
const url = route => 'http://localhost:' + port + route

let vssr = null
let page = null

describe('basic browser', () => {
  beforeAll(async () => {
    const config = await loadFixture('basic')
    vssr = new Vssr(config)
    port = await getPort()
    await vssr.listen(port, 'localhost')

    await browser.start({
      // slowMo: 50,
      // headless: false
    })
  })

  test('Open /', async () => {
    page = await browser.page(url('/'))

    expect(await page.$text('h1')).toBe('Index page')
  })

  test('/noloading', async () => {
    const { hook } = await page.vssr.navigate('/noloading')
    const loading = await page.vssr.loadingData()
    expect(loading.show).toBe(true)
    await hook
    expect(loading.show).toBe(true)
    await page.waitForFunction(
      `$vssr.$loading.$data.show === false`
    )
    await page.waitForFunction(
      `document.querySelector('p').innerText === 'true'`
    )
  })

  test('/stateless', async () => {
    const { hook } = await page.vssr.navigate('/stateless', false)
    const loading = await page.vssr.loadingData()

    expect(loading.show).toBe(true)
    await hook
    expect(await page.$text('h1')).toBe('My component!')
  })

  test('/css', async () => {
    await page.vssr.navigate('/css')

    expect(await page.$text('.red')).toBe('This is red')
    expect(await page.$eval('.red', (red) => {
      const { color, backgroundColor } = window.getComputedStyle(red)
      return { color, backgroundColor }
    })).toEqual({
      color: 'rgb(255, 0, 0)',
      backgroundColor: 'rgb(0, 0, 255)'
    })
  })

  test.skip('/stateful', async () => {
    const { hook } = await page.vssr.navigate('/stateful')

    await hook
    expect(await page.$text('p')).toBe('The answer is 42')
  })

  test('/store', async () => {
    await page.vssr.navigate('/store')

    expect(await page.$text('h1')).toBe('Vuex Nested Modules')
    expect(await page.$text('p')).toBe('1')
  })

  test('/head', async () => {
    const msg = new Promise(resolve =>
      page.on('console', msg => resolve(msg.text()))
    )
    await page.vssr.navigate('/head')
    const metas = await page.$$attr('meta', 'content')

    expect(await msg).toBe('Body script!')
    expect(await page.title()).toBe('My title - Vssr.js')
    expect(await page.$text('h1')).toBe('I can haz meta tags')
    expect(metas[0]).toBe('my meta')
  })

  test('/async-data', async () => {
    await page.vssr.navigate('/async-data')

    expect(await page.$text('p')).toBe('Vssr.js')
  })

  test('/await-async-data', async () => {
    await page.vssr.navigate('/await-async-data')

    expect(await page.$text('p')).toBe('Await Vssr.js')
  })

  test('/callback-async-data', async () => {
    await page.vssr.navigate('/callback-async-data')

    expect(await page.$text('p')).toBe('Callback Vssr.js')
  })

  test('/users/1', async () => {
    await page.vssr.navigate('/users/1')

    expect(await page.$text('h1')).toBe('User: 1')
  })

  test('/validate should display a 404', async () => {
    await page.vssr.navigate('/validate')

    const error = await page.vssr.errorData()

    expect(error.statusCode).toBe(404)
    expect(error.message).toBe('This page could not be found')
  })

  test('/validate-async should display a 404', async () => {
    await page.vssr.navigate('/validate-async')

    const error = await page.vssr.errorData()

    expect(error.statusCode).toBe(404)
    expect(error.message).toBe('This page could not be found')
  })

  test('/validate?valid=true', async () => {
    await page.vssr.navigate('/validate?valid=true')

    expect(await page.$text('h1')).toBe('I am valid')
  })

  test('/validate-async?valid=true', async () => {
    await page.vssr.navigate('/validate-async?valid=true')

    expect(await page.$text('h1')).toBe('I am valid')
  })

  test('/redirect', async () => {
    await page.vssr.navigate('/redirect')

    expect(await page.$text('h1')).toBe('Index page')
  })

  test('/error', async () => {
    await page.vssr.navigate('/error')

    expect(await page.vssr.errorData()).toEqual({ statusCode: 500 })
    expect(await page.$text('.title')).toBe('Error mouahahah')
  })

  test('/error2', async () => {
    await page.vssr.navigate('/error2')

    expect(await page.$text('.title')).toBe('Custom error')
    expect(await page.vssr.errorData()).toEqual({ message: 'Custom error' })
  })

  test('/redirect-middleware', async () => {
    await page.vssr.navigate('/redirect-middleware')

    expect(await page.$text('h1')).toBe('Index page')
  })

  test('/redirect-external', async () => {
    // New page for redirecting to external link.
    const page = await browser.page(url('/'))

    await page.vssr.navigate('/redirect-external', false)

    await page.waitForFunction(
      () => window.location.href === 'https://nuxtjs.org/'
    )
    page.close()
  })

  test('/redirect-name', async () => {
    await page.vssr.navigate('/redirect-name')

    expect(await page.$text('h1')).toBe('My component!')
  })

  test('/no-ssr', async () => {
    await page.vssr.navigate('/no-ssr')

    expect(await page.$text('h1')).toBe('Displayed only on client-side')
  })

  test('/pug', async () => {
    await page.vssr.navigate('/pug')

    expect(await page.$text('h1')).toBe('Pug page')
  })

  test('/meta', async () => {
    await page.vssr.navigate('/meta')

    const state = await page.vssr.storeState()
    expect(state.meta).toEqual([{ works: true }])
  })

  test('/fn-midd', async () => {
    await page.vssr.navigate('/fn-midd')

    expect(await page.$text('.title')).toBe('You need to ask the permission')
    expect(await page.vssr.errorData()).toEqual({
      message: 'You need to ask the permission',
      statusCode: 403
    })
  })

  test('/fn-midd?please=true', async () => {
    await page.vssr.navigate('/fn-midd?please=true')

    const h1 = await page.$text('h1')
    expect(h1.includes('Date:')).toBe(true)
  })

  test('/router-guard', async () => {
    await page.vssr.navigate('/router-guard')

    const p = await page.$text('p')
    expect(p).toBe('Vssr.js')
  })

  // Close server and ask vssr to stop listening to file changes
  afterAll(async () => {
    await vssr.close()
  })

  // Stop browser
  afterAll(async () => {
    await page.close()
    await browser.close()
  })
})
