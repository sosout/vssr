import { resolve } from 'path'
import { loadFixture, getPort, Vssr, Builder } from '../utils'

describe('vssr', () => {
  test('Vssr.js Class', () => {
    expect(typeof Vssr).toBe('function')
  })

  test('Vssr.js Instance', async () => {
    const config = await loadFixture('empty')
    const vssr = new Vssr(config)

    expect(typeof vssr).toBe('object')
    expect(vssr.options.dev).toBe(false)
    expect(typeof vssr._ready.then).toBe('function')

    await vssr.ready()

    expect(vssr.initialized).toBe(true)
  })

  test('Fail to build when no pages/ directory but is in the parent', () => {
    const vssr = new Vssr({
      dev: false,
      rootDir: resolve(__dirname, '..', 'fixtures', 'empty', 'pages')
    })

    return new Builder(vssr).build().catch((err) => {
      const s = String(err)
      expect(s.includes('No `pages` directory found')).toBe(true)
      expect(s.includes('Did you mean to run `vssr` in the parent (`../`) directory?')).toBe(true)
    })
  })

  test('Build with default page when no pages/ directory', async () => {
    const vssr = new Vssr()
    new Builder(vssr).build()
    const port = await getPort()
    await vssr.listen(port, 'localhost')

    const { html } = await vssr.renderRoute('/')
    expect(html.includes('Universal Vue.js Applications')).toBe(true)

    await vssr.close()
  })

  test('Fail to build when specified plugin isn\'t found', () => {
    const vssr = new Vssr({
      dev: false,
      rootDir: resolve(__dirname, '..', 'fixtures', 'missing-plugin')
    })

    return new Builder(vssr).build().catch((err) => {
      const s = String(err)
      expect(s.includes('Plugin not found')).toBe(true)
    })
  })
})
