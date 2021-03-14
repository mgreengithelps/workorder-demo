<template>
  <PMTable
    v-if="!iAmClaims.staff"
  />
</template>

<script>
export default {
  components: {
    PMTable: () => import('@/components/PMTable.vue')
  },
  computed: {
    iAmClaims () { return this.$store.state.claims }
  }
}
</script>
