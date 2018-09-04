import { loadFixture, getPort, Vssr } from '../utils'

let vssr = null

describe('basic https', () => {
  beforeAll(async () => {
    const options = await loadFixture('https')
    vssr = new Vssr(options)
    const port = await getPort()
    await vssr.listen(port, '0.0.0.0')
  })

  test('/', async () => {
    const { html } = await vssr.renderRoute('/')
    expect(html.includes('<h1>Served over HTTPS!</h1>')).toBe(true)
  })

  // Close server and ask vssr to stop listening to file changes
  afterAll(async () => {
    await vssr.close()
  })
})
