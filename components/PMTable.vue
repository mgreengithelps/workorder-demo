<!--
Datatable for PM Tickets
-->
<template>
  <v-col
    cols="12"
  >
    <v-card>
      <v-card-title
        class="title"
      >
        Preventative Maintenance
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
            <v-col
              v-if="iAmClaims.admin || iAmClaims.managerMaint || iAmClaims.managerEVS"
              cols="12"
              sm="3"
              class="px-1"
            >
              <v-select
                v-model="selectDepartment"
                :items="departments"
                item-text="name"
                item-value="value"
                :outlined="$vuetify.breakpoint.mdAndUp"
                label="Select Department"
                placeholder="Select Department"
              />
            </v-col>
            <v-col
              cols="12"
              sm="3"
              class="px-1"
            >
              <v-select
                v-model="selectLocation"
                :items="locations"
                item-text="text"
                item-value="value"
                :outlined="$vuetify.breakpoint.mdAndUp"
                label="Select Location"
                placeholder="Select Location"
              />
            </v-col>
            <v-col
              cols="12"
              sm="3"
              class="px-1"
            >
              <v-select
                v-model="selectWorker"
                :items="workers"
                :outlined="$vuetify.breakpoint.mdAndUp"
                label="Search by Assignee"
                placeholder="Search by Assignee"
              />
            </v-col>
            <v-col
              cols="12"
              sm="3"
              class="px-1"
            >
              <v-dialog
                ref="customDialog"
                v-model="customDialog"
                persistent
                width="290px"
              >
                <template
                  v-slot:activator="{ on }"
                >
                  <v-text-field
                    v-model="search"
                    append-icon="mdi-table-search"
                    label="Custom Search"
                    placeholder="Custom Search"
                    readonly
                    hide-details
                    :outlined="$vuetify.breakpoint.mdAndUp"
                    v-on="on"
                  />
                </template>
                <v-card>
                  <v-card-title
                    primary-title
                    class="pb-4"
                  >
                    Custom Search
                  </v-card-title>
                  <v-card-text>
                    <v-select
                      v-model="searchField"
                      :items="searchFields"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                      label="Search Field"
                      placeholder="Search Field"
                      :error-messages="searchFieldErrors"
                    />
                    <v-autocomplete
                      v-if="searchField === 'userId'"
                      v-model="searchValue"
                      :items="users"
                      item-text="displayName"
                      item-value="userId"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                      label="Search Value"
                      placeholder="Search Value"
                      :error-messages="searchValueErrors"
                    />
                    <v-autocomplete
                      v-else-if="searchField === 'staffDepartment'"
                      v-model="searchValue"
                      :items="departmentsStaff"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                      label="Search Value"
                      placeholder="Search Value"
                      :error-messages="searchValueErrors"
                    />
                    <v-text-field
                      v-else
                      v-model="searchValue"
                      name="searchValue"
                      label="Search Value"
                      placeholder="Search Value"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                      :error-messages="searchValueErrors"
                    />
                  </v-card-text>
                  <v-card-actions>
                    <v-btn
                      text
                      color="secondary"
                      @click="customDialog = false"
                    >
                      Cancel
                    </v-btn>
                    <div
                      class="flex-grow-1"
                    />
                    <v-btn
                      depressed
                      color="primary"
                      :loading="customLoading"
                      @click="customSearch"
                    >
                      Okay
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
            <v-col
              cols="6"
              sm="3"
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
              :items="pMs"
              :items-per-page.sync="itemsPerPage"
              :show-select="iAmClaims.admin && showSelect"
              :sort-by.sync="sortBy"
              :sort-desc.sync="descending"
              :custom-sort="customSort"
              :height="calcHeight"
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
                  @click.middle="goToOrder(item.id, true)"
                  @click.left="goToOrder(item.id, false)"
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
                v-slot:item.description="{ item }"
              >
                {{ item.description }}
              </template>
              <template
                v-slot:item.quickNote="{ item }"
              >
                {{ item.quickNote }}
              </template>
              <template
                v-slot:item.task="{ item }"
              >
                {{ item.task }}
              </template>
              <template
                v-slot:item.departmentIn="{ item }"
              >
                {{ item.departmentIn }}
              </template>
              <template
                v-slot:item.assignedTo="{ item }"
              >
                {{ item.assignedTo }}
              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-col>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'

