export default function () {
  let ctr = 1

  // Add hook for module
  this.vssr.hook('modules:done', (moduleContainer) => {
    this.vssr.__module_hook = moduleContainer && ctr++
  })

  // Add hook for renderer
  this.vssr.hook('render:done', (renderer) => {
    this.vssr.__renderer_hook = renderer && ctr++
  })

  // Get data before data sent to client
  this.vssr.hook('render:context', (data) => {
    this.vssr.__render_context = data
  })

  // Add hook for build
  this.vssr.hook('build:done', (builder) => {
    this.vssr.__builder_hook = builder && ctr++
  })

  this.vssr.hook('build:done', (builder) => {
    this.vssr.__builder_plugin = builder && ctr++
  })
}
