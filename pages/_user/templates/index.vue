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
      <v-col>
        <v-card>
          <v-card-title>
            Asset PM Template Manager
            <v-spacer />
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
                    color="primary"
                    v-on="on"
                    @click="templateDialog = true"
                  >
                    <v-icon>
                      mdi-text-box-plus
                    </v-icon>
                  </v-btn>
                </template>
                <span>
                  New Template
                </span>
              </v-tooltip>
            </div>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col>
                <v-autocomplete
                  v-model="department"
                  :items="departments"
                  item-text="name"
                  item-value="value"
                  label="Template Department"
                  placeholder="Template Department"
                  outlined
                />
              </v-col>
              <v-col>
                <v-autocomplete
                  v-model="temp"
                  :items="templates"
                  item-text="task"
                  item-value="id"
                  label="Template"
                  placeholder="Template"
                  outlined
                />
              </v-col>
            </v-row>
          </v-card-text>
          <div
            v-if="assets.length > 0"
          >
            <v-divider />
            <v-card-text>
              <v-card
                outlined
              >
                <v-card-title>
                  Assets this Template is Assigned To
                </v-card-title>
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
                  :height="300"
                  :items="assets"
                  :show-select="showSelect"
                  :must-sort="true"
                  :loading="loading"
                  item-key="key"
                  no-data-text="No Data Currently Available"
                >
                  <template
                    v-slot:item.tag="{ item }"
                  >
                    <a
                      @click="$router.push(`assets/${item.id}`)"
                    >
                      {{ item.tag[0] }}
                    </a>
                  </template>
                  <template
                    v-slot:item.id="{ item }"
                  >
                    <v-btn
                      x-small
                      color="warning"
                      class="black--text"
                      rounded
                      depressed
                      @click="showDetach(item.id)"
                    >
                      Detach
                    </v-btn>
                    <v-btn
                      x-small
                      color="error"
                      rounded
                      depressed
                      @click="showDelete(item.id)"
                    >
                      Delete
                    </v-btn>
                  </template>
                </v-data-table>
              </v-card>
            </v-card-text>
          </div>
          <v-divider />
          <v-card-title
            v-if="Object.keys(pm).length > 0"
          >
            PM Template
          </v-card-title>
          <v-card-text
            v-if="Object.keys(pm).length > 0"
          >
            <v-row>
              <!-- task -->
              <v-col
                cols="12"
                class="caption"
              >
                {{ pm.task }}
                <br>
                DBID: {{ pm.template }}
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="pm.task"
                  label="PM Name"
                  placeholder="PM Name"
                  outlined
                  :error-messages="taskErrors"
                />
              </v-col>
              <!-- freq -->
              <v-col
                cols="12"
                sm="6"
                :class="{
                  'pr-2': $vuetify.breakpoint.smAndUp
                }"
              >
                <v-dialog
                  v-model="pm.dateDialog"
                  width="290px"
                >
                  <template
                    v-slot:activator="{ on }"
                  >
                    <v-text-field
                      v-model="pm.start"
                      label="PM Start Date"
                      placeholder="PM Start Date"
                      outlined
                      :error-messages="startErrors"
                      readonly
                      v-on="on"
                    />
                  </template>
                  <v-date-picker
                    v-model="pm.start"
                    name="pmStartDate"
                    color="primary"
                    class="elevation-0"
                    @input="closeDate"
                  />
                </v-dialog>
              </v-col>
              <v-col
                cols="12"
                sm="6"
                :class="{
                  'pr-2': $vuetify.breakpoint.smAndUp
                }"
              >
                <v-select
                  v-model="pm.freq"
                  :items="pmFreqList"
                  item-text="text"
                  item-value="value"
                  outlined
                  :error-messages="freqErrors"
                  label="PM Frequency"
                  placeholder="PM Frequency"
                />
              </v-col>
              <!-- assignedTo -->
              <v-col
                cols="12"
                sm="6"
                :class="{
                  'pr-2': $vuetify.breakpoint.smAndUp
                }"
              >
                <v-select
                  v-model="pm.assignedTo"
                  :items="workers"
                  item-text="text"
                  item-value="value"
                  name="assignedTo"
                  :error-messages="assignedToErrors"
                  outlined
                  label="Assigned To"
                  placeholder="Assigned To"
                />
              </v-col>
              <!-- steps -->
              <v-col
                cols="12"
                class="caption"
                :class="{
                  'px-2': $vuetify.breakpoint.smAndUp
                }"
              >
                Add, Edit, or Delete Custom Steps for {{ pm.task }}
              </v-col>
              <v-col
                cols="12"
                class="pt-3"
              >
                <div
                  v-if="pm.steps && pm.steps.length > 0"
                >
                  <v-row
                    v-for="(field, key) in pm.steps"
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
                        outlined
                        append-icon="mdi-pencil"
                        readonly
                        @click:append="showEdit(field)"
                      />
                      <v-textarea
                        v-else-if="field.type === 'textArea'"
                        :name="field.name"
                        :label="field.label"
                        :placeholder="field.label"
                        outlined
                        append-icon="mdi-pencil"
                        readonly
                        @click:append="showEdit(field)"
                      />
                      <div
                        v-else-if="field.type === 'checkbox'"
                      >
                        <span
                          class="pb-2 subheading grey--text text--lighten-1"
                        >
                          {{ field.label }}
                        </span>
                        <v-icon
                          @click="showEdit(field)"
                        >
                          mdi-pencil
                        </v-icon>
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
                        <v-icon
                          @click="showEdit(field)"
                        >
                          mdi-pencil
                        </v-icon>
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
                      <v-dialog
                        v-model="field.show"
                        persistent
                        transition="dialog-bottom-transition"
                      >
                        <v-card>
                          <v-card-title
                            primary-title
                          >
                            PM Step
                          </v-card-title>
                          <v-divider />
                          <v-card-text
                            class="py-4"
                          >
                            <v-row>
                              <v-col
                                cols="12"
                                sm="12"
                                md="4"
                                :class="{
                                  'py-2 pr-2': $vuetify.breakpoint.mdAndUp,
                                  'py-2': $vuetify.breakpoint.smAndDown
                                }"
                              >
                                <v-select
                                  v-model="field.type"
                                  :items="types"
                                  label="Field Type"
                                  placeholder="Field Type"
                                  outlined
                                  persistent-hint
                                  hint="The input type for the field."
                                  @input="changeType"
                                />
                              </v-col>
                              <v-col
                                cols="12"
                                sm="12"
                                md="4"
                                :class="{
                                  'py-2 pl-2 pr-2': $vuetify.breakpoint.mdAndUp,
                                  'py-2': $vuetify.breakpoint.smAndDown
                                }"
                              >
                                <v-text-field
                                  v-model="field.name"
                                  label="Field Name"
                                  placeholder="Field Name"
                                  persistent-hint
                                  outlined
                                  hint="Name of the field to be used in the database."
                                />
                              </v-col>
                              <v-col
                                cols="12"
                                sm="12"
                                md="4"
                                :class="{
                                  'py-2 pl-2': $vuetify.breakpoint.mdAndUp,
                                  'py-2': $vuetify.breakpoint.smAndDown
                                }"
                              >
                                <v-text-field
                                  v-model="field.label"
                                  label="Field Label"
                                  placeholder="Field Label"
                                  persistent-hint
                                  outlined
                                  hint="The visible name that goes above the field."
                                />
                              </v-col>
                              <v-col
                                v-if="field.type === 'checkbox' || field.type === 'radio'"
                              >
                                <v-row
                                  v-for="(value, i) in field.options"
                                  :key="i"
                                >
                                  <v-col
                                    cols="12"
                                    sm="12"
                                    md="5"
                                    :class="{
                                      'py-2 pr-2': $vuetify.breakpoint.mdAndUp,
                                      'py-2': $vuetify.breakpoint.smAndDown
                                    }"
                                  >
                                    <v-text-field
                                      v-model="value.label"
                                      label="Input Label"
                                      placeholder="Input Label"
                                      persistent-hint
                                      outlined
                                      hint="The visible label for this option."
                                    />
                                  </v-col>
                                  <v-col
                                    cols="12"
                                    sm="12"
                                    md="5"
                                    :class="{
                                      'py-2 pl-2': $vuetify.breakpoint.mdAndUp,
                                      'py-2': $vuetify.breakpoint.smAndDown
                                    }"
                                  >
                                    <v-text-field
                                      v-model="value.input"
                                      label="Input Value"
                                      placeholder="Input Value"
                                      persistent-hint
                                      :outlined="$vuetify.breakpoint.mdAndUp"
                                      hint="The value this option will have if clicked."
                                    />
                                  </v-col>
                                  <v-col
                                    cols="12"
                                    sm="12"
                                    md="2"
                                    :class="{
                                      'py-2 pl-2': $vuetify.breakpoint.mdAndUp,
                                      'py-2': $vuetify.breakpoint.smAndDown
                                    }"
                                  >
                                    <v-btn
                                      fab
                                      text
                                      color="error"
                                      @click="removeOption(field, i)"
                                    >
                                      <v-icon>
                                        mdi-close
                                      </v-icon>
                                    </v-btn>
                                  </v-col>
                                </v-row>
                                <v-row>
                                  <v-col
                                    cols="12"
                                    class="py-2"
                                  >
                                    <v-btn
                                      color="primary"
                                      depressed
                                      small
                                      class="ml-0"
                                      @click="addOption(field)"
                                    >
                                      <v-icon
                                        :size="15"
                                      >
                                        mdi-shape-square-plus
                                      </v-icon>
                                      &ensp;option
                                    </v-btn>
                                  </v-col>
                                </v-row>
                              </v-col>
                            </v-row>
                          </v-card-text>
                          <v-card-actions>
                            <v-btn
                              color="error"
                              text
                              @click="deleteThis(key)"
                            >
                              Delete
                            </v-btn>
                            <v-spacer />
                            <div
                              v-if="field.error"
                            >
                              <v-icon
                                class="error--text"
                              >
                                mdi-alert-circle
                              </v-icon>
                              <span
                                class="error--text"
                              >
                                {{ field.warning }}
                              </span>
                            </div>
                            &ensp;
                            <v-btn
                              depressed
                              color="primary"
                              @click="stepSave(field)"
                            >
                              Okay
                            </v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-dialog>
                    </v-col>
                  </v-row>
                </div>
                <v-row
                  v-else
                >
                  <v-col
                    cols="12"
                    class="caption"
                  >
                    No Steps Set
                  </v-col>
                </v-row>
                <v-row>
                  <v-col
                    cols="12"
                    class="caption"
                  >
                    Add Step
                    <v-btn
                      icon
                      color="primary"
                      @click="addStep"
                    >
                      <v-icon>
                        mdi-text-box-plus-outline
                      </v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col
                    :cols="12"
                  >
                    <v-textarea
                      v-model="pm.pmNotes"
                      :rows="4"
                      placeholder="PM Notes"
                      label="PM Notes"
                      outlined
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card-text>
          <v-divider />
          <v-card-actions
            v-if="Object.keys(pm).length > 0"
          >
            <v-btn
              v-if="iAmClaims.admin || iAmClaims.managerMaint"
              color="error"
              text
              :loading="loading"
              @click="fullDeleteShowDialog(pm.template)"
            >
              Full Delete
            </v-btn>
            <v-btn
              color="secondary"
              text
              :loading="loading"
              @click="getTemplate(pm.template)"
            >
              Reset
            </v-btn>
            <v-btn
              text
              color="info"
              :loading="loading"
              @click="saveAsNew"
            >
              Save As New Template
            </v-btn>
            <v-spacer />
            <v-btn
              depressed
              color="primary"
              :loading="loading"
              @click="saveDialog = true"
            >
              Save
              &nbsp;
              <span
                v-if="assets.length > 0"
              >
                and Update Template's Assets' PMs
              </span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog
      v-model="detachDialog"
      max-width="450"
      persistent
    >
      <v-card>
        <v-card-title
          class="pb-4"
        >
          Detach Template From Asset?
        </v-card-title>
        <v-card-subtitle>
          Are you sure you want to detach this Template from this Asset? This will remove the Template identifier from this Asset, but will keep the PM in the Asset.
        </v-card-subtitle>
        <v-divider />
        <v-card-actions>
          <v-btn
            color="secondary"
            text
            @click="detachDialog = false"
          >
            Cancel
          </v-btn>
          <v-spacer />
          <v-btn
            color="warning"
            class="black--text"
            :loading="loading"
            @click="detachTemplate(detachId)"
          >
            Detach
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="fullDeleteDialog"
      max-width="450"
      persistent
    >
      <v-card>
        <v-card-title
          class="pb-4"
        >
          Completely Delete This Template?
        </v-card-title>
        <v-card-subtitle>
          Are you sure you want to completely delete this Template? This will remove the Template identifier from all Assets, and will also delete all PMs in Assets related to this template!
        </v-card-subtitle>
        <v-divider />
        <v-card-actions>
          <v-btn
            color="secondary"
            text
            @click="fullDeleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-spacer />
          <v-btn
            color="error"
            :loading="loading"
            @click="fullDelete"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="deleteDialog"
      max-width="450"
      persistent
    >
      <v-card>
        <v-card-title
          class="pb-4"
        >
          Delete Template From Asset?
        </v-card-title>
        <v-card-subtitle>
          Are you sure you want to delete this Template from this Asset? This will remove the Template identifier from this Asset, and will also delete the PM in this Asset.
        </v-card-subtitle>
        <v-divider />
        <v-card-actions>
          <v-btn
            color="secondary"
            text
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-spacer />
          <v-btn
            color="error"
            :loading="loading"
            @click="deleteTemplate(deleteId)"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="saveDialog"
      max-width="450"
      persistent
    >
      <v-card>
        <v-card-title
          class="pb-4"
        >
          Save Template?
        </v-card-title>
        <v-card-subtitle
          v-if="assets.length > 0"
        >
          <b>
            Choose Which Fields to Update
          </b>
          <br>
          This will update all Assets' PMs tied to this Template. Please check which fields you want updated in all of this Template's Assets' PMs.
        </v-card-subtitle>
        <v-divider />
        <v-card-text
          v-if="assets.length > 0"
        >
          <v-checkbox
            v-model="select.name"
            label="PM Name"
            color="primary"
          />
          <v-checkbox
            v-model="select.startDate"
            label="PM Start Date"
            color="primary"
          />
          <v-checkbox
            v-model="select.frequency"
            label="PM Frequency"
            color="primary"
          />
          <v-checkbox
            v-model="select.assignedTo"
            label="PM Assigned To"
            color="primary"
          />
          <v-checkbox
            v-model="select.pmNotes"
            label="PM Notes"
            color="primary"
          />
          <v-checkbox
            v-model="select.steps"
            label="PM Steps"
            color="primary"
            disabled
            persistent-hint
            hint="This cannot be unchecked"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-btn
            color="secondary"
            text
            @click="saveDialog = false"
          >
            Cancel
          </v-btn>
          <v-spacer />
          <v-btn
            color="primary"
            :loading="loading"
            @click="saveTemplate"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <PMTemplate
      :template-dialog="templateDialog"
    />
  </v-container>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'

