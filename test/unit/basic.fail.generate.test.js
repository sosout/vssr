import { loadFixture, Vssr, Generator } from '../utils'

describe('basic fail generate', () => {
  test('Fail with routes() which throw an error', async () => {
    const options = await loadFixture('basic', {
      generate: {
        routes() {
          throw new Error('Not today!')
        }
      }
    })

    const vssr = new Vssr(options)
    const generator = new Generator(vssr)

    await generator.generate({ build: false }).catch((e) => {
      expect(e.message).toBe('Not today!')
    })
  })
})