export default {
  mixins: [validationMixin],
  validations: {
    searchField: { required },
    searchValue: { required }
  },
  data () {
    return {
      access: null,
      bulk: null,
      customDialog: false,
      customLoading: false,
      department: null,
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
          text: 'Subject',
          value: 'subject'
        },
        {
          text: 'Description',
          value: 'description'
        },
        {
          text: 'Quick Note',
          value: 'quickNote'
        },
        {
          text: 'Task',
          value: 'task'
        },
        {
          text: 'Location',
          value: 'departmentIn'
        },
        {
          text: 'Assigned To',
          value: 'assignedTo.displayName'
        }
      ],
      loading: false,
      search: null,
      searchField: null,
      searchValue: null,
      selected: [],
      showSelect: false,
      sortedItems: []
    }
  },
  computed: {
    // Change height of table depending on device screen size
    calcHeight () {
      return (this.$vuetify.breakpoint.smAndUp) ? 'calc(100vh - 435px)' : '1000px'
    },
    // Sort order
    descending: {
      get () {
        return this.$store.state.pmDescending
      },
      set (value) {
        this.$store
          .dispatch('updatePMDescending', value)
          .then(() => this.createIndex())
      }
    },
    iAmClaims () { return this.$store.state.claims },
    // Items per page, save in localStorage
    itemsPerPage: {
      get () {
        const items = (localStorage.getItem('pmsItemsPerPage')) ? parseInt(localStorage.getItem('pmsItemsPerPage')) : 25
        return items
      },
      set (val) {
        localStorage.setItem('pmsItemsPerPage', val)
        return val
      }
    },
    locations () {
      return [
        'All',
        ...this.$store.state.departments
      ]
    },
    pMs () { return this.$store.state.pms },
    searchFields () { return this.$store.state.searchFields },
    searchFieldErrors () {
      const errors = []
      if (!this.$v.searchField.$dirty) { return errors }
      !this.$v.searchField.required && errors.push('Search Field is required.')
      return errors
    },
    searchValueErrors () {
      const errors = []
      if (!this.$v.searchValue.$dirty) { return errors }
      !this.$v.searchValue.required && errors.push('Search Value is required.')
      return errors
    },
    selectDepartment: {
      get () {
        return this.$store.state.pmDepartment
      },
      set (value) {
        this.$store
          .dispatch('updatePMDeparment', value)
          .then(() => this.getPMs())
      }
    },
    selectLocation: {
      get () {
        return this.$store.state.pmLocations
      },
      set (value) {
        this.$store
          .dispatch('updatePMLocations', value)
          .then(() => this.getPMs())
      }
    },
    selectWorker: {
      get () {
        return this.$store.state.pmAssignee
      },
      set (value) {
        this.$store
          .dispatch('updatePMAssignee', value)
          .then(() => this.getPMs())
      }
    },
    sortBy: {
      get () {
        return this.$store.state.pmSortBy
      },
      set (value) {
        this.createIndex()
        this.$store
          .dispatch('updatePMSortBy', value)
      }
    },
    status: {
      get () {
        return this.$store.state.pmStatus
      },
      set (value) {
        this.$store
          .dispatch('updatePMStatus', value)
          .then(() => this.getPMs())
      }
    },
    user () { return this.$store.state.user },
    workers () { return this.$store.state.workers }
  },
  mounted () {
    this.initialize()
  },
  beforeDestroy () {
    this.$store
      .dispatch('destroyPMs')
  },
  methods: {
    // Bulk Reassign tickets
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
    //
    createIndex () {
      const index = []
      const items = (this.sortedItems.length > 0) ? this.sortedItems : this.pMs
      for (let i = 0; i < items.length; i++) {
        index
          .push(items[i].id)
      }
      this.sortedItems = []
      this.$store
        .commit('setWoIndex', index)
    },
    customSearch () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.customLoading = true
        this.assignedOnly = false
        this.search = `${this.searchField} === ${this.searchValue}`
        this.$store
          .dispatch('updatePMs', {
            department: this.selectDepartment,
            field: this.searchField,
            status: this.status,
            value: this.searchValue
          })
          .then(() => {
            this.customLoading = false
            this.customDialog = false
          })
          .catch((error) => {
            this.customLoading = false
            this.$store
              .dispatch('updateLocalErrors', error)
          })
      }
    },
    customSort (items, index, isDesc) {
      items
        .sort((a, b) => {
          // Sort date fields
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
            // Sort by Assigned to name
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
            // Normal alphabetical sort
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
    getPMs (data) {
      return new Promise((resolve, reject) => {
        this.loading = true
        this.$store
          .dispatch('updatePMs', {
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
    goToOrder (link, middle) {
      if (link && middle) {
        window
          .open(`https://.org/${this.user.displayName.replace(/\s+/g, '')}/workorder/${link}`, '_blank')
      } else if (link) {
        this.$router
          .push(`/${this.user.displayName.replace(/\s+/g, '')}/workorder/${link}`)
      }
    },
    initialize () {
      this.loading = true
      this.getWorkers()
      if (Object.keys(this.$store.state.user).length === 0) {
        return setTimeout(() => this.initialize(), 150)
      }
      this.setDepartmentAccess()
        .then(() => this.$store
          .dispatch('updatePMStatus')
        )
        .then(() => this.$store
          .dispatch('updatePMAssignee')
        )
        .then(() => this.$store
          .dispatch('updatePMLocations')
        )
        .then(() => this.$store
          .dispatch('updatePMDeparment')
        )
        .then(() => this.$store
          .dispatch('updatePMDescending')
        )
        .then(() => this.$store
          .dispatch('updatePMSortBy')
        )
        .then(() => this.$store
          .dispatch('updateLocations')
        )
        .then(() => { this.getPMs() })
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
      this.searchField = null
      this.searchValue = null
      this.search = null
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
                  name: 'Transportation',
                  value: 'transportation'
                }
              ]
              resolve(true)
              break
            case 'managerDietary':
              this.selectDepartment = 'dietary'
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
