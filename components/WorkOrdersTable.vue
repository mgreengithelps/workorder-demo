<template>
  <v-col
    cols="12"
  >
    <v-card>
      <v-card-title
        class="title pt-2"
      >
        Assigned Tickets
      </v-card-title>
      <v-divider />
      <v-card-text>
        <v-container
          fluid
          class="px-0"
        >
          <v-row>
            <v-col
              cols="12"
              sm="4"
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
            <v-col
              v-if="iAmClaims.admin || iAmClaims.managerMaint || iAmClaims.managerEVS"
              cols="12"
              sm="4"
              class="px-1"
            >
              <v-select
                v-model="selectDepartment"
                :items="departments"
                item-text="name"
                item-value="value"
                :outlined="$vuetify.breakpoint.mdAndUp"
                hide-details
                label="Select Department"
                placeholder="Select Department"
              />
            </v-col>
            <v-col
              cols="12"
              sm="4"
              class="px-1"
            >
              <v-select
                v-model="selectLocation"
                :items="locations"
                item-text="text"
                item-value="value"
                :outlined="$vuetify.breakpoint.mdAndUp"
                hide-details
                label="Select Location"
                placeholder="Select Location"
              />
            </v-col>
            <v-col
              cols="12"
              sm="4"
              class="px-1"
            >
              <v-select
                v-model="selectWorker"
                :items="workers"
                :outlined="$vuetify.breakpoint.mdAndUp"
                hide-details
                :disabled="(search) ? true : false"
                label="Search by Assignee"
                placeholder="Search by Assignee"
              />
            </v-col>
            <v-col
              cols="12"
              sm="4"
              class="px-1"
            >
              <v-text-field
                v-model="search"
                append-icon="mdi-table-search"
                label="Search"
                placeholder="Search"
                hide-details
                :outlined="$vuetify.breakpoint.mdAndUp"
                @keyup.enter="searchDescription"
                @click:append="searchDescription"
              />
            </v-col>
            <v-col
              cols="6"
              sm="4"
              class="px-1 d-flex"
            >
              <div>
                <v-btn
                  fab
                  depressed
                  small
                  color="primary"
                  class="mr-4"
                  @click="refresh"
                >
                  <v-icon>
                    mdi-refresh
                  </v-icon>
                </v-btn>
              </div>
              <div>
                <v-tooltip
                  bottom
                >
                  <template
                    v-slot:activator="{ on }"
                  >
                    <v-checkbox
                      v-model="showSelect"
                      color="primary"
                      hide-details
                      class="mt-0"
                      v-on="on"
                    />
                  </template>
                  <span>
                    Show Select
                  </span>
                </v-tooltip>
              </div>
            </v-col>
            <v-expand-transition>
              <v-col
                v-if="selected.length > 0"
                cols="12"
                sm="4"
                class="px-1"
              >
                <v-select
                  v-model="bulk"
                  :items="workers"
                  :outlined="$vuetify.breakpoint.mdAndUp"
                  label="Assign Orders"
                  placeholder="Assign Orders"
                  @change="bulkReassign"
                />
              </v-col>
            </v-expand-transition>
          </v-row>
        </v-container>
      </v-card-text>
      <v-container
        fluid
        class="px-0 pt-0 pb-3"
      >
        <v-row>
          <v-col
            cols="12"
          >
            <v-data-table
              v-model="selected"
              :footer-props="{
                itemsPerPageOptions: [
                  25,
                  50,
                  100,
                  250,
                  500,
                  -1
                ]
              }"
              :headers="headers"
              :height="calcHeight"
              :items="workOrders"
              :items-per-page.sync="itemsPerPage"
              :show-select="iAmClaims.admin && showSelect"
              :sort-by.sync="sortBy"
              :sort-desc.sync="descending"
              :custom-sort="customSort"
              :must-sort="true"
              :loading="loading"
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
                  :class="{
                    'font-weight-bold': item.read && !item.read[user.uid]
                  }"
                  @click.middle="goToOrder(item.ticketNumber, true, true)"
                  @click.left="goToOrder(item.ticketNumber, false, true)"
                >
                  {{ item.ticketNumber }}
                </a>
              </template>
              <template
                v-slot:item.subject="{ item }"
              >
                <span
                  class="error--text flashing"
                >
                  {{ item.urgent }}
                </span>
                <span
                  class="error--text"
                >
                  {{ item.pastDue }}
                </span>
                <a
                  class="middle-click"
                  :class="{
                    'font-weight-bold': item.read && !item.read[user.uid]
                  }"
                  @click.middle="goToOrder(item.id, true, false)"
                  @click.left="goToOrder(item.id, false, false)"
                >
                  {{ item.subject }}
                </a>
                <span
                  class="red--text font-weight-bold"
                >
                  {{ item.unreadComments }}
                </span>
              </template>
              <template
                v-slot:item.quickNote="{ item }"
              >
                {{ item.quickNote }}
              </template>
              <template
                v-slot:item.user="{ item }"
              >
                {{ item.user }}
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
                {{ item.assignedTo }}
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
    </v-card>
  </v-col>
