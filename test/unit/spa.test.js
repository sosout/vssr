import consola from 'consola'
import { loadFixture, getPort, Vssr } from '../utils'

let vssr, port
const url = route => 'http://localhost:' + port + route

const renderRoute = async (_url) => {
  const window = await vssr.renderAndGetWindow(url(_url))
  const head = window.document.head.innerHTML
  const html = window.document.body.innerHTML
  return { window, head, html }
}

describe('spa', () => {
  beforeAll(async () => {
    const config = await loadFixture('spa')
    vssr = new Vssr(config)
    port = await getPort()
    await vssr.listen(port, 'localhost')
  })

  test('/ (basic spa)', async () => {
    const { html } = await renderRoute('/')
    expect(html).toMatch('Hello SPA!')
    expect(consola.log).not.toHaveBeenCalledWith('created')
    expect(consola.log).toHaveBeenCalledWith('mounted')
    consola.log.mockClear()
  })

  test('/custom (custom layout)', async () => {
    const { html } = await renderRoute('/custom')
    expect(html).toMatch('Custom layout')
    expect(consola.log).toHaveBeenCalledWith('created')
    expect(consola.log).toHaveBeenCalledWith('mounted')
    consola.log.mockClear()
  })

  test('/mounted', async () => {
    const { html } = await renderRoute('/mounted')
    expect(html).toMatch('<h1>Test: updated</h1>')
  })

  test('/error-handler', async () => {
    await renderRoute('/error-handler')
    const { html } = await renderRoute('/error-handler')
    expect(html).toMatch('error handler triggered: fetch error!')
  })

  test('/error-handler-async', async () => {
    await renderRoute('/error-handler-async')
    const { html } = await renderRoute('/error-handler-async')
    expect(html).toMatch('error handler triggered: asyncData error!')
  })

  test('/_vssr/ (access publicPath in spa mode)', async () => {
    await expect(renderRoute('/_vssr/')).rejects.toMatchObject({
      response: {
        statusCode: 404,
        statusMessage: 'ResourceNotFound'
      }
    })
  })

  // Close server and ask vssr to stop listening to file changes
  afterAll(async () => {
    await vssr.close()
  })
})
