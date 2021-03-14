<template>
  <v-container
    fluid
    :class="{
      'px-3 py-0': $vuetify.breakpoint.mdAndUp,
      'px-1 py-0': $vuetify.breakpoint.smAndDown
    }"
  >
    <v-row
      class="pb-5"
    >
      <v-col
        v-if="iAmClaims.staff"
        cols="12"
        sm="6"
        md="4"
        lg="6"
        :class="{
          'px-3': $vuetify.breakpoint.smAndUp,
          'pb-3': $vuetify.breakpoint.smAndDown
        }"
      >
        <Welcome />
      </v-col>
      <!--
      <v-col
        cols="12"
        sm="6"
        md="4"
        lg="6"
        :class="{
          'px-3': $vuetify.breakpoint.smAndUp,
          'pb-3': $vuetify.breakpoint.smAndDown
        }"
      >
        <Info />
      </v-col>
      -->
      <v-col
        v-if="iAmClaims.admin || iAmClaims.managerMaint || iAmClaims.managerEVS"
        cols="12"
        class="py-0"
        :class="{
          'px-3': $vuetify.breakpoint.smAndUp
        }"
      >
        <v-container
          fluid
          class="pb-0"
        >
          <v-row>
            <v-col
              cols="12"
              sm="6"
              md="3"
              lg="2"
              class="pa-1"
            >
              <v-card>
                <v-card-title
                  primary-title
                  class="subtitle-1"
                >
                  Reporting Department
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <v-select
                    v-model="reportingDepartment"
                    :items="departments"
                    :outlined="$vuetify.breakpoint.mdAndUp"
                    placeholder="Select Department"
                    label="Select Department"
                  />
                </v-card-text>
              </v-card>
            </v-col>
            <v-col
              cols="12"
              sm="6"
              md="9"
              lg="10"
              class="pa-1"
            >
              <Reporting />
            </v-col>
          </v-row>
        </v-container>
      </v-col>
      <v-col
        v-if="!iAmClaims.staff"
        cols="12"
        class="py-0"
        :class="{
          'px-3': $vuetify.breakpoint.smAndUp
        }"
      >
        <UserWoStats />
      </v-col>
      <v-col
        v-if="!iAmClaims.staff && !iAmClaims.dietary && !iAmClaims.managerDietary"
        cols="12"
        class="py-0"
        :class="{
          'px-3': $vuetify.breakpoint.smAndUp
        }"
      >
        <UserPMStats />
      </v-col>
      <v-col
        v-if="iAmClaims.admin"
        cols="12"
        sm="6"
        md="4"
        :class="{
          'pl-4 pr-1 py-0': $vuetify.breakpoint.smAndUp
        }"
      >
        <ErrorWidget />
      </v-col>
      <v-col
        v-if="iAmClaims.admin"
        cols="12"
        sm="6"
        md="4"
        :class="{
          'px-1 py-0': $vuetify.breakpoint.smAndUp
        }"
      >
        <NewUser />
      </v-col>
      <v-col
        v-if="iAmClaims.admin"
        cols="12"
        sm="6"
        md="4"
        :class="{
          'pr-4 pl-1 py-0': $vuetify.breakpoint.smAndUp
        }"
      >
        <UpdateUser />
      </v-col>
      <v-col
        v-if="iAmClaims.admin"
        cols="12"
        sm="6"
        md="4"
        :class="{
          'pl-4 pr-1 py-4': $vuetify.breakpoint.smAndUp
        }"
      >
        <ReIndex />
      </v-col>
      <v-col
        v-show="bender"
        cols="12"
        style="position:absolute; width: 100vw; height: 100vh;"
      >
        <CheatCode />
      </v-col>
      <!--
      <v-col
        v-if="iAmClaims.admin"
        cols="12"
        sm="6"
        md="3"
      >
        <DevOps />
      </v-col>
      -->
    </v-row>
  </v-container>
</template>

<script>
const codesEqual = (a, b) => {
  if (a === b) { return true }
  if (a == null || b == null) { return false }
  if (a.length !== b.length) { return false }
  for (let i = 0; i < a.length; i++) { if (a[i] !== b[i]) { return false } }
  return true
}

