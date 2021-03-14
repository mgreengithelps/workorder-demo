<!-- View all Assets for Assets Page -->
<template>
  <v-container
    fluid
    :class="{
      'px-3 pt-0': $vuetify.breakpoint.mdAndUp,
      'pa-1': $vuetify.breakpoint.smAndDown
    }"
  >
    <v-row>
      <v-col
        cols="12"
      >
        <v-card
          outlined
        >
          <v-card-title
            class="display-1 pb-3"
          >
            Assets
            <v-spacer />
            <div
              style="display:flex;justify-content:space-evenly;align-items:center;"
            >
              <div>
                <v-btn
                  text
                  :disabled="disabled"
                  @click="transferDialog = true"
                >
                  Reassign PMs
                </v-btn>
              </div>
              <div>
                <v-tooltip
                  bottom
                >
                  <template
                    v-slot:activator="{ on }"
                  >
                    <v-btn
                      icon
                      depressed
                      nuxt
                      color="primary"
                      to="assets/new"
                      v-on="on"
                    >
                      <v-icon>
                        mdi-database-plus
                      </v-icon>
                    </v-btn>
                  </template>
                  <span>
                    New Asset
                  </span>
                </v-tooltip>
              </div>
              <div
                class="pl-2"
              >
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
                      dense
                      v-on="on"
                    />
                  </template>
                  <span>
                    Show Select
                  </span>
                </v-tooltip>
              </div>
              <div>
                <v-tooltip
                  bottom
                >
                  <template
                    v-slot:activator="{ on }"
                  >
                    <v-btn
                      icon
                      depressed
                      color="info"
                      v-on="on"
                      @click="toggleActive"
                    >
                      <v-icon
                        v-show="!active"
                      >
                        mdi-eye-off
                      </v-icon>
                      <v-icon
                        v-show="active"
                      >
                        mdi-eye-check
                      </v-icon>
                    </v-btn>
                  </template>
                  <span
                    v-if="!active"
                  >
                    Show Active
                  </span>
                  <span
                    v-else
                  >
                    Show Inactive
                  </span>
                </v-tooltip>
              </div>
              <div>
                <v-tooltip
                  bottom
                >
                  <template
                    v-slot:activator="{ on }"
                  >
                    <v-btn
                      icon
                      depressed
                      color="secondary"
                      v-on="on"
                      @click="scanDialog = true"
                    >
                      <v-icon>
                        mdi-barcode
                      </v-icon>
                    </v-btn>
                  </template>
                  <span>
                    Barcode Scanner
                  </span>
                </v-tooltip>
              </div>
            </div>
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-container
              fluid
              class="pa-0"
            >
              <v-row>
                <v-col
                  cols="12"
                  sm="6"
                  md="3"
                  class="px-1"
                >
                  <v-text-field
                    v-model="searchName"
                    name="searchName"
                    append-icon="mdi-refresh"
                    hide-details
                    prepend-inner-icon="mdi-table-search"
                    label="Search by Asset Tag"
                    placeholder="Search by Asset Tag"
                    :outlined="$vuetify.breakpoint.mdAndUp"
                    @click:append="refresh"
                    @click:prepend-inner="search"
                    @keyup.enter="search"
                  />
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                  md="3"
                  class="px-1"
                >
                  <v-text-field
                    v-model="searchDescription"
                    name="searchDescription"
                    append-icon="mdi-refresh"
                    hide-details
                    prepend-inner-icon="mdi-table-search"
                    label="Search by Asset Description"
                    placeholder="Search by Asset Description"
                    :outlined="$vuetify.breakpoint.mdAndUp"
                    @click:append="refresh"
                    @click:prepend-inner="search"
                    @keyup.enter="searchByDescription"
                  />
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                  md="3"
                  class="px-1"
                >
                  <v-select
                    v-model="letter"
                    hide-details
                    :items="letters"
                    label="Sort By Description"
                    prepend-inner-icon="mdi-table-search"
                    placeholder="Sort By Description"
                    :outlined="$vuetify.breakpoint.mdAndUp"
                    @input="alphaSort"
                  />
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                  md="3"
                  class="px-1"
                >
                  <v-select
                    v-model="department"
                    hide-details
                    :items="departments"
                    :disabled="!iAmClaims.admin && !iAmClaims.managerMaint && !iAmClaims.managerEVS"
                    item-text="name"
                    item-value="value"
                    :outlined="$vuetify.breakpoint.mdAndUp"
                    label="Department"
                    placeholder="Department"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <AssetsTable
            :show-select="showSelect"
          />
        </v-card>
      </v-col>
    </v-row>
    <v-dialog
      v-model="scanDialog"
      max-width="300px"
    >
      <v-card>
        <v-card-title
          class="justify-center pb-5"
        >
          Barcode Scanner
        </v-card-title>
        <v-card-text>
          <v-text-field
            ref="scannerText"
            v-model="scannerText"
            name="scannerText"
            placeholder="Scan Now"
            class="px-4 py-0 caption"
            @input="convertBarcode"
          />
        </v-card-text>
        <v-card-actions>
          <div
            class="flex-grow-1"
          />
          <v-btn
            color="primary"
            text
            @click="scanDialog = false"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <ReAssignPMs
      :dialog="transferDialog"
    />
  </v-container>
