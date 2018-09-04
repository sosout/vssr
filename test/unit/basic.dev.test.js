import consola from 'consola'
import { Builder, getPort, loadFixture, Vssr, rp } from '../utils'

let port
const url = route => 'http://localhost:' + port + route

let vssr = null
let builder = null
let transpile = null
let output = null

describe('basic dev', () => {
  beforeAll(async () => {
    const config = await loadFixture('basic', {
      dev: true,
      debug: true,
      buildDir: '.vssr-dev',
      build: {
        filenames: {
          app: ({ isDev }) => {
            return isDev ? 'test-app.js' : 'test-app.[contenthash].js'
          },
          chunk: 'test-[name].[contenthash].js'
        },
        transpile: [
          'vue\\.test\\.js',
          /vue-test/
        ],
        extend({ module: { rules }, output: wpOutput }, { isClient }) {
          if (isClient) {
            const babelLoader = rules.find(loader => loader.test.test('.jsx'))
            transpile = file => !babelLoader.exclude(file)
            output = wpOutput
          }
        }
      }
    })
    vssr = new Vssr(config)
    builder = new Builder(vssr)
    await builder.build()
    port = await getPort()
    await vssr.listen(port, 'localhost')
  })

  test('Check build:done hook called', () => {
    expect(builder.__hook_built_called__).toBe(true)
  })

  test('Config: build.transpile', () => {
    expect(transpile('vue-test')).toBe(true)
    expect(transpile('node_modules/test.js')).toBe(false)
    expect(transpile('node_modules/vue-test')).toBe(true)
    expect(transpile('node_modules/vue.test.js')).toBe(true)
    expect(transpile('node_modules/test.vue.js')).toBe(true)
  })

  test('Config: build.filenames', () => {
    expect(output.filename).toBe('test-app.js')
    expect(output.chunkFilename).toBe('test-[name].[contenthash].js')
    expect(consola.warn).toBeCalledWith(
      'Notice: Please do not use contenthash in dev mode to prevent memory leak'
    )
  })

  test('/stateless', async () => {
    const window = await vssr.renderAndGetWindow(url('/stateless'))
    const html = window.document.body.innerHTML
    expect(html.includes('<h1>My component!</h1>')).toBe(true)
  })

  test('Check render:routeDone hook called', () => {
    expect(vssr.__hook_render_routeDone__).toBe('/stateless')
  })

  // test('/_vssr/test.hot-update.json should returns empty html', async t => {
  //   try {
  //     await rp(url('/_vssr/test.hot-update.json'))
  //   } catch (err) {
  //     t.is(err.statusCode, 404)
  //     t.is(err.response.body, '')
  //   }
  // })

  test('/__open-in-editor (open-in-editor)', async () => {
    const { body } = await rp(
      url('/__open-in-editor?file=pages/index.vue'),
      { resolveWithFullResponse: true }
    )
    expect(body).toBe('')
  })

  test('/__open-in-editor should return error (open-in-editor)', async () => {
    await expect(rp(url('/__open-in-editor?file='))).rejects.toMatchObject({
      statusCode: 500,
      error: 'launch-editor-middleware: required query param "file" is missing.'
    })
  })

  test('/error should return error stack trace (Youch)', async () => {
    await expect(vssr.renderAndGetWindow(url('/error'))).rejects.toMatchObject({
      statusCode: 500
    })
  })

  test('/error no source-map (Youch)', async () => {
    const sourceMaps = vssr.renderer.resources.serverBundle.maps
    vssr.renderer.resources.serverBundle.maps = {}

    await expect(vssr.renderAndGetWindow(url('/error'))).rejects.toMatchObject({
      statusCode: 500
    })

    vssr.renderer.resources.serverBundle.maps = sourceMaps
  })

  test('/error should return json format error (Youch)', async () => {
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

  // Close server and ask vssr to stop listening to file changes
  afterAll(async () => {
    await vssr.close()
  })
})
