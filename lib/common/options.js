import path from 'path'
import fs from 'fs'

import _ from 'lodash'
import consola from 'consola'

import { isPureObject, isUrl } from '../common/utils'

import modes from './modes'
import defaults from './vssr.config'

const Options = {}

export default Options

/**
 *
 * @param {Object} _options
 *
 */
Options.from = function (_options) {

  // 克隆选项以防止不必要的副作用
  const options = Object.assign({}, _options)

  // 页面切换的时候加载进度条
  if (options.loading === true) {
    delete options.loading
  }

  // 为应用的每个页面设置默认的中间件。
  if (
    options.router &&
    options.router.middleware &&
    !Array.isArray(options.router.middleware)
  ) {
    options.router.middleware = [options.router.middleware]
  }

  // 应用的根URL
  if (options.router && typeof options.router.base === 'string') {
    options._routerBaseSpecified = true
  }

  // 使用 Vue.js 的<transition>组件来实现路由切换时的过渡动效。
  if (typeof options.transition === 'string') {
    options.transition = { name: options.transition }
  }

  // layoutTransition
  if (typeof options.layoutTransition === 'string') {
    options.layoutTransition = { name: options.layoutTransition }
  }

  // extensions
  if (typeof options.extensions === 'string') {
    options.extensions = [options.extensions]
  }

  const hasValue = v => typeof v === 'string' && v

  // 该配置项用于配置 Vssr 应用的根目录。
  options.rootDir = hasValue(options.rootDir) ? options.rootDir : process.cwd()

  // Apply defaults
  _.defaultsDeep(options, defaults)

  // Resolve dirs
  options.srcDir = hasValue(options.srcDir)
    ? path.resolve(options.rootDir, options.srcDir)
    : options.rootDir
  options.buildDir = path.resolve(options.rootDir, options.buildDir)

  // Populate modulesDir
  options.modulesDir = []
    .concat(options.modulesDir)
    .concat(path.join(options.vssrDir, 'node_modules'))
    .filter(hasValue)
    .map(dir => path.resolve(options.rootDir, dir))

  // Sanitize extensions
  if (options.extensions.indexOf('js') === -1) {
    options.extensions.unshift('js')
  }

  if (options.extensions.indexOf('mjs') === -1) {
    options.extensions.unshift('mjs')
  }

  // If app.html is defined, set the template path to the user template
  if (options.appTemplatePath === undefined) {
    options.appTemplatePath = path.resolve(options.buildDir, 'views/app.template.html')
    if (fs.existsSync(path.join(options.srcDir, 'app.html'))) {
      options.appTemplatePath = path.join(options.srcDir, 'app.html')
    }
  } else {
    options.appTemplatePath = path.resolve(options.srcDir, options.appTemplatePath)
  }

  // Ignore publicPath on dev
  /* istanbul ignore if */
  if (options.dev && isUrl(options.build.publicPath)) {
    options.build.publicPath = defaults.build.publicPath
  }

  // If store defined, update store options to true unless explicitly disabled
  if (
    options.store !== false &&
    fs.existsSync(path.join(options.srcDir, options.dir.store)) &&
    fs.readdirSync(path.join(options.srcDir, options.dir.store))
      .find(filename => filename !== 'README.md' && filename[0] !== '.')
  ) {
    options.store = true
  }

  // SPA loadingIndicator
  if (options.loadingIndicator) {
    // Normalize loadingIndicator
    if (!isPureObject(options.loadingIndicator)) {
      options.loadingIndicator = { name: options.loadingIndicator }
    }

    // Apply defaults
    options.loadingIndicator = Object.assign(
      {
        name: 'default',
        color: (options.loading && options.loading.color) || '#D3D3D3',
        color2: '#F5F5F5',
        background: (options.manifest && options.manifest.theme_color) || 'white',
        dev: options.dev,
        loading: options.messages.loading
      },
      options.loadingIndicator
    )
  }

  // Debug errors
  if (options.debug === undefined) {
    options.debug = options.dev
  }

  // Apply default hash to CSP option
  const csp = options.render.csp
  const cspDefaults = {
    hashAlgorithm: 'sha256',
    allowedSources: undefined,
    policies: undefined,
    reportOnly: options.debug
  }
  if (csp) {
    options.render.csp = _.defaults(_.isObject(csp) ? csp : {}, cspDefaults)
  }

  // cssSourceMap
  if (options.build.cssSourceMap === undefined) {
    options.build.cssSourceMap = options.dev
  }

  // babel cacheDirectory
  if (options.build.babel.cacheDirectory === undefined) {
    options.build.babel.cacheDirectory = options.dev
  }

  // vue config
  const vueConfig = options.vue.config

  if (vueConfig.silent === undefined) {
    vueConfig.silent = !options.dev
  }
  if (vueConfig.performance === undefined) {
    vueConfig.performance = options.dev
  }

  // Normalize ignore
  options.ignore = options.ignore ? [].concat(options.ignore) : []

  // Append ignorePrefix glob to ignore
  if (typeof options.ignorePrefix === 'string') {
    options.ignore.push(`**/${options.ignorePrefix}*.*`)
  }

  // Apply mode preset
  const modePreset = modes[options.mode || 'universal'] || modes.universal
  _.defaultsDeep(options, modePreset)

  // If no server-side rendering, add appear true transition
  /* istanbul ignore if */
  if (options.render.ssr === false && options.transition) {
    options.transition.appear = true
  }

  // We assume the SPA fallback path is 404.html (for GitHub Pages, Surge, etc.)
  if (options.generate.fallback === true) {
    options.generate.fallback = '404.html'
  }

  if (options.build.stats === 'none' || options.build.quiet === true) {
    options.build.stats = false
  }

  // Vendor backward compatibility with vssr 1.x
  if (typeof options.build.vendor !== 'undefined') {
    delete options.build.vendor
    consola.warn('vendor has been deprecated due to webpack4 optimization')
  }

  // TODO: remove when mini-css-extract-plugin supports HMR
  if (options.dev) {
    options.build.extractCSS = false
  }

  // include SFCs in node_modules
  options.build.transpile = [].concat(options.build.transpile || [])
    .map(module => module instanceof RegExp ? module : new RegExp(module))

  if (options.build.quiet === true) {
    consola.level = 0
  }

  return options
}
