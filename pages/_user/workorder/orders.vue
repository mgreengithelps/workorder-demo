<template>
  <WorkOrdersTable
    v-if="!iAmClaims.staff"
  />
</template>

<script>
export default {
  components: {
    WorkOrdersTable: () => import('@/components/WorkOrdersTable.vue')
  },
  computed: {
    iAmClaims () { return this.$store.state.claims }
  }
}
</script>
