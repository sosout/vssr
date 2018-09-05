/*!
 * Vssr.js
 * (c) 2018 Weich
 * Released under the MIT License.
 */

const fs = require('fs')
const path = require('path')

if (fs.existsSync(path.resolve(__dirname, '.babelrc'))) {
  // 使用链接存储库时使用esm版本以防止构建
  const requireModule = require('esm')(module, {})
  module.exports = requireModule('./lib/index.js').default
} else {
  // 默认情况下使用生产包
  module.exports = require('./dist/vssr.js')
}
