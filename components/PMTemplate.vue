<template>
  <v-dialog
    v-model="templateDialog"
    fullscreen
    persistent
  >
    <v-card>
      <v-card-title
        class="primary white--text title"
      >
        New PM Template
      </v-card-title>
      <v-card-text
        class="py-5"
      >
        Add a new template to be used for Asset PM's.
      </v-card-text>
      <v-card-text>
        <v-card
          outlined
        >
          <v-card-text>
            <v-row>
              <!-- task -->
              <v-col>
                <v-text-field
                  v-model="pm.task"
                  label="PM Name"
                  placeholder="PM Name"
                  :outlined="$vuetify.breakpoint.mdAndUp"
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
                      :outlined="$vuetify.breakpoint.mdAndUp"
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
                  :outlined="$vuetify.breakpoint.mdAndUp"
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
                  :outlined="$vuetify.breakpoint.mdAndUp"
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
                        :outlined="$vuetify.breakpoint.mdAndUp"
                        append-icon="mdi-pencil"
                        readonly
                        @click:append="showEdit(field)"
                      />
                      <v-textarea
                        v-else-if="field.type === 'textArea'"
                        :name="field.name"
                        :label="field.label"
                        :placeholder="field.label"
                        :outlined="$vuetify.breakpoint.mdAndUp"
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
                                  :outlined="$vuetify.breakpoint.mdAndUp"
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
                                  :outlined="$vuetify.breakpoint.mdAndUp"
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
                                  :outlined="$vuetify.breakpoint.mdAndUp"
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
                                      :outlined="$vuetify.breakpoint.mdAndUp"
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
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-text>
            <v-textarea
              v-model="pm.pmNotes"
              :rows="4"
              placeholder="PM Notes"
              label="PM Notes"
              outlined
            />
          </v-card-text>
        </v-card>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn
          depressed
          text
          color="secondary"
          @click="$bus.$emit('closeDialog')"
        >
          Cancel
        </v-btn>
        <v-spacer />
        <v-btn
          depressed
          color="primary"
          :loading="loading"
          @click="save"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'

export default {
  mixins: [validationMixin],
  props: {
    templateDialog: {
      type: Boolean,
      default: false
    }
  },
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
    department () { return this.$store.state.assetDepartment },
    freqErrors () {
      const errors = []
      if (!this.$v.pm.freq.$dirty) { return errors }
      !this.$v.pm.freq.required && errors.push('Frequency is required.')
      return errors
    },
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
    workers () { return this.$store.state.assetWorkers }
  },
  mounted () {
    this.getWorkers()
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
    removeOption (field, i) {
      field.options
        .splice(i, 1)
      this.$forceUpdate()
    },
    save () {
      this.$v
        .$touch()
      if (!this.$v.$invalid) {
        this.loading = true
        this.pm.department = this.department
        this.$db
          .collection('templates')
          .add(this.pm)
          .then((response) => {
            this.loading = false
            this.$bus
              .$emit('closeDialog')
          })
          .catch((error) => {
            this.loading = false
            this.$store
              .dispatch('updateLocalErrors', error)
          })
      }
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
