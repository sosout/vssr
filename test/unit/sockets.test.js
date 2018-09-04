import { loadFixture, Vssr } from '../utils'

let vssr = null

describe.skip.appveyor('basic sockets', () => {
  beforeAll(async () => {
    const options = await loadFixture('sockets')
    vssr = new Vssr(options)
    await vssr.listen()
  })

  test('/', async () => {
    const { html } = await vssr.renderRoute('/')
    expect(html.includes('<h1>Served over sockets!</h1>')).toBe(true)
  })

  // Close server and ask vssr to stop listening to file changes
  afterAll(async () => {
    await vssr.close()
  })
})
