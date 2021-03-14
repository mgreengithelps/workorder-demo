<template>
  <v-col
    cols="12"
    sm="12"
    :md="(!minimize) ? '12' : '3'"
  >
    <v-hover
      v-slot:default="{ hover }"
    >
      <v-card
        :elevation="hover ? 18 : 2"
      >
        <v-card-title
          :class="(!minimize) ? 'title pt-2' : 'subtitle-1 pa-2'"
        >
          Your {{ status }} Ticket Requests
          <v-spacer />
          <v-btn
            v-if="!minimize"
            color="primary"
            icon
            @click="minimize = !minimize"
          >
            <v-icon>
              mdi-window-close
            </v-icon>
          </v-btn>
          <v-btn
            v-else
            color="primary"
            icon
            @click="minimize = !minimize"
          >
            <v-icon>
              mdi-dock-window
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-divider
          v-if="!minimize"
        />
        <v-expand-transition>
          <div
            v-show="!minimize"
          >
            <v-card-text
              :style="(!minimize) ? 'opacity:1.0;' : 'opacity:0.0;'"
            >
              <v-container
                fluid
                class="px-0"
              >
                <v-row>
                  <v-col
                    cols="12"
                    sm="3"
                    class="px-1"
                  >
                    <v-select
                      v-model="status"
                      :items="[
                        'Open',
                        'Closed'
                      ]"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                      hide-details
                      label="Status"
                      placeholder="Status"
                    />
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-container
              fluid
              class="px-0 pt-0 pb-3"
              :style="(!minimize) ? 'opacity:1.0;' : 'opacity:0.0;'"
            >
              <v-row>
                <v-col
                  cols="12"
                >
                  <v-data-table
                    ref="table"
                    :headers="headers"
                    :items="workOrders"
                    :height="calcHeight"
                    :items-per-page="-1"
                    :sort-by.sync="sortBy"
                    :sort-desc.sync="descending"
                    :custom-sort="customSort"
                    :must-sort="true"
                    no-data-text="No Data Currently Available"
                  >
                    <template
                      v-slot:item.createdDate="{ item }"
                    >
                      {{ item.createdDate }}
                    </template>
                    <template
                      v-slot:item.lastUpdated="{ item }"
                    >
                      {{ item.lastUpdated }}
                    </template>
                    <template
                      v-slot:item.ticketNumber="{ item }"
                    >
                      <a
                        class="middle-click"
                        @click.middle="goToOrder(`workorder/ticketNumber/${item.ticketNumber}`)"
                        @click.left="$router.push(`workorder/ticketNumber/${item.ticketNumber}`)"
                      >
                        {{ item.ticketNumber }}
                      </a>
                    </template>
                    <template
                      v-slot:item.subject="{ item }"
                    >
                      <a
                        @click="$router.push(`workorder/${item.id}`)"
                      >
                        {{ item.subject }}
                      </a>
                    </template>
                    <template
                      v-slot:item.building="{ item }"
                    >
                      {{ item.building }}
                    </template>
                    <template
                      v-slot:item.staffDepartment="{ item }"
                    >
                      {{ item.staffDepartment }}
                    </template>
                    <template
                      v-slot:item.assignedTo="{ item }"
                    >
                      <div
                        v-if="item.assignedTo && typeof item.assignedTo === 'object'"
                      >
                        {{ item.assignedTo.displayName }}
                      </div>
                      <div
                        v-else
                      >
                        Not Assigned
                      </div>
                    </template>
                    <template
                      v-slot:item.commentCount="{ item }"
                    >
                      {{ item.commentCount }}
                    </template>
                  </v-data-table>
                </v-col>
              </v-row>
            </v-container>
          </div>
        </v-expand-transition>
      </v-card>
    </v-hover>
  </v-col>
</template>

