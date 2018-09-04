export default (pkg, { load }) => {
  // Read vssr package
  const vssr = load('../..')

  // Copy version before build for dist banner
  pkg.on('build:before', () => {
    pkg.copyFieldsFrom(vssr, ['version'])
    pkg.writePackage()
  })

  pkg.on('build:done', () => {
    // Copy fields from vssr package
    pkg.copyFieldsFrom(vssr, [
      'contributors',
      'license',
      'repository',
      'keywords',
      'homepage',
      'engines'
    ])

    // Copy files from vssr package
    pkg.copyFilesFrom(vssr, [
      'LICENSE.md',
      'bin/common',
      'bin/vssr-start'
    ])

    // Sync dependencies
    pkg.updateDependencies({
      dist: 'dist/vssr-start.js',
      sources: [vssr],
      extras: [
        'minimist',
        'vue-no-ssr',
        'vue-router',
        'vuex'
      ],
      exclude: [
        'jsdom'
      ]
    })

    // Update package.json
    pkg.writePackage()

    // Copy dist artifacts to vssr
    vssr.copyFilesFrom(pkg, ['dist'])
  })
}