</template>

<script>
export default {
  data () {
    return {
      access: null,
      bulk: null,
      customDialog: false,
      customLoading: false,
      departments: [],
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
          text: 'Quick Note',
          value: 'quickNote'
        },
        {
          text: 'From',
          value: 'user'
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
      search: null,
      selected: [],
      showSelect: false,
      sortedItems: []
    }
  },
  computed: {
    calcHeight () {
      return (window.screen.height - 435 >= 500) ? 'calc(100vh - 435px)' : '500px'
    },
    departmentsStaff () { return this.$store.state.departmentsStaff },
    descending: {
      get () {
        return this.$store.state.woDescending
      },
      set (value) {
        console.log('descending')
        this.$store
          .dispatch('updateWoDescending', value)
          .then(() => this.createIndex())
      }
    },
    iAmClaims () { return this.$store.state.claims },
    itemsPerPage: {
      get () {
        const items = (localStorage.getItem('woItemsPerPage')) ? parseInt(localStorage.getItem('woItemsPerPage')) : 25
        return items
      },
      set (val) {
        localStorage
          .setItem('woItemsPerPage', val)
        return val
      }
    },
    locations () { return this.$store.state.locations },
    selectDepartment: {
      get () {
        return this.$store.state.woDepartment
      },
      set (value) {
        this.$store
          .dispatch('updateWoDeparment', value)
          .then(() => this.getWorkOrders())
      }
    },
    selectLocation: {
      get () {
        return this.$store.state.woLocations
      },
      set (value) {
        this.$store
          .dispatch('updateWoLocations', value)
          .then(() => this.getWorkOrders())
      }
    },
    selectWorker: {
      get () {
        return this.$store.state.woAssignee
      },
      set (value) {
        this.$store
          .dispatch('updateWoAssignee', value)
          .then(() => this.getWorkOrders())
      }
    },
    sortBy: {
      get () {
        return this.$store.state.woSortBy
      },
      set (value) {
        this.$store
          .dispatch('updateWoSortBy', value)
      }
    },
    status: {
      get () {
        return this.$store.state.woStatus
      },
      set (value) {
        this.$store
          .dispatch('updateWoStatus', value)
          .then(() => this.getWorkOrders())
      }
    },
    user () { return this.$store.state.user },
    users () { return this.$store.state.users },
    workers () { return this.$store.state.workers },
    workOrders () { return this.$store.state.workorders }
  },
  mounted () {
    this.initialize()
  },
  beforeDestroy () {
    this.$store
      .dispatch('destroyWOs')
  },
  methods: {
    bulkReassign () {
      this.$store
        .dispatch('bulkReassign', {
          db: 'workOrders',
          items: this.selected,
          user: this.$firebase.auth().currentUser.displayName,
          worker: this.bulk
        })
        .then((response) => {
          this.selected = []
          this.bulk = null
        })
        .catch((error) => {
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
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
          } else if (index[0] === 'commentCount' && !isDesc[0]) {
            if (a[index[0]] < b[index[0]]) { return -1 }
            if (a[index[0]] > b[index[0]]) { return 1 }
            return 0
          } else if (index[0] === 'commentCount') {
            if (a[index[0]] < b[index[0]]) { return 1 }
            if (a[index[0]] > b[index[0]]) { return -1 }
            return 0
          } else if (index[0] === 'ticketNumber' && !isDesc[0]) {
            if (a[index[0]] < b[index[0]]) { return -1 }
            if (a[index[0]] > b[index[0]]) { return 1 }
            return 0
          } else if (index[0] === 'ticketNumber') {
            if (a[index[0]] < b[index[0]]) { return 1 }
            if (a[index[0]] > b[index[0]]) { return -1 }
            return 0
          } else if (!isDesc[0]) {
            // using zzz to sort null values to bottom of the list
            const A = (a[index[0]]) ? a[index[0]].toLowerCase() : 'zzz'
            const B = (b[index[0]]) ? b[index[0]].toLowerCase() : 'zzz'
            if (A < B) { return -1 }
            if (A > B) { return 1 }
            return 0
          } else {
            const A = (a[index[0]]) ? a[index[0]].toLowerCase() : 'zzz'
            const B = (b[index[0]]) ? b[index[0]].toLowerCase() : 'zzz'
            if (A < B) { return 1 }
            if (A > B) { return -1 }
            return 0
          }
        })
      this.sortedItems = items
      return items
    },
    getUsers () {
      if (this.$store.state.users.length === 0) {
        this.$store
          .dispatch('updateUsers')
          .catch((error) => {
            this.$store
              .dispatch('updateLocalErrors', error)
          })
      }
    },
    getWorkOrders () {
      return new Promise((resolve, reject) => {
        this.search = (localStorage.getItem('woSearch') && localStorage.getItem('woSearch') !== 'null') ? localStorage.getItem('woSearch') : null
        if (this.search) {
          this.searchDescription()
        } else {
          this.loading = true
          this.$store
            .dispatch('updateWorkorders', {
              department: this.selectDepartment,
              field: 'assignedTo',
              status: this.status,
              value: this.selectWorker
            })
            .then(() => {
              resolve(true)
              this.loading = false
              this.createIndex()
            })
            .catch((error) => {
              this.loading = false
              this.$store
                .dispatch('updateLocalErrors', error)
              reject(error)
            })
        }
      })
    },
    getWorkers () {
      if (!this.$firebase.auth().currentUser) {
        return setTimeout(() => { this.getWorkers() }, 150)
      } else if (this.$store.state.workers.length === 0) {
        this.$store
          .dispatch('getWorkers', this.$firebase.auth().currentUser.uid)
          .catch((error) => {
            this.$store
              .dispatch('updateLocalErrors', error)
          })
      }
    },
    goToOrder (link, middle, ticketNumber) {
      if (link && middle && ticketNumber) {
        window
          .open(`https://.org/${this.user.displayName.replace(/\s+/g, '')}/workorder/ticketNumber/${link}`, '_blank')
      } else if (link && ticketNumber) {
        this.$router
          .push(`/${this.user.displayName.replace(/\s+/g, '')}/workorder/ticketNumber/${link}`)
      } else if (link && middle) {
        window
          .open(`https://.org/${this.user.displayName.replace(/\s+/g, '')}/workorder/${link}`, '_blank')
      } else if (link) {
        this.$router
          .push(`/${this.user.displayName.replace(/\s+/g, '')}/workorder/${link}`)
      }
    },
    initialize () {
      this.loading = true
      if (Object.keys(this.$store.state.user).length === 0) {
        return setTimeout(() => this.initialize(), 150)
      } else {
        this.getWorkers()
        this.setDepartmentAccess()
          .then(() => this.$store
            .dispatch('updateWoStatus')
          )
          .then(() => this.$store
            .dispatch('updateWoAssignee')
          )
          .then(() => this.$store
            .dispatch('updateWoLocations')
          )
          .then(() => this.$store
            .dispatch('updateWoDeparment')
          )
          .then(() => this.$store
            .dispatch('updateWoDescending')
          )
          .then(() => this.$store
            .dispatch('updateWoSortBy')
          )
          .then(() => this.$store
            .dispatch('updateLocations')
          )
          .then(() => {
            this.getWorkOrders()
            this.getUsers()
          })
      }
    },
    refresh () {
      this.selectWorker = {
        text: 'All',
        value: {
          displayName: 'all',
          workerId: null
        }
      }
      this.selectLocation = 'All'
      if (this.iAmClaims.admin) {
        this.selectDepartment = 'all'
      }
      this.search = null
      localStorage
        .removeItem('woSearch', this.search)
    },
    searchDescription () {
      if (this.search) {
        this.loading = true
        localStorage
          .setItem('woSearch', this.search)
        this.$store
          .commit('clearWOs')
        this.search = this.search.toLowerCase()
        const arr = this.search.split(' ')
        if (arr.length > 10) {
          arr.length = 10
        }
        if (this.selectDepartment && this.selectDepartment === 'all') {
          this.$db
            .collection('workOrders')
            .where('status', '==', this.status)
            .where('descIndex', 'array-contains-any', arr)
            .get()
            .then((querySnapshot) => this.$store
              .dispatch('commitWorkOrders', { docs: querySnapshot, type: 'worker' })
            )
            .then(() => { this.loading = false })
            .catch((error) => {
              this.loading = false
              this.$store
                .dispatch('updateLocalErrors', error)
            })
        } else if (this.selectDepartment) {
          this.$db
            .collection('workOrders')
            .where('department', '==', this.selectDepartment)
            .where('status', '==', this.status)
            .where('descIndex', 'array-contains-any', arr)
            .get()
            .then((querySnapshot) => this.$store
              .dispatch('commitWorkOrders', { docs: querySnapshot, type: 'worker' })
            )
            .then(() => { this.loading = false })
            .catch((error) => {
              this.loading = false
              this.$store
                .dispatch('updateLocalErrors', error)
            })
        } else {
          this.$db
            .collection('workOrders')
            .where('status', '==', this.status)
            .where('descIndex', 'array-contains-any', arr)
            .get()
            .then((querySnapshot) => this.$store
              .dispatch('commitWorkOrders', { docs: querySnapshot, type: 'worker' })
            )
            .then(() => { this.loading = false })
            .catch((error) => {
              this.loading = false
              this.$store
                .dispatch('updateLocalErrors', error)
            })
        }
      } else {
        localStorage
          .removeItem('woSearch', this.search)
      }
    },
    setDepartmentAccess () {
      return new Promise((resolve, reject) => {
        try {
          Object
            .keys(this.iAmClaims)
            .forEach((k) => { if (this.iAmClaims[k]) { this.access = k } })
          switch (this.access) {
            case 'admin':
              this.departments = [
                {
                  name: 'All',
                  value: 'all'
                },
                {
                  name: 'Facilities',
                  value: 'facilities'
                },
                {
                  name: 'Biomed',
                  value: 'bioMed'
                },
                {
                  name: 'Dietary',
                  value: 'dietary'
                },
                {
                  name: 'Grounds',
                  value: 'grounds'
                },
                {
                  name: 'Environmental Services',
                  value: 'evs'
                },
                {
                  name: 'Information Technology',
                  value: 'it'
                },
                {
                  name: 'Statistics',
                  value: 'statistics'
                },
                {
                  name: 'Transportation',
                  value: 'transportation'
                }
              ]
              resolve(true)
              break
            case 'managerDietary':
              this.selectDepartment = 'dietary'
              this.departments = [
                {
                  name: 'Dietary',
                  value: 'dietary'
                }
              ]
              resolve(true)
              break
            case 'managerEVS':
              this.departments = [
                {
                  name: 'Environmental Services',
                  value: 'evs'
                },
                {
                  name: 'Transportation',
                  value: 'transportation'
                }
              ]
              this.selectDepartment = 'evs'
              resolve(true)
              break
            case 'managerMaint':
              this.departments = [
                {
                  name: 'Facilities',
                  value: 'facilities'
                },
                {
                  name: 'Biomed',
                  value: 'bioMed'
                },
                {
                  name: 'Grounds',
                  value: 'grounds'
                }
              ]
              resolve(true)
              break
            default:
              this.selectDepartment = this.access
              resolve(true)
              break
          }
        } catch (error) {
          reject(error)
        }
      })
    }
  }
}
</script>
