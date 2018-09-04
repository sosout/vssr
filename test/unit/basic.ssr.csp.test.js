import { getPort, loadFixture, Vssr, rp } from '../utils'

let port
const url = route => 'http://localhost:' + port + route

const startCspServer = async (csp, isProduction = true) => {
  const options = await loadFixture('basic', {
    debug: !isProduction,
    render: { csp }
  })
  const vssr = new Vssr(options)
  port = await getPort()
  await vssr.listen(port, '0.0.0.0')
  return vssr
}

const getHeader = debug => debug ? 'content-security-policy-report-only' : 'content-security-policy'
const cspHeader = getHeader(false)
const reportOnlyHeader = getHeader(true)

const startCspDevServer = csp => startCspServer(csp, false)

describe('basic ssr csp', () => {
  let vssr

  afterEach(async () => {
    await vssr.close()
  })

  describe('production mode', () => {
    test(
      'Not contain Content-Security-Policy header, when csp is false',
      async () => {
        vssr = await startCspServer(false)
        const { headers } = await rp(url('/stateless'), {
          resolveWithFullResponse: true
        })

        expect(headers[cspHeader]).toBe(undefined)
      }
    )

    test(
      'Contain Content-Security-Policy header, when csp is set',
      async () => {
        vssr = await startCspServer(true)
        const { headers } = await rp(url('/stateless'), {
          resolveWithFullResponse: true
        })

        expect(headers[cspHeader]).toMatch(/^script-src 'self' 'sha256-.*'$/)
      }
    )

    test(
      'Contain Content-Security-Policy-Report-Only header, when explicitly asked for',
      async () => {
        vssr = await startCspDevServer({ reportOnly: true })
        const { headers } = await rp(url('/stateless'), {
          resolveWithFullResponse: true
        })

        expect(headers[reportOnlyHeader]).toMatch(/^script-src 'self' 'sha256-.*'$/)
      }
    )

    test(
      'Contain only unique hashes in header when csp is set',
      async () => {
        vssr = await startCspServer(true)
        const { headers } = await rp(url('/stateless'), {
          resolveWithFullResponse: true
        })

        const hashes = headers[cspHeader].split(' ').filter(s => s.startsWith('\'sha256-'))
        const uniqueHashes = [...new Set(hashes)]

        expect(uniqueHashes.length).toBe(hashes.length)
      }
    )

    test(
      'Contain Content-Security-Policy header, when csp.allowedSources set',
      async () => {
        const cspOption = {
          allowedSources: ['https://example.com', 'https://example.io']
        }

        vssr = await startCspServer(cspOption)
        const { headers } = await rp(url('/stateless'), {
          resolveWithFullResponse: true
        })

        expect(headers[cspHeader]).toMatch(/^script-src 'self' 'sha256-.*'/)
        expect(headers[cspHeader].includes('https://example.com')).toBe(true)
        expect(headers[cspHeader].includes('https://example.io')).toBe(true)
      }
    )

    test(
      'Contain Content-Security-Policy header, when csp.policies set',
      async () => {
        const cspOption = {
          enabled: true,
          policies: {
            'default-src': [`'none'`],
            'script-src': ['https://example.com', 'https://example.io']
          }
        }

        vssr = await startCspServer(cspOption)
        const { headers } = await rp(url('/stateless'), {
          resolveWithFullResponse: true
        })

        expect(headers[cspHeader]).toMatch(/default-src 'none'/)
        expect(headers[cspHeader]).toMatch(/script-src 'sha256-(.*)?' 'self'/)
        expect(headers[cspHeader].includes('https://example.com')).toBe(true)
        expect(headers[cspHeader].includes('https://example.io')).toBe(true)
      }
    )

    test(
      'Contain Content-Security-Policy header, when csp.policies.script-src is not set',
      async () => {
        const cspOption = {
          enabled: true,
          policies: {
            'default-src': [`'none'`]
          }
        }

        vssr = await startCspServer(cspOption)
        const { headers } = await rp(url('/stateless'), {
          resolveWithFullResponse: true
        })

        expect(headers[cspHeader]).toMatch(/default-src 'none'/)
        expect(headers[cspHeader]).toMatch(/script-src 'sha256-.*' 'self'$/)
      }
    )

    test(
      'Contain only unique hashes in header when csp.policies is set',
      async () => {
        const policies = {
          'default-src': [`'self'`],
          'script-src': [`'self'`],
          'style-src': [`'self'`]
        }

        vssr = await startCspServer({
          policies
        })

        for (let i = 0; i < 5; i++) {
          await rp(url('/stateless'), {
            resolveWithFullResponse: true
          })
        }

        const { headers } = await rp(url('/stateful'), {
          resolveWithFullResponse: true
        })

        const hashes = headers[cspHeader].split(' ').filter(s => s.startsWith('\'sha256-'))
        const uniqueHashes = [...new Set(hashes)]

        expect(uniqueHashes.length).toBe(hashes.length)
      }
    )
  })
  describe('debug mode', () => {
    test(
      'Not contain Content-Security-Policy-Report-Only header, when csp is false',
      async () => {
        vssr = await startCspDevServer(false)
        const { headers } = await rp(url('/stateless'), {
          resolveWithFullResponse: true
        })

        expect(headers[reportOnlyHeader]).toBe(undefined)
      }
    )

    test(
      'Contain Content-Security-Policy header, when explicitly asked for',
      async () => {
        vssr = await startCspDevServer({ reportOnly: false })
        const { headers } = await rp(url('/stateless'), {
          resolveWithFullResponse: true
        })

        expect(headers[cspHeader]).toMatch(/^script-src 'self' 'sha256-.*'$/)
      }
    )

    test(
      'Contain Content-Security-Policy header, when csp is set',
      async () => {
        vssr = await startCspDevServer(true)
        const { headers } = await rp(url('/stateless'), {
          resolveWithFullResponse: true
        })

        expect(headers[reportOnlyHeader]).toMatch(/^script-src 'self' 'sha256-.*'$/)
      }
    )

    test(
      'Contain only unique hashes in header when csp is set',
      async () => {
        vssr = await startCspDevServer(true)
        const { headers } = await rp(url('/stateless'), {
          resolveWithFullResponse: true
        })

        const hashes = headers[reportOnlyHeader].split(' ').filter(s => s.startsWith('\'sha256-'))
        const uniqueHashes = [...new Set(hashes)]

        expect(uniqueHashes.length).toBe(hashes.length)
      }
    )

    test(
      'Contain Content-Security-Policy-Report-Only header, when csp.allowedSources set',
      async () => {
        const cspOption = {
          allowedSources: ['https://example.com', 'https://example.io']
        }

        vssr = await startCspDevServer(cspOption)
        const { headers } = await rp(url('/stateless'), {
          resolveWithFullResponse: true
        })

        expect(headers[reportOnlyHeader]).toMatch(/^script-src 'self' 'sha256-.*'/)
        expect(headers[reportOnlyHeader].includes('https://example.com')).toBe(true)
        expect(headers[reportOnlyHeader].includes('https://example.io')).toBe(true)
      }
    )

    test(
      'Contain Content-Security-Policy-Report-Only header, when csp.policies set',
      async () => {
        const cspOption = {
          enabled: true,
          policies: {
            'default-src': [`'none'`],
            'script-src': ['https://example.com', 'https://example.io']
          }
        }

        vssr = await startCspDevServer(cspOption)
        const { headers } = await rp(url('/stateless'), {
          resolveWithFullResponse: true
        })

        expect(headers[reportOnlyHeader]).toMatch(/default-src 'none'/)
        expect(headers[reportOnlyHeader]).toMatch(/script-src 'sha256-(.*)?' 'self'/)
        expect(headers[reportOnlyHeader].includes('https://example.com')).toBe(true)
        expect(headers[reportOnlyHeader].includes('https://example.io')).toBe(true)
      }
    )

    test(
      'Contain Content-Security-Policy-Report-Only header, when csp.policies.script-src is not set',
      async () => {
        const cspOption = {
          enabled: true,
          policies: {
            'default-src': [`'none'`]
          }
        }

        vssr = await startCspDevServer(cspOption)
        const { headers } = await rp(url('/stateless'), {
          resolveWithFullResponse: true
        })

        expect(headers[reportOnlyHeader]).toMatch(/default-src 'none'/)
        expect(headers[reportOnlyHeader]).toMatch(/script-src 'sha256-.*' 'self'$/)
      }
    )

    test(
      'Contain only unique hashes in header when csp.policies is set',
      async () => {
        const policies = {
          'default-src': [`'self'`],
          'script-src': [`'self'`],
          'style-src': [`'self'`]
        }

        vssr = await startCspDevServer({
          policies
        })

        for (let i = 0; i < 5; i++) {
          await rp(url('/stateless'), {
            resolveWithFullResponse: true
          })
        }

        const { headers } = await rp(url('/stateful'), {
          resolveWithFullResponse: true
        })

        const hashes = headers[reportOnlyHeader].split(' ').filter(s => s.startsWith('\'sha256-'))
        const uniqueHashes = [...new Set(hashes)]

        expect(uniqueHashes.length).toBe(hashes.length)
      }
    )
  })
})
