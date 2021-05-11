<!--welcome -->
<template>
  <div>welcome</div>
</template>

<script>
export default {
  created() {
    this.removeActivePath()
  },
  data() {
    return {}
  },
  methods: {
    removeActivePath() {
      console.log(this.$route.path)
      if (this.$route.path === '/welcome') {
        window.sessionStorage.removeItem('activePath')
      }
    },
  },
}
</script>