export default {
  components: {
    PMTemplate: () => import('@/components/PMTemplate.vue')
  },
  mixins: [validationMixin],
  validations: {
    pm: {
      assignedTo: { required },
      freq: { required },
      start: { required },
      task: { required }
    }
  },
  data () {
    return {
      assets: [],
      deleteDialog: false,
      detachDialog: false,
      deleteId: null,
      detachId: null,
      fullDeleteDialog: false,
      fullDeleteId: null,
      headers: [
        {
          text: 'Tag',
          value: 'tag'
        },
        {
          text: 'Description',
          value: 'description'
        },
        {
          text: 'Asset Type',
          value: 'assetType'
        },
        {
          text: 'Detach/Delete Template From Asset',
          value: 'id'
        }
      ],
      loading: false,
      pm: {},
      pmFreqList: [
        {
          text: 'Daily',
          value: 'daily'
        },
        {
          text: 'Weekly',
          value: 'weekly'
        },
        {
          text: 'Every Two Weeks',
          value: 'biMonthly'
        },
        {
          text: 'Monthly',
          value: 'monthly'
        },
        {
          text: 'Quarterly',
          value: 'quarterly'
        },
        {
          text: 'Every Six Months',
          value: 'biAnnually'
        },
        {
          text: 'Annually',
          value: 'annually'
        },
        {
          text: 'Every Two Years',
          value: 'twoYears'
        },
        {
          text: 'Every Two Years',
          value: 'twoYears'
        },
        {
          text: 'Every Three Years',
          value: 'threeYears'
        },
        {
          text: 'Every Four Years',
          value: 'fourYears'
        }
      ],
      saveDialog: false,
      select: {
        assignedTo: false,
        frequency: false,
        name: false,
        pmNotes: false,
        startDate: false,
        steps: true
      },
      selected: [],
      showSelect: false,
      templateDialog: false,
      types: [
        'textField',
        'textArea',
        'checkbox',
        'radio'
      ]
    }
  },
  computed: {
    assignedToErrors () {
      const errors = []
      if (!this.$v.pm.assignedTo.$dirty) { return errors }
      !this.$v.pm.assignedTo.required && errors.push('Assigned To is required.')
      return errors
    },
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
          this.getTemplates()
        }
      }
    },
    departments () {
      const arr = []
      if (this.iAmClaims) {
        Object
          .keys(this.iAmClaims)
          .forEach((k) => {
            switch (k) {
              case 'admin':
                if (this.iAmClaims[k]) {
                  arr
                    .push(
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
                    )
                }
                break
              case 'managerMaint':
                if (this.iAmClaims[k]) {
                  arr
                    .push(
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
                    )
                }
                break
              case 'managerEVS':
                if (this.iAmClaims[k]) {
                  arr
                    .push(
                      {
                        name: 'Environmental Services',
                        value: 'evs'
                      },
                      {
                        name: 'Transportation',
                        value: 'transportation'
                      }
                    )
                }
                break
              case 'bioMed':
                if (this.iAmClaims[k]) {
                  arr
                    .push(
                      {
                        name: 'Biomed',
                        value: 'bioMed'
                      }
                    )
                }
                break
              case 'facilities':
                if (this.iAmClaims[k]) {
                  arr
                    .push(
                      {
                        name: 'Facilities',
                        value: 'facilities'
                      }
                    )
                }
                break
              case 'grounds':
                if (this.iAmClaims[k]) {
                  arr
                    .push(
                      {
                        name: 'Grounds',
                        value: 'grounds'
                      }
                    )
                }
                break
              case 'evs':
                if (this.iAmClaims[k]) {
                  arr
                    .push(
                      {
                        name: 'Environmental Services',
                        value: 'evs'
                      }
                    )
                }
                break
              case 'transportation':
                if (this.iAmClaims[k]) {
                  arr
                    .push(
                      {
                        name: 'Transportation',
                        value: 'transportation'
                      }
                    )
                }
                break
              default:
                break
            }
          })
      }
      return arr
    },
    freqErrors () {
      const errors = []
      if (!this.$v.pm.freq.$dirty) { return errors }
      !this.$v.pm.freq.required && errors.push('Frequency is required.')
      return errors
    },
    iAmClaims () { return this.$store.state.claims },
    startErrors () {
      const errors = []
      if (!this.$v.pm.start.$dirty) { return errors }
      !this.$v.pm.start.required && errors.push('Date is required.')
      return errors
    },
    taskErrors () {
      const errors = []
      if (!this.$v.pm.task.$dirty) { return errors }
      !this.$v.pm.task.required && errors.push('Task is required.')
      return errors
    },
    temp: {
      get () {
        if (this.pm.template) {
          return {
            id: this.pm.template,
            task: this.pm.task
          }
        } else {
          return null
        }
      },
      set (val) {
        if (val) {
          this.getTemplate(val)
        }
      }
    },
    templates () { return this.$store.state.templates },
    workers () { return this.$store.state.assetWorkers }
  },
  mounted () {
    this.getTemplates()
    this.getWorkers()
    this.$bus
      .$on('closeDialog', () => {
        this.templateDialog = false
      })
  },
  methods: {
    addOption (field) {
      if (!field.options || !Array.isArray(field.options)) { field.options = [] }
      field.options
        .push({
          label: 'Option Label',
          input: 'Option Value'
        })
      this.$forceUpdate()
    },
    addStep () {
      // Push initial value for new custom field and force Vue to update
      if (!this.pm.steps || !Array.isArray(this.pm.steps)) {
        this.pm.steps = []
      }
      this.pm.steps
        .push({
          name: 'newStep',
          label: 'New Step',
          type: 'textField'
        })
      this.$forceUpdate()
    },
    changeType (value) {
      this.$forceUpdate()
    },
    closeDate () {
      this.pm.dateDialog = false
      this.$forceUpdate()
    },
    deleteThis (key) {
      this.pm.steps[key].show = false
      this.pm.steps
        .splice(key, 1)
      this.$forceUpdate()
    },
    deleteTemplate (id) {
      this.loading = true
      this.$db
        .collection('assets')
        .doc(id)
        .get()
        .then((doc) => this.processDelete(doc))
        .then((query) => this.$db
          .collection('assets')
          .doc(id)
          .update(query)
        )
        .then((response) => {
          this.deleteDialog = false
          this.getTemplate(this.pm.template)
        })
        .catch((error) => {
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    deleteTemplatePromise (id) {
      return new Promise((resolve, reject) => {
        this.$db
          .collection('assets')
          .doc(id)
          .get()
          .then((doc) => this.processDelete(doc))
          .then((query) => this.$db
            .collection('assets')
            .doc(id)
            .update(query)
          )
          .then((response) => {
            resolve({ message: 'Deleted.' })
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    detachTemplate (id) {
      this.loading = true
      this.$db
        .collection('assets')
        .doc(id)
        .get()
        .then((doc) => this.processDetach(doc))
        .then((query) => this.$db
          .collection('assets')
          .doc(id)
          .update(query)
        )
        .then((response) => {
          this.detachDialog = false
          this.getTemplate(this.pm.template)
        })
        .catch((error) => {
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    fullDeleteShowDialog (id) {
      this.fullDeleteId = id
      this.fullDeleteDialog = true
    },
    fullDelete () {
      this.removeAllTemplates(this.assets)
        .then(() => this.$db
          .collection('templates')
          .doc(this.fullDeleteId)
          .delete()
        )
        .then((response) => {
          setTimeout(() => {
            this.loading = false
            this.fullDeleteDialog = false
            this.getTemplates()
            this.pm = {}
            this.assets = []
          }, 500)
        })
        .catch((error) => {
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    getTemplate (id) {
      this.$db
        .collection('templates')
        .doc(id)
        .get()
        .then((doc) => this.setTemplate(doc))
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
    getWorkers () {
      if (!this.$firebase.auth().currentUser) {
        return setTimeout(() => { this.getWorkers() }, 150)
      } else if (this.$store.state.assetWorkers.length === 0) {
        this.$store
          .dispatch('getAssetWorkers', this.$firebase.auth().currentUser.uid)
          .catch((error) => {
            this.$store
              .dispatch('updateLocalErrors', error)
          })
      }
    },
    processDelete (doc) {
      return new Promise((resolve, reject) => {
        try {
          const templateIndex = (doc.data().templateIndex) ? doc.data().templateIndex : []
          let i = templateIndex.length
          while (i--) {
            if (templateIndex[i] === this.pm.template) {
              templateIndex
                .splice(i, 1)
            }
          }
          const pms = (doc.data().pms) ? doc.data().pms : []
          i = pms.length
          while (i--) {
            if (pms[i].template === this.pm.template) {
              pms
                .splice(i, 1)
            }
          }
          resolve({ pms, templateIndex })
        } catch (e) {
          reject(e)
        }
      })
    },
    processDetach (doc) {
      return new Promise((resolve, reject) => {
        try {
          const templateIndex = (doc.data().templateIndex) ? doc.data().templateIndex : []
          let i = templateIndex.length
          while (i--) {
            if (templateIndex[i] === this.pm.template) {
              templateIndex
                .splice(i, 1)
            }
          }
          const pms = (doc.data().pms) ? doc.data().pms : []
          for (let i = 0; i < pms.length; i++) {
            if (pms[i].template === this.pm.template) {
              pms[i].template = null
            }
          }
          resolve({ pms, templateIndex })
        } catch (e) {
          reject(e)
        }
      })
    },
    removeAllTemplates (assets) {
      return new Promise((resolve, reject) => {
        if (assets.length > 0) {
          (async () => {
            for (let i = 0; i < assets.length; i++) {
              await this.deleteTemplatePromise(assets[i].id)
                .catch((error) => reject(error))
            }
            resolve({ message: 'Deleted all.' })
          })()
        } else {
          resolve({ message: 'No Assets to Update.' })
        }
      })
    },
    removeOption (field, i) {
      field.options
        .splice(i, 1)
      this.$forceUpdate()
    },
    saveAsNew () {
      this.loading = true
      this.$db
        .collection('templates')
        .add(this.pm)
        .then((docRef) => {
          setTimeout(() => {
            this.getTemplates()
            this.temp = docRef.id
          }, 500)
        })
        .catch((error) => {
          this.loading = false
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    processSaved (query) {
      return new Promise((resolve, reject) => {
        if (this.assets.length > 0) {
          // Save template in assets
          (async () => {
            for (let i = 0; i < this.assets.length; i++) {
              await this.saveInAssets(query, this.assets[i].id)
                .catch((error) => reject(error))
            }
            resolve({ message: 'Saved.' })
          })()
        } else {
          resolve({ message: 'No Assets to update.' })
        }
      })
    },
    processSaveInAsset (query, doc) {
      return new Promise((resolve, reject) => {
        if (doc.data().pms && doc.data().pms.length > 0) {
          const pms = doc.data().pms
          for (let i = 0; i < pms.length; i++) {
            if (pms[i].template === query.template) {
              Object
                .keys(query)
                .forEach((k) => {
                  pms[i][k] = query[k]
                })
            }
          }
          this.$db
            .collection('assets')
            .doc(doc.id)
            .update({ pms })
            .then((response) => resolve(response))
            .catch((error) => reject(error))
        } else {
          resolve({ message: 'Nothing to update.' })
        }
      })
    },
    saveInAssets (query, id) {
      return new Promise((resolve, reject) => {
        this.$db
          .collection('assets')
          .doc(id)
          .get()
          .then((doc) => this.processSaveInAsset(query, doc))
          .then(() => resolve({ message: 'Updated.' }))
          .catch((error) => reject(error))
      })
    },
    saveTemplate () {
      const query = {}
      this.loading = true
      if (this.assets.length > 0) {
        Object
          .keys(this.pm)
          .forEach((k) => {
            switch (k) {
              case 'assignedTo':
                if (this.select.assignedTo) { query[k] = this.pm[k] }
                break
              case 'freq':
                if (this.select.frequency) { query[k] = this.pm[k] }
                break
              case 'pmNotes':
                if (this.select.pmNotes) { query[k] = this.pm[k] }
                break
              case 'start':
                if (this.select.start) { query[k] = this.pm[k] }
                break
              case 'task':
                if (this.select.task) { query[k] = this.pm[k] }
                break
              default:
                query[k] = this.pm[k]
            }
          })
      } else {
        Object
          .keys(this.pm)
          .forEach((k) => {
            query[k] = this.pm[k]
          })
      }
      this.processSaved(query)
        .then(() => this.$db
          .collection('templates')
          .doc(this.pm.template)
          .update(this.pm)
        )
        .then(() => {
          this.loading = false
          this.saveDialog = false
        })
        .catch((error) => {
          this.loading = false
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    setTemplate (doc) {
      return new Promise((resolve, reject) => {
        this.loading = true
        this.pm = doc.data()
        this.pm.template = doc.id
        this.$db
          .collection('assets')
          .where('department', '==', this.department)
          .where('templateIndex', 'array-contains', doc.id)
          .get()
          .then((querySnapshot) => {
            this.assets = []
            for (let i = 0; i < querySnapshot.docs.length; i++) {
              const doc = querySnapshot.docs[i]
              const pms = (doc.data().pms && Array.isArray(doc.data().pms) && doc.data().pms.length > 0) ? doc.data().pms : []
              for (let n = 0; n < pms.length; n++) {
                if (pms[n].template === this.pm.template) {
                  const arr = {
                    assetType: (doc.data().assetType) ? doc.data().assetType : '',
                    description: (doc.data().description) ? doc.data().description : '',
                    key: `${i}-${n}`,
                    id: doc.id,
                    tag: (doc.data().tag) ? doc.data().tag : ''
                  }
                  Object
                    .freeze(arr)
                  this.assets
                    .push(arr)
                }
              }
            }
            Object
              .freeze(this.assets)
            this.loading = false
            resolve(true)
          })
          .catch((error) => {
            this.loading = false
            reject(error)
          })
      })
    },
    showDetach (id) {
      this.detachId = id
      this.detachDialog = true
    },
    showDelete (id) {
      this.deleteId = id
      this.deleteDialog = true
    },
    showEdit (field) {
      field.show = true
      this.$forceUpdate()
    },
    stepSave (field) {
      if (!field.type || field.type === '') {
        field.error = true
        field.warning = `You must select a Field Type!`
      } else if (!field.name || field.name === '') {
        field.error = true
        field.warning = `You must enter a Field Name!`
      } else if (!field.label || field.label === '') {
        field.error = true
        field.warning = `You must enter a Field Label!`
      } else if (field.type === 'checkbox' || field.type === 'radio') {
        if (!field.options || Object.keys(field.options).length === 0) {
          field.error = true
          field.warning = `You must have at least one option when using a ${field.type} input!`
        } else {
          field.error = false
          field.warning = ''
        }
      } else {
        field.error = false
        field.warning = ''
      }
      if (!field.error) { field.show = false }
      this.$forceUpdate()
    }
  }
}
</script>
