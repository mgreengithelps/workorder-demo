<!-- Top Level All Users for App Page -->
<template>
  <div>
    <nuxt-child />
  </div>
</template>

<script>
export default {
  beforeMount () { this.getUsers() },
  methods: {
    // Dispatch users store
    getUsers () {
      if (this.$store.state.users.length > 0) { return }
      this.$store
        .dispatch('updateUsers')
        .catch((error) => {
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    }
  }
}
</script>
