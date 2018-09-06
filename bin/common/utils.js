
const { resolve } = require('path')
const { existsSync } = require('fs')
const consola = require('consola')
const esm = require('esm')(module, {
  cache: false,
  cjs: {
    cache: true,
    vars: true,
    namedExports: true
  }
})

const getRootDir = argv => resolve(argv._[0] || '.')
const getVssrConfigFile = argv => resolve(getRootDir(argv), argv['config-file'])

exports.vssrConfigFile = getVssrConfigFile

// 合并命令行配置，获取最新配置：vssr dev <dir> -p <port number> -H <hostname>
exports.loadVssrConfig = (argv) => {
  // D:\_jobs\fullbook\vssr
  const rootDir = getRootDir(argv)
  // D:\_jobs\fullbook\vssr\vssr.config.js
  const vssrConfigFile = getVssrConfigFile(argv)

  let options = {}
  if (existsSync(vssrConfigFile)) {
    delete require.cache[vssrConfigFile]
    options = esm(vssrConfigFile)
    if (!options) {
      options = {}
    }
    if (options.default) {
      options = options.default
    }
  } else if (argv['config-file'] !== 'vssr.config.js') {
    consola.fatal('Could not load config file: ' + argv['config-file'])
  }
  // 命令行指定的路径参数覆盖 rootDir 属性配置
  if (rootDir/*typeof options.rootDir !== 'string'*/) {
    options.rootDir = rootDir
  }

  // Vssr Mode
  options.mode =
    (argv.spa && 'spa') || (argv.universal && 'universal') || options.mode

  // Server options
  if (!options.server) {
    options.server = {}
  }
  options.server.port = argv.port || options.server.port
  options.server.host = argv.hostname || options.server.host

  return options
}

exports.getLatestHost = (argv) => {
  const port =
    argv.port ||
    process.env.VSSR_PORT ||
    process.env.PORT ||
    process.env.npm_package_config_vssr_port
  const host =
    argv.hostname ||
    process.env.VSSR_HOST ||
    process.env.HOST ||
    process.env.npm_package_config_vssr_host
  const socket =
    argv['unix-socket'] ||
    process.env.UNIX_SOCKET ||
    process.env.npm_package_config_unix_socket

  return { port, host, socket }
}
