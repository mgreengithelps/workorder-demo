<template>
  <v-card
    flat
    style="border: #BDBDBD 1px solid;border-radius: 10px"
  >
    <v-card-text>
      <form>
        <span
          v-show="iAmClaims.admin"
          class="pl-2 pb-3 grey--text caption"
        >
          DBID: {{ exists }}
        </span>
        <v-row>
          <v-col
            cols="12"
            md="6"
            :class="{
              'px-2': $vuetify.breakpoint.mdAndUp
            }"
          >
            <v-text-field
              v-model="form.tag"
              :error-messages="tagErrors"
              label="Asset Tag"
              name="tag"
              required
              @input="$v.form.tag.$touch()"
              @blur="$v.form.tag.$touch()"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            :class="{
              'px-2': $vuetify.breakpoint.mdAndUp
            }"
          >
            <v-text-field
              v-model="form.assetType"
              label="Asset Type"
              name="assetType"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            :class="{
              'px-2': $vuetify.breakpoint.mdAndUp
            }"
          >
            <v-text-field
              v-model="form.serial"
              label="Asset Serial Number"
              name="serial"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            :class="{
              'px-2': $vuetify.breakpoint.mdAndUp
            }"
          >
            <v-text-field
              v-model="form.manufacturer"
              label="Asset Manufacturer"
              name="manufacturer"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            :class="{
              'px-2': $vuetify.breakpoint.mdAndUp
            }"
          >
            <v-text-field
              v-model="form.modelNumber"
              label="Asset Model Number"
              name="modelNumber"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            :class="{
              'px-2': $vuetify.breakpoint.mdAndUp
            }"
          >
            <v-text-field
              v-model="form.description"
              label="Asset Description"
              name="description"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            :class="{
              'px-2': $vuetify.breakpoint.mdAndUp
            }"
          >
            <v-select
              v-show="$vuetify.breakpoint.smAndDown"
              v-model="form.departmentIn"
              :items="departments"
              item-text="text"
              item-value="value"
              label="Department where Asset is Located"
              name="department"
            />
            <v-autocomplete
              v-show="$vuetify.breakpoint.mdAndUp"
              v-model="form.departmentIn"
              :items="departments"
              item-text="text"
              item-value="value"
              label="Department where Asset is Located"
              name="department"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            :class="{
              'px-2': $vuetify.breakpoint.mdAndUp
            }"
          >
            <v-select
              v-model="form.department"
              :items="departmentsPM"
              item-text="text"
              item-value="value"
              :error-messages="departmentErrors"
              label="Asset PM Department"
              name="department"
              required
              @input="$v.form.department.$touch()"
              @blur="$v.form.department.$touch()"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            :class="{
              'px-2': $vuetify.breakpoint.mdAndUp
            }"
          >
            <v-autocomplete
              v-model="form.assignedTo"
              :items="workers"
              item-text="text"
              item-value="value"
              name="assignedTo"
              label="Assigned To (For PM)"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            :class="{
              'px-2': $vuetify.breakpoint.mdAndUp
            }"
          >
            <v-text-field
              v-model="form.room"
              name="room"
              label="Room"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            :class="{
              'px-2': $vuetify.breakpoint.mdAndUp
            }"
          >
            <v-text-field
              v-model="form.lineNo"
              name="lineNo"
              label="Line Notes"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            :class="{
              'px-2': $vuetify.breakpoint.mdAndUp
            }"
          >
            <v-text-field
              v-model="form.cost"
              name="cost"
              label="Asset Cost"
            />
          </v-col>
          <v-col
            cols="12"
            :class="{
              'px-2': $vuetify.breakpoint.mdAndUp
            }"
          >
            <v-textarea
              v-model="form.notes"
              name="notes"
              label="Notes"
            />
          </v-col>
        </v-row>
        <v-btn
          text
          color="primary"
          class="ml-0"
          :loading="saveLoading"
          @click="save"
        >
          Save Asset
        </v-btn>
        <v-btn
          text
          color="error"
          @click="clear"
        >
          Detach
        </v-btn>
      </form>
    </v-card-text>
    <v-dialog
      v-model="dialog"
      persistent
      width="500"
    >
      <v-card>
        <v-card-title>
          Are you sure?
        </v-card-title>
        <v-card-text>
          The asset will be disassociated with this user, but will still be saved in the Asset Manager. You can permanently delete this asset in the Asset Manager.
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <div
            class="flex-grow-1"
          />
          <v-btn
            color="primary"
            text
            :loading="btnLoading"
            @click="remove"
          >
            I accept
          </v-btn>
          <v-btn
            color="secondary"
            text
            @click="cancel"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'

