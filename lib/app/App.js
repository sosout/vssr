import Vue from 'vue'
<% if (loading) { %>import VssrLoading from '<%= (typeof loading === "string" ? loading : "./components/vssr-loading.vue") %>'<% } %>
<% css.forEach((c) => { %>
import '<%= relativeToBuild(resolvePath(c.src || c)) %>'
<% }) %>

<%= Object.keys(layouts).map((key) => {
  if (splitChunks.layouts) {
    return `const _${hash(key)} = () => import('${layouts[key]}'  /* webpackChunkName: "${wChunk('layouts/' + key)}" */).then(m => m.default || m)`
  } else {
    return `import _${hash(key)} from '${layouts[key]}'`
  }
}).join('\n') %>

const layouts = { <%= Object.keys(layouts).map(key => `"_${key}": _${hash(key)}`).join(',') %> }

<% if (splitChunks.layouts) { %>let resolvedLayouts = {}<% } %>

export default {
  head: <%= serialize(head).replace(/:\w+\(/gm, ':function(') %>,
  render(h, props) {
    <% if (loading) { %>const loadingEl = h('vssr-loading', { ref: 'loading' })<% } %>
    const layoutEl = h(this.layout || 'vssr')
    const templateEl = h('div', {
      domProps: {
        id: '__layout'
      },
      key: this.layoutName
    }, [ layoutEl ])

    const transitionEl = h('transition', {
      props: {
        name: '<%= layoutTransition.name %>',
        mode: '<%= layoutTransition.mode %>'
      }
    }, [ templateEl ])

    return h('div',{
      domProps: {
        id: '__vssr'
      }
    }, [
      <% if (loading) { %>loadingEl,<% } %>
      transitionEl
    ])
  },
  data: () => ({
    layout: null,
    layoutName: ''
  }),
  beforeCreate () {
    Vue.util.defineReactive(this, 'vssr', this.$options.vssr)
  },
  created () {
    // Add this.$vssr in child instances
    Vue.prototype.$vssr = this
    // add to window so we can listen when ready
    if (typeof window !== 'undefined') {
      window.$vssr = this
    }
    // Add $vssr.error()
    this.error = this.vssr.error
  },
  <% if (loading) { %>
  mounted () {
    this.$loading = this.$refs.loading
  },
  watch: {
    'vssr.err': 'errorChanged'
  },
  <% } %>
  methods: {
    <% if (loading) { %>
    errorChanged () {
      if (this.vssr.err && this.$loading) {
        if (this.$loading.fail) this.$loading.fail()
        if (this.$loading.finish) this.$loading.finish()
      }
    },
    <% } %>
    <% if (splitChunks.layouts) { %>
    setLayout (layout) {
      if (!layout || !resolvedLayouts['_' + layout]) layout = 'default'
      this.layoutName = layout
      let _layout = '_' + layout
      this.layout = resolvedLayouts[_layout]
      return this.layout
    },
    loadLayout (layout) {
      const undef = !layout
      const inexisting = !(layouts['_' + layout] || resolvedLayouts['_' + layout])
      let _layout = '_' + ((undef || inexisting) ? 'default' : layout)
      if (resolvedLayouts[_layout]) {
        return Promise.resolve(resolvedLayouts[_layout])
      }
      return layouts[_layout]()
        .then((Component) => {
          resolvedLayouts[_layout] = Component
          delete layouts[_layout]
          return resolvedLayouts[_layout]
        })
        .catch((e) => {
          if (this.$vssr) {
            return this.$vssr.error({ statusCode: 500, message: e.message })
          }
        })
    }
    <% } else { %>
    setLayout(layout) {
      if (!layout || !layouts['_' + layout]) {
        layout = 'default'
      }
      this.layoutName = layout
      this.layout = layouts['_' + layout]
      return this.layout
    },
    loadLayout(layout) {
      if (!layout || !layouts['_' + layout]) {
        layout = 'default'
      }
      return Promise.resolve(layouts['_' + layout])
    }
    <% } %>
  },
  components: {
    <%= (loading ? 'VssrLoading' : '') %>
  }
}