export default {
  components: {
    // DevOps: () => import('@/components/DevOps.vue'),
    ReIndex: () => import('@/components/ReIndex.vue'),
    CheatCode: () => import('@/components/CheatCode.vue'),
    ErrorWidget: () => import('@/components/ErrorWidget.vue'),
    Reporting: () => import('@/components/Reporting.vue'),
    UserPMStats: () => import('@/components/UserPMStats.vue'),
    UserWoStats: () => import('@/components/UserWoStats.vue'),
    Welcome: () => import('@/components/Welcome.vue'),
    // Info: () => import('@/components/Info.vue'),
    NewUser: () => import('@/components/NewUser.vue'),
    UpdateUser: () => import('@/components/UpdateUser.vue')
  },
  data () {
    return {
      bender: false,
      code: [],
      reward: [
        new Audio('/e.mp3'),
        new Audio('/pianostorm9000.mp3')
      ],
      unlock: [
        'ArrowUp',
        'ArrowUp',
        'ArrowDown',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'ArrowLeft',
        'ArrowRight',
        'b',
        'a',
        'Enter'
      ]
    }
  },
  computed: {
    departments () {
      if (this.iAmClaims.admin) {
        return [
          {
            text: 'Biomed',
            value: 'bioMed'
          },
          {
            text: 'Dietary',
            value: 'dietary'
          },
          {
            text: 'Environmental Services',
            value: 'evs'
          },
          {
            text: 'Facilities',
            value: 'facilities'
          },
          {
            text: 'Grounds',
            value: 'grounds'
          },
          {
            text: 'Information Technology',
            value: 'it'
          },
          {
            text: 'Transportation',
            value: 'transportation'
          }
        ]
      } else if (this.iAmClaims.managerMaint) {
        return [
          {
            text: 'Biomed',
            value: 'bioMed'
          },
          {
            text: 'Facilities',
            value: 'facilities'
          },
          {
            text: 'Grounds',
            value: 'grounds'
          }
        ]
      } else if (this.iAmClaims.managerEVS) {
        return [
          {
            text: 'Environmental Services',
            value: 'evs'
          },
          {
            text: 'Transportation',
            value: 'transportation'
          }
        ]
      } else {
        return []
      }
    },
    iAmClaims () { return this.$store.state.claims },
    reportingDepartment: {
      get () {
        return this.$store.state.reportingDepartment
      },
      set (value) {
        this.$store
          .dispatch('updateReportingDepartment', value)
          .then(() => this.$store
            .dispatch('getDateAndTime')
          )
          .then((response) => this.getStats())
          .catch((error) => {
            this.$store
              .dispatch('updateLocalErrors', error)
          })
      }
    },
    woStats () { return this.$store.state.woStats }
  },
  mounted () {
    window
      .addEventListener('keydown', this.cheatInput)
    this.$store
      .dispatch('updateReportingDepartment')
      .then(() => this.getStats())
      .catch((error) => {
        this.$store
          .dispatch('updateLocalErrors', error)
      })
  },
  beforeDestroy () {
    window
      .removeEventListener('keydown', this.cheatInput)
    this.$store
      .dispatch('destroyStats')
  },
  methods: {
    cheatInput (e) {
      if (this.iAmClaims.admin || this.iAmClaims.it) {
        this.code.push(e.key)
        if (e.key === ' ') {
          this.reward[0].pause()
          this.reward[1].pause()
          this.code.length = 0
          this.bender = false
        } else if (codesEqual(this.code, this.unlock)) {
          const random = Math.round(Math.random())
          this.reward[random].play()
          this.bender = true
        } else if (this.code.length > 11) {
          this.code.length = 0
        }
      }
    },
    dispatchStats () {
      this.$store
        .dispatch('getWOStats', {
          department: this.reportingDepartment
        })
        .catch((error) => {
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    getStats () {
      if (Object.keys(this.iAmClaims).length === 0) {
        setTimeout(() => { return this.getStats() }, 150)
      } else {
        Object
          .keys(this.iAmClaims)
          .forEach((k) => {
            if (this.iAmClaims[k]) { this.access = k }
          })
        switch (this.access) {
          case 'staff':
            break
          case 'admin':
            if (!this.reportingDepartment) { this.reportingDepartment = 'it' }
            this.dispatchStats()
            break
          case 'managerMaint':
            if (!this.reportingDepartment) { this.reportingDepartment = 'facilities' }
            this.dispatchStats()
            break
          case 'managerEVS':
            if (!this.reportingDepartment) { this.reportingDepartment = 'evs' }
            this.dispatchStats()
            break
          case 'managerDietary':
            if (!this.reportingDepartment) { this.reportingDepartment = 'dietary' }
            this.dispatchStats()
            break
          default:
            if (!this.reportingDepartment) { this.reportingDepartment = this.access }
            this.$store
              .dispatch('getDateAndTime')
              .then((response) => this.$store
                .dispatch('getWOStats', {
                  date: response.mmyyyy,
                  department: this.reportingDepartment,
                  endMonth: response.endMonth,
                  mmyyyy: response.mmyyyy,
                  startMonth: response.startMonth,
                  startMonthShort: response.startMonthShort,
                  type: 'worker',
                  uid: this.$firebase.auth().currentUser.uid
                })
              )
              .catch((error) => {
                this.$store
                  .dispatch('updateLocalErrors', error)
              })
            break
        }
      }
    }
  }
}
</script>
