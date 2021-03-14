<template>
  <v-container
    fluid
  >
    <v-row>
      <v-col
        v-for="(item, index) in pmStats"
        :key="index"
        cols="12"
        sm="6"
        md="3"
        class="pa-1"
      >
        <v-card>
          <v-card-title
            primary-title
            class="subtitle-1"
          >
            {{ item.name }}
            <div
              class="flex-grow-1"
            />
            Total: {{ item.open }}
          </v-card-title>
          <v-divider />
          <v-card-text>
            <b>
              PMs &ndash; Last 30 Days
            </b>
            <DoughnutChart
              :closed="item.closed"
              :opened="item.open"
              :past-due="item.pastDue"
              :percent-closed="calculate(item.open, item.closed, item)"
              :percent-past="calculate(item.open, item.pastDue, item)"
              :worker="index"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  components: {
    DoughnutChart: () => import('@/components/DoughnutChart.vue')
  },
  computed: {
    pmStats () { return this.$store.state.pmStats }
  },
  methods: {
    calculate (opened, variable, item) {
      let result = (variable / opened) * 100
      if (result === Infinity || isNaN(result)) { result = 0 }
      return Math.round(result)
    }
  }
}
</script>
