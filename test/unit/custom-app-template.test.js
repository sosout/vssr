import { getPort, loadFixture, Vssr } from '../utils'

let port
let vssr = null

describe('custom-app-template', () => {
  beforeAll(async () => {
    const options = await loadFixture('custom-app-template')
    vssr = new Vssr(options)
    port = await getPort()
    await vssr.listen(port, '0.0.0.0')
  })
  test('/', async () => {
    const { html } = await vssr.renderRoute('/')
    expect(html.includes('<p>My Template</p>')).toBe(true)
    expect(html.includes('<h1>Custom!</h1>')).toBe(true)
  })

  // Close server and ask vssr to stop listening to file changes
  afterAll(async () => {
    await vssr.close()
  })
})
