<template>
  <p>Never displayed</p>
</template>

<script>
export default {
  fetch({ error }) {
    error({ message: 'Vssr Error', statusCode: 200 })
  }
}
</script>
