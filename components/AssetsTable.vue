<!--
All Assets Table
-->
<template>
  <div>
    <v-expand-transition>
      <v-card-text
        v-if="selected.length > 0"
      >
        <v-autocomplete
          v-model="template"
          :items="templates"
          item-text="task"
          item-value="id"
          :outlined="$vuetify.breakpoint.mdAndUp"
          label="Assign PM Template"
          placeholder="Assign PM Template"
          @change="getTemplate"
        />
        <v-btn
          v-if="template !== null"
          color="secondary"
          depressed
          @click="viewTemplate = true"
        >
          View Template
        </v-btn>
        <v-btn
          v-if="template !== null"
          color="primary"
          depressed
          :loading="assignLoading"
          @click="assignTemplate"
        >
          Assign To Selected
        </v-btn>
      </v-card-text>
    </v-expand-transition>
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
      item-key="assetId"
      :items="assets"
      :items-per-page.sync="itemsPerPage"
      :loading="assetLoading"
      :must-sort="true"
      no-data-text="No Data Currently Available"
      :height="calcHeight"
      :show-select="showSelect"
    >
      <template
        v-slot:item.tag="{ item }"
      >
        <a
          @click="$router.push(`assets/${item.assetId}`)"
        >
          {{ item.tag }}
        </a>
      </template>
      <template
        v-slot:item.description="{ item }"
      >
        {{ item.description }}
      </template>
      <template
        v-slot:item.location="{ item }"
      >
        {{ item.location }}
      </template>
      <template
        v-slot:item.pm="{ item }"
      >
        <span
          v-if="item.pm"
          class="info--text"
        >
          Yes
        </span>
        <span
          v-else
          class="red--text"
        >
          No
        </span>
        <!--
        <v-icon
          v-if="!item.pm"
          class="red--text text--accent-3"
          :size="15"
        >
          mdi-alert-outline
        </v-icon>
        <v-icon
          v-else
          class="info--text"
          :size="15"
        >
          mdi-check-circle
        </v-icon>
        -->
      </template>
      <template
        v-slot:item.assignedTo="{ item }"
      >
        {{ item.assignedTo }}
      </template>
    </v-data-table>
    <v-dialog
      v-model="viewTemplate"
      max-width="500px"
    >
      <v-card>
        <v-card-title
          class="primary white--text title"
        >
          {{ selectedTemplate.task }}
        </v-card-title>
        <v-card-text
          class="py-5"
        >
          Assigned To:
          <span
            v-if="selectedTemplate && selectedTemplate.assignedTo"
          >
            {{ selectedTemplate.assignedTo.displayName }}
          </span>
          <br>
          Start Date: {{ selectedTemplate.start }}
          <br>
          Frequency: {{ selectedTemplate.freq }}
          <br>
          <div
            v-if="selectedTemplate.steps && selectedTemplate.steps.length > 0"
          >
            Steps:
            <br>
            <v-row
              v-for="(field, key) in selectedTemplate.steps"
              :key="key"
            >
              <v-col
                cols="12"
              >
                <v-text-field
                  v-if="field.type === 'textField'"
                  :name="field.name"
                  :label="field.label"
                  :placeholder="field.label"
                  :outlined="$vuetify.breakpoint.mdAndUp"
                  disabled
                />
                <v-textarea
                  v-else-if="field.type === 'textArea'"
                  :name="field.name"
                  :label="field.label"
                  :placeholder="field.label"
                  :outlined="$vuetify.breakpoint.mdAndUp"
                  disabled
                />
                <div
                  v-else-if="field.type === 'checkbox'"
                >
                  <span
                    class="pb-2 subheading grey--text text--lighten-1"
                  >
                    {{ field.label }}
                  </span>
                  <div
                    v-for="(value, i) in field.options"
                    :key="i"
                  >
                    <v-checkbox
                      color="primary"
                      :name="field.name"
                      :label="value.label"
                      :input-value="value.input"
                      readonly
                    />
                  </div>
                </div>
                <div
                  v-else-if="field.type === 'radio'"
                >
                  <span
                    class="pb-2 subheading grey--text text--lighten-1"
                  >
                    {{ field.label }}
                  </span>
                  <v-radio-group
                    :name="field.name"
                  >
                    <div
                      v-for="(value, i) in field.options"
                      :key="i"
                    >
                      <v-radio
                        color="primary"
                        :label="value.label"
                        :input-value="value.input"
                        :name="field.name"
                        disabled
                      />
                    </div>
                  </v-radio-group>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-btn
            color="secondary"
            text
            @click="viewTemplate = false"
          >
            close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="dialog"
      max-width="500px"
    >
      <v-card>
        <v-card-text
          class="py-5"
        >
          Assets have been assigned the template.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            depressed
            @click="dialog = false"
          >
            Okay
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  // By default select icons are hidden for performance reasons, the parent has a select box that controls this
  props: {
    showSelect: {
      type: Boolean,
      default: () => {
        return false
      }
    }
  },
  data () {
    return {
      assignLoading: false,
      bulk: null,
      dialog: false,
      headers: [
        {
          text: 'Asset Tag',
          value: 'tag'
        },
        {
          text: 'Description',
          value: 'description'
        },
        {
          text: 'Location',
          value: 'location'
        },
        {
          text: 'PM Scheduled',
          value: 'pm'
        },
        {
          text: 'Assigned To',
          value: 'assignedTo'
        }
      ],
      selected: [],
      selectedTemplate: {},
      template: null,
      viewTemplate: false
    }
  },
  computed: {
    assets () { return this.$store.state.assets },
    assetLoading () { return this.$store.state.assetLoading },
    // Users who are allowed to bulk select
    bulkAllowed () {
      if (this.$store.state.claims.admin || this.$store.state.claims.managerMaint) {
        return true
      } else {
        return false
      }
    },
    // Height of the table dependent on size of device screen
    calcHeight () {
      return (this.$vuetify.breakpoint.smAndUp) ? 'calc(100vh - 400px)' : '1000px'
    },
    // Sync table items per page with localStorage
    itemsPerPage: {
      get () {
        const items = (localStorage.getItem('assetsItemsPerPage')) ? parseInt(localStorage.getItem('assetsItemsPerPage')) : 25
        return items
      },
      set (val) {
        localStorage.setItem('assetsItemsPerPage', val)
        return val
      }
    },
    templates () { return this.$store.state.templates },
    workers () { return this.$store.state.assetWorkers }
  },
  mounted () {
    this.getAssetWorkers()
  },
  beforeDestroy () {
    // Empty data in store for performance
    this.$store
      .dispatch('destroyAssets')
  },
  methods: {
    assignTemplate () {
      this.assignLoading = true
      // Iterate through selected and assign template to the assets selected
      const assign = () => {
        (async () => {
          for (let i = 0; i < this.selected.length; i++) {
            await this.setAssetTemplate(this.selected[i])
              .catch((error) => {
                this.assignLoading = false
                this.$store
                  .dispatch('updateLocalErrors', error)
              })
            if (i === this.selected.length - 1) {
              this.assignLoading = false
              this.selected = []
              this.selectedTemplate = []
              this.dialog = true
            }
          }
        })()
      }
      assign()
    },
    // Bulk reassign PMs from one user to another
    bulkReassign () {
      this.$store
        .commit('setAssetLoading', true)
      this.selected
        .forEach((selected) => {
          selected.id = selected.assetId
        })
      this.$store
        .dispatch('bulkReassign', {
          db: 'assets',
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
    // Get asset and add template to its pms
    getAssetToAssign (asset) {
      return new Promise((resolve, reject) => {
        this.$db
          .collection('assets')
          .doc(asset.assetId)
          .get()
          .then((doc) => {
            const arr = doc.data()
            if (arr.pms && Array.isArray(arr.pms)) {
              arr.pms
                .push(this.selectedTemplate)
            } else {
              arr.pms = [this.selectedTemplate]
            }
            resolve(arr)
          })
          .catch((error) => reject(error))
      })
    },
    // Get a template
    getTemplate () {
      this.$db
        .collection('templates')
        .doc(this.template)
        .get()
        .then((doc) => {
          this.selectedTemplate = doc.data()
        })
        .catch((error) => {
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    // Get all the workers
    getAssetWorkers () {
      if (!this.$firebase.auth().currentUser) {
        return setTimeout(() => { this.getAssetWorkers() }, 150)
      } else if (this.$store.state.assetWorkers.length === 0) {
        this.$store
          .dispatch('getAssetWorkers', this.$firebase.auth().currentUser.uid)
          .catch((error) => {
            this.$store
              .dispatch('updateLocalErrors', error)
          })
      }
    },
    // Update asset doc with new pms array
    setAssetTemplate (asset) {
      return new Promise((resolve, reject) => {
        this.getAssetToAssign(asset)
          .then((response) => this.$db
            .collection('assets')
            .doc(asset.assetId)
            .update({
              pms: response.pms
            })
          )
          .then((response) => resolve(response))
          .catch((error) => reject(error))
      })
    }
  }
}
</script>
