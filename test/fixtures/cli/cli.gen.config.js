export default {
  buildDir: '.vssr-generate/.build',
  generate: {
    dir: '.vssr-generate/.generate'
  },
  hooks(hook) {
    hook('generate:done', (generator, errors) => {
      if (!errors || errors.length === 0) {
        process.stdout.write('Generated successfully')
      } else {
        process.stderr.write('Generated failed')
      }
    })
  }
}
