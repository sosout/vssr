import express from 'express'
import { loadFixture, getPort, Vssr, rp } from '../utils'

let port
const url = route => 'http://localhost:' + port + route

let vssr
let app
let server

describe('express', () => {
  // Init vssr.js and create express server
  beforeAll(async () => {
    const config = await loadFixture('basic')
    vssr = new Vssr(config)

    port = await getPort()

    // Create express app
    app = express()

    // Register vssr
    app.use(vssr.render)

    // Start listening on localhost:4000
    server = app.listen(port)
  })

  test('/stateless with express', async () => {
    const html = await rp(url('/stateless'))

    expect(html.includes('<h1>My component!</h1>')).toBe(true)
  })

  afterAll(async () => {
    await vssr.close()
    await new Promise((resolve, reject) => {
      server.close(err => err ? reject(err) : resolve())
    })
  })
})
