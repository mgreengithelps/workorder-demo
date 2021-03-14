<template>
  <v-app>
    <v-content
      id="home"
    >
      <v-container
        fluid
        :class="{'pa-0': $vuetify.breakpoint.smAndDown}"
      >
        <nuxt />
      </v-container>
    </v-content>
    <v-snackbar
      v-model="newUpdate"
      :timeout="0"
    >
      A New Update is Available!
      <v-btn
        text
        color="primary"
        @click.native="reload"
      >
        Refresh
      </v-btn>
      <v-btn
        text
        color="secondary"
        @click.native="newUpdate = false"
      >
        Ignore
      </v-btn>
    </v-snackbar>
    <ErrorReport />
  </v-app>
</template>

<script>
export default {
  components: {
    ErrorReport: () => import('@/components/ErrorReport.vue')
  },
  data () {
    return { newUpdate: false }
  },
  beforeMount () {
    this.setTheme()
    this.newVersion()
  },
  methods: {
    async newVersion () {
      // Check if new version of Service Worker or cache is available,
      // if so pass worker to watch when its finished installing and alert user,
      // with snackbar, or if its just cache alert user there is an update
      // with a snackbar
      const sw = await navigator.serviceWorker
      if (sw) {
        sw
          .getRegistrations()
          .then((registrations) => {
            for (const worker of registrations) {
              if (worker.waiting && worker.installing) {
                this.trackInstalling(worker)
              }
            }
          })
        // BroadcastChannel API supported. Watch for update message
        if ('BroadcastChannel' in self) {
          const updatesChannel = new BroadcastChannel('new-update-channel')
          updatesChannel
            .addEventListener('message', (event) => { this.updateReady() })
        }
      }
    },
    setTheme () {
      // Get theme from local storage and set if available
      if (localStorage.getItem('theme') && localStorage.getItem('theme') === 'true') {
        this.$vuetify.theme.dark = true
      } else {
        this.$vuetify.theme.dark = false
      }
    },
    // Listen for when new worker is installed then show snackbar
    trackInstalling (worker) {
      worker
        .addEventListener('statechange', () => {
          if (worker.state === 'installed') {
            worker
              .postMessage({ type: 'SKIP_WAITING' })
            this.updateReady(worker)
          }
        })
    },
    // Show snackbar when update is available
    updateReady (worker) { this.newUpdate = true },
    reload () { location.reload(true) }
  }
}
</script>

<style scoped>
#home {
  background: #8360c3;  /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #2ebf91, #033F60);  /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to right, #2ebf91, #033F60); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}
@media (max-width: 599px) {
  #home {
    background: #033F60;
  }
}
</style>