<script>
export default {
  data () {
    return {
      headers: [
        {
          text: 'Date Created',
          value: 'createdDate'
        },
        {
          text: 'Last Updated',
          value: 'lastUpdated'
        },
        {
          text: 'Ticket Number',
          value: 'ticketNumber'
        },
        {
          text: 'Subject',
          value: 'subject'
        },
        {
          text: 'Location',
          value: 'building'
        },
        {
          text: 'Department',
          value: 'staffDepartment'
        },
        {
          text: 'Assigned To',
          value: 'assignedTo.displayName'
        },
        {
          text: 'Comments',
          value: 'commentCount'
        }
      ],
      loading: false,
      sortBy: 'createdDate',
      sortedItems: []
    }
  },
  computed: {
    calcHeight () {
      return (this.$vuetify.breakpoint.smAndUp) ? 'calc(100vh - 550px)' : '1000px'
    },
    descending: {
      get () {
        return true
      },
      set (val) {
        this.createIndex()
        return val
      }
    },
    iAmClaims () { return this.$store.state.claims },
    minimize: {
      get () {
        return this.$store.state.staffMinimize
      },
      set (value) {
        this.$store
          .dispatch('updateStaffMinimize', value)
      }
    },
    status: {
      get () {
        return this.$store.state.staffStatus
      },
      set (value) {
        this.$store
          .dispatch('updateStaffStatus', value)
          .then(() => this.getWorkOrders())
      }
    },
    workOrders () { return this.$store.state.staffWorkOrders }
  },
  mounted () {
    this.initialize()
  },
  beforeDestroy () {
    this.$store
      .dispatch('destroyStaffWOs')
  },
  methods: {
    createIndex () {
      const index = []
      const items = (this.sortedItems.length > 0) ? this.sortedItems : this.workOrders
      for (let i = 0; i < items.length; i++) {
        index
          .push(items[i].id)
      }
      this.sortedItems = []
      this.$store
        .commit('setWoIndex', index)
    },
    customSort (items, index, isDesc) {
      items
        .sort((a, b) => {
          if (index[0] === 'createdDate' || index[0] === 'lastUpdated') {
            if (!isDesc[0]) {
              if (new Date(a[index]) < new Date(b[index])) { return -1 }
              if (new Date(a[index]) > new Date(b[index])) { return 1 }
              return 0
            } else {
              if (new Date(a[index]) < new Date(b[index])) { return 1 }
              if (new Date(a[index]) > new Date(b[index])) { return -1 }
              return 0
            }
          } else if (index[0] === 'assignedTo.displayName') {
            if (!isDesc[0]) {
              if (!a.assignedTo) { return -1 }
              if (!b.assignedTo) { return 1 }
              if (a.assignedTo.displayName < b.assignedTo.displayName) { return -1 }
              if (a.assignedTo.displayName > b.assignedTo.displayName) { return 1 }
              return 0
            } else {
              if (!a.assignedTo) { return 1 }
              if (!b.assignedTo) { return -1 }
              if (a.assignedTo.displayName < b.assignedTo.displayName) { return 1 }
              if (a.assignedTo.displayName > b.assignedTo.displayName) { return -1 }
              return 0
            }
          } else if (!isDesc[0]) {
            if (a[index[0]] < b[index[0]]) { return -1 }
            if (a[index[0]] > b[index[0]]) { return 1 }
            return 0
          } else {
            if (a[index[0]] < b[index[0]]) { return 1 }
            if (a[index[0]] > b[index[0]]) { return -1 }
            return 0
          }
        })
      this.sortedItems = items
      return items
    },
    getWorkOrders () {
      return new Promise((resolve, reject) => {
        if (Object.keys(this.iAmClaims).length === 0) {
          return setTimeout(() => this.getWorkOrders(), 150)
        }
        this.loading = true
        this.$store
          .dispatch('updateWorkorders', {
            field: 'userId',
            staff: true,
            status: this.status,
            value: this.$firebase.auth().currentUser.uid
          })
          .then(() => {
            this.loading = false
            this.createIndex()
            resolve(true)
          })
          .catch((error) => {
            this.loading = false
            this.$store
              .dispatch('updateLocalErrors', error)
            reject(error)
          })
      })
    },
    initialize () {
      this.$store
        .dispatch('updateStaffMinimize')
      this.$store
        .dispatch('updateStaffStatus')
        .then(() => setTimeout(() => { this.getWorkOrders() }, 750))
    }
  }
}
</script>
