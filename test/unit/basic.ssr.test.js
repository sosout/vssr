import consola from 'consola'
import { loadFixture, getPort, Vssr, rp } from '../utils'

let port
const url = route => 'http://localhost:' + port + route

let vssr = null

describe('basic ssr', () => {
  beforeAll(async () => {
    const options = await loadFixture('basic')
    vssr = new Vssr(options)
    port = await getPort()
    await vssr.listen(port, '0.0.0.0')
  })

  test('/stateless', async () => {
    const { html } = await vssr.renderRoute('/stateless')
    expect(html.includes('<h1>My component!</h1>')).toBe(true)
  })

  /*
  ** Example of testing via dom checking
  */
  test('/css', async () => {
    const window = await vssr.renderAndGetWindow(url('/css'))

    const headHtml = window.document.head.innerHTML
    expect(headHtml.includes('color:red')).toBe(true)

    const element = window.document.querySelector('.red')
    expect(element).not.toBe(null)
    expect(element.textContent).toBe('This is red')
    expect(element.className).toBe('red')
    // t.is(window.getComputedStyle(element).color, 'red')
  })

  test('/postcss', async () => {
    const window = await vssr.renderAndGetWindow(url('/css'))

    const headHtml = window.document.head.innerHTML
    expect(headHtml.includes('background-color:#00f')).toBe(true)

    // const element = window.document.querySelector('div.red')
    // t.is(window.getComputedStyle(element)['background-color'], 'blue')
  })

  test('/stateful', async () => {
    const { html } = await vssr.renderRoute('/stateful')
    expect(html.includes('<div><p>The answer is 42</p></div>')).toBe(true)
  })

  test('/store', async () => {
    const { html } = await vssr.renderRoute('/store')
    expect(html.includes('<h1>Vuex Nested Modules</h1>')).toBe(true)
    expect(html.includes('<p>1</p>')).toBe(true)
  })

  test('/head', async () => {
    const window = await vssr.renderAndGetWindow(url('/head'))
    expect(window.document.title).toBe('My title - Vssr.js')

    const html = window.document.body.innerHTML
    expect(html.includes('<div><h1>I can haz meta tags</h1></div>')).toBe(true)
    expect(
      html.includes('<script data-n-head="true" src="/body.js" data-body="true">')
    ).toBe(true)

    const metas = window.document.getElementsByTagName('meta')
    expect(metas[0].getAttribute('content')).toBe('my meta')
    expect(consola.log).toHaveBeenCalledWith('Body script!')
  })

  test('/async-data', async () => {
    const { html } = await vssr.renderRoute('/async-data')
    expect(html.includes('<p>Vssr.js</p>')).toBe(true)
  })

  test('/await-async-data', async () => {
    const { html } = await vssr.renderRoute('/await-async-data')
    expect(html.includes('<p>Await Vssr.js</p>')).toBe(true)
  })

  test('/callback-async-data', async () => {
    const { html } = await vssr.renderRoute('/callback-async-data')
    expect(html.includes('<p>Callback Vssr.js</p>')).toBe(true)
  })

  test('/users/1', async () => {
    const { html } = await vssr.renderRoute('/users/1')
    expect(html.includes('<h1>User: 1</h1>')).toBe(true)
  })

  test('/validate should display a 404', async () => {
    const { html } = await vssr.renderRoute('/validate')
    expect(html.includes('This page could not be found')).toBe(true)
  })

  test('/validate-async should display a 404', async () => {
    const { html } = await vssr.renderRoute('/validate-async')
    expect(html.includes('This page could not be found')).toBe(true)
  })

  test('/validate?valid=true', async () => {
    const { html } = await vssr.renderRoute('/validate?valid=true')
    expect(html.includes('<h1>I am valid</h1>')).toBe(true)
  })

  test('/validate-async?valid=true', async () => {
    const { html } = await vssr.renderRoute('/validate-async?valid=true')
    expect(html.includes('<h1>I am valid</h1>')).toBe(true)
  })

  test('/validate?error=403', async () => {
    const { html, error } = await vssr.renderRoute('/validate?error=403')
    expect(error).toMatchObject({ statusCode: 403, message: 'Custom Error' })
    expect(html.includes('Custom Error')).toBe(true)
  })

  test('/validate-async?error=503', async () => {
    const { html, error } = await vssr.renderRoute('/validate-async?error=503')
    expect(error).toMatchObject({ statusCode: 503, message: 'Custom Error' })
    expect(html.includes('Custom Error')).toBe(true)
  })

  test('/before-enter', async () => {
    const { html } = await vssr.renderRoute('/before-enter')
    expect(html.includes('<h1>Index page</h1>')).toBe(true)
  })

  test('/redirect', async () => {
    const { html, redirected } = await vssr.renderRoute('/redirect')
    expect(html.includes('<div id="__vssr"></div>')).toBe(true)
    expect(redirected.path === '/').toBe(true)
    expect(redirected.status === 302).toBe(true)
  })

  test('/redirect -> check redirected source', async () => {
    // there are no transition properties in jsdom, ignore the error log
    const window = await vssr.renderAndGetWindow(url('/redirect'))
    const html = window.document.body.innerHTML
    expect(html.includes('<h1>Index page</h1>')).toBe(true)
  })

  test('/redirect -> external link', async () => {
    let _headers, _status
    const { html } = await vssr.renderRoute('/redirect-external', {
      res: {
        writeHead(status, headers) {
          _status = status
          _headers = headers
        },
        end() { }
      }
    })
    expect(_status).toBe(302)
    expect(_headers.Location).toBe('https://nuxtjs.org')
    expect(html.includes('<div data-server-rendered="true"></div>')).toBe(true)
  })

  test('/special-state -> check window.__VSSR__.test = true', async () => {
    const window = await vssr.renderAndGetWindow(url('/special-state'))
    expect(window.document.title).toBe('Vssr.js')
    expect(window.__VSSR__.test).toBe(true)
  })

  test('/error', async () => {
    await expect(vssr.renderRoute('/error', { req: {}, res: {} }))
      .rejects.toThrow('Error mouahahah')
  })

  test('/error status code', async () => {
    await expect(rp(url('/error'))).rejects.toMatchObject({
      statusCode: 500
    })
  })

  test('/error json format error', async () => {
    const opts = {
      headers: {
        accept: 'application/json'
      },
      resolveWithFullResponse: true
    }
    await expect(rp(url('/error'), opts)).rejects.toMatchObject({
      statusCode: 500,
      response: {
        headers: {
          'content-type': 'text/json; charset=utf-8'
        }
      }
    })
  })

  test('/error2', async () => {
    const { html, error } = await vssr.renderRoute('/error2')
    expect(html.includes('Custom error')).toBe(true)
    expect(error.message.includes('Custom error')).toBe(true)
    expect(error.statusCode === undefined).toBe(true)
  })

  test('/error2 status code', async () => {
    await expect(rp(url('/error2'))).rejects.toMatchObject({
      statusCode: 500,
      message: expect.stringContaining('Custom error')
    })
  })

  test('/error-midd', async () => {
    await expect(rp(url('/error-midd'))).rejects.toMatchObject({ statusCode: 505 })
  })

  test('/redirect-middleware', async () => {
    await expect(rp(url('/redirect-middleware'))).resolves.toBeTruthy()
  })

  test('/redirect-name', async () => {
    const { html, redirected } = await vssr.renderRoute('/redirect-name')
    expect(html.includes('<div id="__vssr"></div>')).toBe(true)
    expect(redirected.path === '/stateless').toBe(true)
    expect(redirected.status === 302).toBe(true)
  })

  test('/no-ssr', async () => {
    const { html } = await vssr.renderRoute('/no-ssr')
    expect(html.includes(
      '<div class="no-ssr-placeholder">&lt;p&gt;Loading...&lt;/p&gt;</div>'
    )).toBe(true)
  })

  test('/no-ssr (client-side)', async () => {
    const window = await vssr.renderAndGetWindow(url('/no-ssr'))
    const html = window.document.body.innerHTML
    expect(html.includes('Displayed only on client-side</h1>')).toBe(true)
  })

  test('ETag Header', async () => {
    const { headers: { etag } } = await rp(url('/stateless'), {
      resolveWithFullResponse: true
    })
    // Verify functionality
    await expect(rp(url('/stateless'), { headers: { 'If-None-Match': etag } }))
      .rejects.toMatchObject({ statusCode: 304 })
  })

  test('/_vssr/server-bundle.json should return 404', async () => {
    await expect(rp(url('/_vssr/server-bundle.json')))
      .rejects.toMatchObject({ statusCode: 404 })
  })

  test('/_vssr/ should return 404', async () => {
    await expect(rp(url('/_vssr/')))
      .rejects.toMatchObject({ statusCode: 404 })
  })

  test('/meta', async () => {
    const { html } = await vssr.renderRoute('/meta')
    expect(html.includes('"meta":[{"works":true}]')).toBe(true)
  })

  test('/fn-midd', async () => {
    await expect(rp(url('/fn-midd')))
      .rejects.toMatchObject({ statusCode: 403 })
  })

  test('/fn-midd?please=true', async () => {
    const { html } = await vssr.renderRoute('/fn-midd?please=true')
    expect(html.includes('<h1>Date:')).toBe(true)
  })

  test('/router-guard', async () => {
    const { html } = await vssr.renderRoute('/router-guard')
    expect(html.includes('<p>Vssr.js</p>')).toBe(true)
    expect(html.includes('Router Guard')).toBe(false)
  })

  test('/jsx', async () => {
    const { html } = await vssr.renderRoute('/jsx')
    expect(html.includes('<h1>JSX Page</h1>')).toBe(true)
  })

  test('/jsx-link', async () => {
    const { html } = await vssr.renderRoute('/jsx-link')
    expect(html.includes('<h1>JSX Link Page</h1>')).toBe(true)
  })

  test('/js-link', async () => {
    const { html } = await vssr.renderRoute('/js-link')
    expect(html.includes('<h1>vue file is first-class</h1>')).toBe(true)
  })

  // Close server and ask vssr to stop listening to file changes
  afterAll(async () => {
    await vssr.close()
  })
})
