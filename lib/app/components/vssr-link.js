export default {
  name: 'vssr-link',
  functional: true,
  render (h, { data, children }) {
    return h('router-link', data, children)
  }
}
