import Vue from 'vue'
import VssrChild from './vssr-child'

<% if (components.ErrorPage) { %>
  <% if (('~@').includes(components.ErrorPage.charAt(0))) { %>
import VssrError from '<%= components.ErrorPage %>'
  <% } else { %>
import VssrError from '<%= "../" + components.ErrorPage %>'
  <% } %>
<% } else { %>
import VssrError from './vssr-error.vue'
<% } %>

import { compile } from '../utils'

export default {
  name: 'vssr',
  props: ['vssrChildKey', 'keepAlive'],
  render(h) {
    // If there is some error
    if (this.vssr.err) {
      return h('vssr-error', {
        props: {
          error: this.vssr.err
        }
      })
    }
    // Directly return vssr child
    return h('vssr-child', {
      key: this.routerViewKey,
      props: this.$props
    })
  },
  beforeCreate () {
    Vue.util.defineReactive(this, 'vssr', this.$root.$options.vssr)
  },
  computed: {
    routerViewKey () {
      // If vssrChildKey prop is given or current route has children
      if (typeof this.vssrChildKey !== 'undefined' || this.$route.matched.length > 1) {
        return this.vssrChildKey || compile(this.$route.matched[0].path)(this.$route.params)
      }
      const Component = this.$route.matched[0] && this.$route.matched[0].components.default
      if (Component && Component.options && Component.options.key) {
        return (typeof Component.options.key === 'function' ? Component.options.key(this.$route) : Component.options.key)
      }
      return this.$route.path
    }
  },
  components: {
    VssrChild,
    VssrError
  }
}
