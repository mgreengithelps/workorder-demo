<!--
Individual donut chart component
-->
<template>
  <canvas
    :ref="worker"
  />
</template>

<script>
import Chart from 'chart.js'

export default {
  // Data from parent
  props: {
    closed: {
      type: Number,
      default: 0
    },
    opened: {
      type: Number,
      default: 0
    },
    pastDue: {
      type: Number,
      default: 0
    },
    percentClosed: {
      type: Number,
      default: 0
    },
    percentPast: {
      type: Number,
      default: 0
    },
    worker: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      chart: null
    }
  },
  mounted () {
    this.drawChart()
  },
  methods: {
    drawChart () {
      // See chart.js --> https://www.chartjs.org/ for options
      if (!this.worker || !this.opened) { return setTimeout(() => { this.drawChart() }, 150) }
      this.chart = null
      this.newPer = 100 - this.percentClosed - this.percentPast
      this.$refs[this.worker]
        .getContext('2d')
        .clearRect(0, 0, this.$refs[this.worker].width, this.$refs[this.worker].height)
      this.chart = new Chart(this.$refs[this.worker], {
        type: 'doughnut',
        data: {
          datasets: [
            {
              backgroundColor: [
                this.$vuetify.theme.themes.light.info,
                this.$vuetify.theme.themes.light.primary,
                '#FF1744'
              ],
              data: [
                this.percentClosed,
                this.newPer,
                this.percentPast
              ]
            }
          ],
          labels: [
            `Closed: ${this.percentClosed}%`,
            `New: ${this.newPer}%`,
            `Past Due: ${this.percentPast}%`
          ]
        }
      })
    }
  }
}
</script>