export default {
  mixins: [validationMixin],
  validations: {
    form: {
      tag: { required },
      department: { required }
    }
  },
  props: {
    dataExists: {
      type: String,
      default: null
    },
    dataRef: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      btnLoading: false,
      dialog: false,
      exists: this.dataExists,
      form: {
        assetId: this.exists,
        assignedTo: {
          displayName: null,
          workerId: null
        },
        department: null
      },
      saveLoading: false
    }
  },
  computed: {
    iAmClaims () { return this.$store.state.claims },
    departments () { return this.$store.state.departments },
    departmentsPM () { return this.$store.state.departmentsPM },
    tagErrors () {
      const errors = []
      if (!this.$v.form.tag.$dirty) { return errors }
      !this.$v.form.tag.required && errors.push('Asset Tag is required.')
      return errors
    },
    departmentErrors () {
      const errors = []
      if (!this.$v.form.department.$dirty) { return errors }
      !this.$v.form.department.required && errors.push('Asset Department is required.')
      return errors
    },
    workers () { return this.$store.state.workers }
  },
  beforeMount () {
    this.getAsset()
    this.getWorkers()
  },
  methods: {
    // Close Dialog, cancels delete action
    cancel () { this.dialog = false },
    // Show delete dialog
    clear () { this.dialog = true },
    getAsset () {
      if (this.exists) {
        this.$store
          .dispatch('getSingleAsset', { assetId: this.exists })
          .then((response) => {
            Object
              .keys(response)
              .forEach((k) => { this.form[k] = response[k] })
          })
          .catch((error) => {
            this.$store
              .dispatch('updateLocalErrors', error)
          })
      }
    },
    // An Array of available non-staff assigned employees to assign to assets
    getWorkers () {
      if (!this.$firebase.auth().currentUser) {
        setTimeout(() => { this.getWorkers() }, 150)
      } else if (this.$store.state.workers.length === 0) {
        this.$store
          .dispatch('getWorkers', this.$firebase.auth().currentUser.uid)
          .catch((error) => {
            this.$store
              .dispatch('updateLocalErrors', error)
          })
      }
    },
    // Pass to parent for deletion
    remove () {
      this.dialog = false
      this.$bus.$emit('removeAssets', {
        userId: this.$route.params.id,
        refNumber: this.dataRef,
        exists: this.exists
      })
    },
    // Send to store for saving asset, pass along if new or old
    save () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.saveLoading = true
        this.$store
          .dispatch('getDateAndTime')
          .then((response) => {
            this.form.active = this.form.active || true
            this.form.addedBy = this.form.addedBy || this.$firebase.auth().currentUser.displayName
            this.form.addedDate = this.form.addedDate || response.date
            this.form.addedTime = this.form.addedTime || response.time
            this.form.assetId = this.exists || 'new'
            this.form.editedBy = this.$firebase.auth().currentUser.displayName
            this.form.editedDate = response.date
            this.form.editedTime = response.time
            this.form.userId = this.$route.params.id
            this.$store
              .dispatch('saveAsset', this.form)
          })
          .then((response) => {
            alert('Asset has been saved.')
            if (!this.exists) { this.exists = response }
            this.saveLoading = false
          })
          .catch((error) => {
            this.saveLoading = false
            this.$store
              .dispatch('updateLocalErrors', error)
          })
      }
    }
  }
}
</script>
