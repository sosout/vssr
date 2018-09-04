import { resolve } from 'path'
import consola from 'consola'

import { Vssr, Options, version } from '../utils'

describe('basic config defaults', () => {
  test('Vssr.version is same as package', () => {
    expect(Vssr.version).toBe(version)
  })

  test('modulesDir uses /node_modules as default if not set', () => {
    const options = Options.from({})
    const currentNodeModulesDir = resolve(__dirname, '..', '..', 'node_modules')
    expect(options.modulesDir.includes(currentNodeModulesDir)).toBe(true)
  })

  test('vendor has been deprecated', () => {
    const options = Options.from({
      build: { vendor: 'vue' }
    })
    expect(options.build.vendor).toBeUndefined()
    expect(consola.warn).toHaveBeenCalledWith('vendor has been deprecated due to webpack4 optimization')
  })
})
