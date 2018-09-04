import { normalize } from 'path'
import consola from 'consola'
import { loadFixture, getPort, Vssr, rp } from '../utils'

let port
const url = route => 'http://localhost:' + port + route

let vssr = null
// let buildSpies = null

describe('module', () => {
  beforeAll(async () => {
    const config = await loadFixture('module')
    vssr = new Vssr(config)
    port = await getPort()
    await vssr.listen(port, 'localhost')
  })

  test('Plugin', async () => {
    expect(normalize(vssr.options.plugins[0].src).includes(
      normalize('fixtures/module/.vssr/basic.reverse.')
    )).toBe(true)
    const { html } = await vssr.renderRoute('/')
    expect(html.includes('<h1>TXUN</h1>')).toBe(true)
  })

  test('Layout', async () => {
    expect(vssr.options.layouts.layout.includes('layout')).toBe(true)

    const { html } = await vssr.renderRoute('/layout')
    expect(html.includes('<h1>Module Layouts</h1>')).toBe(true)
  })

  test('/404 should display the module error layout', async () => {
    const { html } = await vssr.renderRoute('/404')
    expect(html).toContain('You should see the error in a different Vue!')
  })

  test('Hooks', () => {
    expect(vssr.__module_hook).toBe(1)
    expect(vssr.__renderer_hook).toBe(2)
  })

  test('Hooks - Functional', () => {
    expect(vssr.__ready_called__).toBe(true)
  })

  // test('Hooks - Error', async () => {
  //   expect(buildSpies.error.calledWithMatch(/build:extendRoutes/)).toBe(true)
  // })

  test('Middleware', async () => {
    const response = await rp(url('/api'))
    expect(response).toBe('It works!')
  })

  test('Hooks - Use external middleware before render', async () => {
    const response = await rp(url('/use-middleware'))
    expect(response).toBe('Use external middleware')
  })

  test('Hooks - render context', async () => {
    await vssr.renderRoute('/render-context')
    expect(vssr.__render_context).toBeTruthy()
  })

  test('AddVendor - deprecated', () => {
    vssr.moduleContainer.addVendor('vssr-test')
    expect(consola.warn).toHaveBeenCalledWith('addVendor has been deprecated due to webpack4 optimization')
  })

  // Close server and ask vssr to stop listening to file changes
  afterAll(async () => {
    await vssr.close()
  })
})
