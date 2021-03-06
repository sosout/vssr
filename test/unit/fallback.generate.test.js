import http from 'http'
import { existsSync } from 'fs'
import { resolve } from 'path'
import serveStatic from 'serve-static'
import finalhandler from 'finalhandler'
import { loadFixture, getPort, Vssr, Generator, Options, rp } from '../utils'

let port
const url = route => 'http://localhost:' + port + route
const distDir = resolve(__dirname, '..', 'fixtures/basic/.vssr-generate-fallback')

let vssr = null
let server = null
let generator = null

describe('fallback generate', () => {
  beforeAll(async () => {
    const config = await loadFixture('basic', { generate: { dir: '.vssr-generate-fallback' } })

    vssr = new Vssr(config)
    generator = new Generator(vssr)

    await generator.generate({ build: false })

    const serve = serveStatic(distDir)
    server = http.createServer((req, res) => {
      serve(req, res, finalhandler(req, res))
    })

    port = await getPort()

    server.listen(port)
  })

  test('default creates /200.html as fallback', async () => {
    const html = await rp(url('/200.html'))
    expect(html.includes('<h1>Index page</h1>')).toBe(false)
    expect(html.includes('data-server-rendered')).toBe(false)
    expect(existsSync(resolve(distDir, '200.html'))).toBe(true)
    expect(existsSync(resolve(distDir, '404.html'))).toBe(false)
  })

  test('vssr re-generating with generate.fallback = false', async () => {
    vssr.options.generate.fallback = false
    await expect(generator.generate({ build: false })).resolves.toBeTruthy()
  })

  test('false creates no fallback', async () => {
    await expect(rp(url('/200.html'))).rejects.toMatchObject({
      statusCode: 404,
      response: {
        body: expect.stringContaining('Cannot GET /200.html')
      }
    })

    expect(existsSync(resolve(distDir, '200.html'))).toBe(false)
    expect(existsSync(resolve(distDir, '404.html'))).toBe(false)
  })

  test('vssr re-generating with generate.fallback = \'\'', async () => {
    vssr.options.generate.fallback = ''
    await expect(generator.generate({ build: false })).resolves.toBeTruthy()
  })

  test('empty string creates no fallback', async () => {
    await expect(rp(url('/200.html'))).rejects.toMatchObject({
      statusCode: 404,
      response: {
        body: expect.stringContaining('Cannot GET /200.html')
      }
    })

    expect(existsSync(resolve(distDir, '200.html'))).toBe(false)
    expect(existsSync(resolve(distDir, '404.html'))).toBe(false)
  })

  test('generate.fallback = true is transformed to /404.html', () => {
    vssr.options.generate.fallback = true
    const options = Options.from(vssr.options)
    expect(options.generate.fallback).toBe('404.html')
  })

  test(
    'vssr re-generating with generate.fallback = "spa-fallback.html"',
    async () => {
      vssr.options.generate.fallback = 'spa-fallback.html'
      await expect(generator.generate({ build: false })).resolves.toBeTruthy()
    }
  )

  test('spa-fallback.html was created', async () => {
    const html = await rp(url('/spa-fallback.html'))
    expect(html.includes('<h1>Index page</h1>')).toBe(false)
    expect(html.includes('data-server-rendered')).toBe(false)
    expect(existsSync(resolve(distDir, 'spa-fallback.html'))).toBe(true)
    expect(existsSync(resolve(distDir, '200.html'))).toBe(false)
    expect(existsSync(resolve(distDir, '404.html'))).toBe(false)
  })

  // Close server and ask vssr to stop listening to file changes
  afterAll(async () => {
    await server.close()
  })
})
