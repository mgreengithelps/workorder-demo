<template>
  <v-container
    fluid
    :class="{
      'px-3 py-0': $vuetify.breakpoint.mdAndUp,
      'pa-1': $vuetify.breakpoint.smAndDown
    }"
  >
    <v-row
      class="pb-5"
    >
      <CreateWorkOrder />
      <StaffWorkOrders />
      <v-col
        v-if="!iAmClaims.staff"
        cols="12"
        sm="6"
        md="3"
      >
        <v-btn
          block
          :color="($vuetify.theme.dark) ? 'darkBlue' : 'white'"
          @click="$router.push(`${$route.path}/orders`)"
        >
          View Work Order Tickets
        </v-btn>
      </v-col>
      <v-col
        v-if="!iAmClaims.staff"
        cols="12"
        sm="6"
        md="3"
      >
        <v-btn
          block
          :color="($vuetify.theme.dark) ? 'darkBlue' : 'white'"
          @click="$router.push(`${$route.path}/pms`)"
        >
          View PMs
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  components: {
    StaffWorkOrders: () => import('@/components/StaffWorkOrders.vue'),
    CreateWorkOrder: () => import('@/components/CreateWorkOrder.vue')
  },
  computed: {
    iAmClaims () { return this.$store.state.claims }
  }
}
</script>
