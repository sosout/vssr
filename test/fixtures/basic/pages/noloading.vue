<template>
  <div>
    <h1>{{ name }}</h1>
    <p>{{ loaded }}</p>
  </div>
</template>

<script>
export default {
  loading: false,
  asyncData() {
    return new Promise((resolve) => {
      setTimeout(() => resolve({
        loaded: false,
        name: 'Vssr.js'
      }), 10)
    })
  },
  mounted() {
    this.$vssr.$loading.finish()
    setTimeout(() => {
      this.$vssr.$loading.start()
      this.loaded = true
    }, 1500)
  }
}
</script>