</template>

<script>
export default {
  components: {
    AssetsTable: () => import('@/components/AssetsTable.vue'),
    ReAssignPMs: () => import('@/components/ReAssignPMs.vue')
  },
  data () {
    return {
      active: true,
      letter: null,
      letters: [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z'
      ],
      searchDescription: null,
      searchName: null,
      scanDialog: false,
      scannerText: '',
      showSelect: false,
      transferDialog: false
    }
  },
  computed: {
    department: {
      get () {
        if (localStorage.getItem('assetSelectDept')) {
          this.$store
            .commit('setAssetDepartment', localStorage.getItem('assetSelectDept'))
          return this.$store.state.assetDepartment
        } else {
          return this.$store.state.assetDepartment
        }
      },
      set (value) {
        if (value) {
          localStorage
            .setItem('assetSelectDept', value)
          this.$store
            .commit('setAssetDepartment', value)
        }
        this.getAssets()
      }
    },
    departments () {
      if (this.iAmClaims && this.iAmClaims.admin) {
        return [
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
            name: 'Housekeeping',
            value: 'evs'
          },
          {
            name: 'Information Technology',
            value: 'it'
          }
        ]
      } else if (this.iAmClaims && this.iAmClaims.managerMaint) {
        return [
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
      } else if (this.iAmClaims && this.iAmClaims.managerEVS) {
        return [
          {
            name: 'Environmental Services',
            value: 'evs'
          },
          {
            name: 'Transportation',
            value: 'transportation'
          }
        ]
      } else {
        return []
      }
    },
    disabled () {
      const disabled = (this.iAmClaims && !this.iAmClaims.admin && !this.iAmClaims.managerMaint) ? true : false
      return disabled
    },
    iAmClaims () { return this.$store.state.claims }
  },
  watch: {
    scanDialog (value) {
      if (value) {
        this.$nextTick(() => {
          this.$refs.scannerText
            .focus()
        })
      }
    }
  },
  mounted () {
    this.$bus
      .$on('closePmTransfer', () => {
        this.transferDialog = false
      })
    setTimeout(() => {
      if (this.$store.state.assets.length === 0) {
        this.getAssets()
      }
      if (this.$store.state.templates.length === 0) {
        this.getTemplates()
      }
    }, 500)
  },
  methods: {
    alphaSort (letter) {
      if (typeof this.active !== 'boolean') { this.active = true }
      this.$store
        .dispatch('getAssets', this.active)
        .then(() => this.$store
          .dispatch('sortAssets', { letter })
        )
        .catch((error) => {
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    convertBarcode (value) {
      this.searchName = value.replace(/\\/g, '')
      setTimeout(() => {
        this.scannerText = ''
        this.scanDialog = false
        this.search()
      }, 150)
    },
    getAssets () {
      if (!this.department) { return setTimeout(() => { this.getAssets() }, 250) }
      if (typeof this.active !== 'boolean') { this.active = true }
      this.$store
        .dispatch('getAssets', this.active)
        .catch((error) => {
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    getTemplates () {
      if (!this.department) { return setTimeout(() => { this.getTemplates() }, 150) }
      this.$store
        .dispatch('getTemplates')
        .catch((error) => {
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    refresh () {
      // Return back to all assets
      this.searchName = null
      this.letter = null
      this.getAssets()
    },
    search () {
      if (!this.searchName) {
        this.refresh()
      } else {
        if (typeof this.active !== 'boolean') { this.active = true }
        this.$store
          .dispatch('searchAssets', {
            active: this.active,
            searchName: this.searchName
          })
          .catch((error) => {
            this.$store
              .dispatch('updateLocalErrors', error)
          })
      }
    },
    searchByDescription () {
      if (!this.searchDescription) {
        this.refresh()
      } else {
        if (typeof this.active !== 'boolean') { this.active = true }
        this.$store
          .dispatch('searchAssets', {
            active: this.active,
            searchDescription: this.searchDescription
          })
          .catch((error) => {
            this.$store
              .dispatch('updateLocalErrors', error)
          })
      }
    },
    toggleActive () {
      if (this.active) {
        this.active = false
      } else {
        this.active = true
      }
      this.getAssets()
    }
  }
}
</script>
