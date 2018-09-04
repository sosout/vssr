import path from 'path'

let _vssr

export default {
  render: {
    dist: {
      maxAge: ((60 * 60 * 24 * 365) * 2)
    }
  },
  router: {
    extendRoutes(routes, resolve) {
      return [{
        path: '/before-enter',
        name: 'before-enter',
        beforeEnter: (to, from, next) => { next('/') }
      }, ...routes]
    }
  },
  generate: {
    routes: [
      // TODO: generate with {build: false} does not scans pages!
      '/noloading',
      '/stateless',
      '/css',
      '/stateful',
      '/head',
      '/async-data',
      '/validate',
      '/redirect',

      '/users/1',
      '/users/2',
      { route: '/users/3', payload: { id: 3000 } }
    ],
    interval: 200,
    subFolders: true
  },
  head: {
    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} - Vssr.js` : 'Vssr.js'
    }
  },
  modulesDir: path.join(__dirname, '..', '..', '..', 'node_modules'),
  hooks: {
    ready(vssr) {
      _vssr = vssr
      vssr.__hook_ready_called__ = true
    },
    build: {
      done(builder) {
        builder.__hook_built_called__ = true
      }
    },
    render: {
      routeDone(url) {
        _vssr.__hook_render_routeDone__ = url
      }
    },
    bad: null,
    '': true
  },
  transition: false,
  build: {
    scopeHoisting: true,
    postcss: [
      require('postcss-preset-env')({
        features: {
          'custom-selectors': true
        }
      }),
      require('cssnano')
    ]
  }
}
