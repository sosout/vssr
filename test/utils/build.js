import { loadFixture, Vssr, Builder } from './index'

export const buildFixture = function (fixture, callback) {
  test(`Build ${fixture}`, async () => {
    const config = await loadFixture(fixture)
    const vssr = new Vssr(config)
    const buildDone = jest.fn()
    vssr.hook('build:done', buildDone)
    const builder = await new Builder(vssr).build()
    // 2: BUILD_DONE
    expect(builder._buildStatus).toBe(2)
    expect(buildDone).toHaveBeenCalledTimes(1)
    if (typeof callback === 'function') {
      callback(builder)
    }
  }, 120000)
}
