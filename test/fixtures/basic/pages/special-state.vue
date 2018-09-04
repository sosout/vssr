<template>
  <h1>Special state in `window.__VSSR__`</h1>
</template>

<script>
export default {
  fetch({ beforeVssrRender }) {
    if (process.server) {
      beforeVssrRender(({ vssrState }) => {
        vssrState.test = true
      })
    }
  }
}
</script>
