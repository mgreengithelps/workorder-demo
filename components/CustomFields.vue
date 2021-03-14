<!--
Text Fields, Text Areas, Radios, and Checkboxes from PMs
-->
<template>
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
      @click:append="edit = true"
    />
    <v-textarea
      v-else-if="field.type === 'textArea'"
      :name="field.name"
      :label="field.label"
      :placeholder="field.label"
      :outlined="$vuetify.breakpoint.mdAndUp"
      append-icon="mdi-pencil"
      readonly
      @click:append="edit = true"
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
        @click="edit = true"
      >
        mdi-pencil
      </v-icon>
      <div
        v-for="(value, key) in field.options"
        :key="key"
      >
        <v-checkbox
          color="primary"
          :name="field.name"
          :label="value.label"
          :value="value.value"
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
        @click="edit = true"
      >
        mdi-pencil
      </v-icon>
      <v-radio-group
        :name="field.name"
      >
        <div
          v-for="(value, key) in field.options"
          :key="key"
        >
          <v-radio
            color="primary"
            :label="value.label"
            :value="value.value"
            :name="field.name"
            disabled
          />
        </div>
      </v-radio-group>
    </div>
    <v-dialog
      v-model="edit"
      fullscreen
      hide-overlay
      persistent
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar
          text
          flat
        >
          <v-toolbar-title>
            Custom PM Field
          </v-toolbar-title>
          <div
            class="flex-grow-1"
          />
          <v-toolbar-items>
            <v-btn
              depressed
              color="primary"
              @click="save"
            >
              Save
            </v-btn>
            <v-btn
              color="error"
              text
              @click="confirm = true"
            >
              Delete
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-container
          fluid
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
                :error-messages="typeErrors"
                :items="types"
                label="Field Type"
                placeholder="Field Type"
                :outlined="$vuetify.breakpoint.mdAndUp"
                persistent-hint
                hint="The input type for the field."
                @input="$v.field.type.$touch()"
                @blur="$v.field.type.$touch()"
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
                :error-messages="nameErrors"
                label="Field Name"
                placeholder="Field Name"
                persistent-hint
                :outlined="$vuetify.breakpoint.mdAndUp"
                hint="Must be unique, no spaces, and please camelCase the name. Example: customName"
                @input="$v.field.name.$touch()"
                @blur="$v.field.name.$touch()"
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
                :error-messages="labelErrors"
                label="Field Label"
                placeholder="Field Label"
                persistent-hint
                :outlined="$vuetify.breakpoint.mdAndUp"
                hint="The visible name that goes above the field."
                @input="$v.field.label.$touch()"
                @blur="$v.field.label.$touch()"
              />
            </v-col>
            <v-col
              v-if="field.type === 'checkbox' || field.type === 'radio'"
            >
              <v-row
                v-for="(value, key) in field.options"
                :key="key"
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
                    v-model="value.value"
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
                    @click="removeOption(key)"
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
                    @click="field.options.push({
                      label: 'New Label',
                      value: 'New Value'
                    })"
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
        </v-container>
      </v-card>
      <v-dialog
        v-model="confirm"
        persistent
        max-width="500px"
        transition="dialog-transition"
      >
        <v-card>
          <v-card-title
            primary-title
            class="title"
          >
            <v-icon>
              mdi-caution
            </v-icon>
            Are you sure?
          </v-card-title>
          <v-card-text>
            Are you sure you want to delete this custom field? Any data related to it will be destroyed upon saving.
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="primary"
              depressed
              @click="confirm = false"
            >
              Cancel
            </v-btn>
            <div
              class="flex-grow-1"
            />
            <v-btn
              color="error"
              depressed
              @click="deleteThis"
            >
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-dialog>
  </v-col>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'

// Check if name is unique
const checkName = (param, value) => {
  let val = true
  for (let i = 0; i < param.fields.length; i++) {
    if (value === param.fields[i].name && i !== param.id) {
      val = false
      break
    }
  }
  return val
}
const uniqueName = param => value => checkName(param, value)
// Check if there are options if needed
const checkOptions = (param) => { return param.options.length > 0 }
const needsOptions = param => value => (param.type === 'checkbox' || param.type === 'radio') ? checkOptions(param) : true

export default {
  mixins: [validationMixin],
  validations () {
    return {
      field: {
        type: {
          required,
          needsOptions: needsOptions(this.field)
        },
        name: {
          required,
          uniqueName: uniqueName({
            fields: this.$parent.$parent.asset.customFields,
            id: this.fieldIndex
          })
        },
        label: {
          required
        }
      }
    }
  },
  // Data from parent
  props: {
    fieldType: {
      type: String,
      default: null
    },
    fieldName: {
      type: String,
      default: null
    },
    fieldLabel: {
      type: String,
      default: null
    },
    fieldOptions: {
      type: Array,
      default: () => {
        return []
      }
    },
    fieldIndex: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      confirm: false,
      edit: false,
      field: {
        type: this.fieldType,
        name: this.fieldName,
        label: this.fieldLabel,
        options: this.fieldOptions
      },
      types: [
        'textField',
        'textArea',
        'checkbox',
        'radio'
      ],
      uniqueName: true
    }
  },
  computed: {
    typeErrors () {
      const errors = []
      if (!this.$v.field.type.$dirty) { return errors }
      !this.$v.field.type.required && errors.push('You must select a Field Type!')
      !this.$v.field.type.needsOptions && errors.push('This field type requires additonal Options to be entered below with the Add Option Button!')
      return errors
    },
    nameErrors () {
      const errors = []
      if (!this.$v.field.name.$dirty) { return errors }
      !this.$v.field.name.required && errors.push('You must select a Field Type!')
      !this.$v.field.name.uniqueName && errors.push('This name is already taken!')
      return errors
    },
    labelErrors () {
      const errors = []
      if (!this.$v.field.label.$dirty) { return errors }
      !this.$v.field.label.required && errors.push('Field Label is required!')
      return errors
    }
  },
  mounted () {
    if (!this.fieldType) { this.edit = true }
  },
  methods: {
    save () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        // Send data to parent through bus
        this.$bus
          .$emit('saveCustom', {
            type: this.field.type,
            name: this.field.name,
            label: this.field.label,
            options: this.field.options,
            key: this.fieldIndex
          })
        this.edit = false
      }
    },
    deleteThis () {
      this.edit = false
      // Send delete request to parent through bus
      this.$bus
        .$emit('deleteCustom', { key: this.fieldIndex })
    },
    // Delete an option, calling force update since the items are deep and not available for reactivity
    removeOption (key) {
      const arr = this.field.options
      arr.splice(key, 1)
      this.field.options = []
      this.$forceUpdate()
      this.$nextTick(() => {
        this.field.options = arr
        this.$forceUpdate()
      })
    }
  }
}
</script>
