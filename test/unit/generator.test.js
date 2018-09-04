import { Vssr, Generator } from '../utils'

describe('generator', () => {
  test('initRoutes with routes (fn => array)', async () => {
    const array = ['/1', '/2', '/3', '/4']
    const config = {
      generate: {
        routes: array
      }
    }
    const vssr = new Vssr(config)
    const generator = new Generator(vssr)
    const routes = await generator.initRoutes()

    expect(routes.length).toBe(array.length)
    routes.map((route, index) => {
      expect(route.route).toBe(array[index])
    })
  })

  test('initRoutes with routes (fn())', async () => {
    const array = ['/1', '/2', '/3', '/4']
    const config = {
      generate: {
        routes() {
          return array
        }
      }
    }
    const vssr = new Vssr(config)
    const generator = new Generator(vssr)
    const routes = await generator.initRoutes()

    expect(routes.length).toBe(array.length)
    routes.map((route, index) => {
      expect(route.route).toBe(array[index])
    })
  })

  test('initRoutes with routes (fn(args))', async () => {
    const config = {
      generate: {
        routes(array) {
          return array
        }
      }
    }
    const vssr = new Vssr(config)
    const generator = new Generator(vssr)
    const array = ['/1', '/2', '/3', '/4']
    const routes = await generator.initRoutes(array)

    expect(routes.length).toBe(array.length)
    routes.map((route, index) => {
      expect(route.route).toBe(array[index])
    })
  })

  test('initRoutes with routes (fn(cb, args))', async () => {
    const config = {
      generate: {
        routes(cb, arg1, arg2, arg3, arg4) {
          cb(null, [arg1, arg2, arg3, arg4])
        }
      }
    }
    const vssr = new Vssr(config)
    const generator = new Generator(vssr)
    const array = ['/1', '/2', '/3', '/4']
    const routes = await generator.initRoutes(...array)

    expect(routes.length).toBe(array.length)
    routes.map((route, index) => {
      expect(route.route).toBe(array[index])
    })
  })
})
