<template>
  <div>
    <h3>child: <i data-date-child>{{ date }}</i></h3>
    <vssr-child />
  </div>
</template>

<script>
export default {
  asyncData() {
    return {
      date: Date.now()
    }
  }
}
</script>
