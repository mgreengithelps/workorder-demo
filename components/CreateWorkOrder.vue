<!--
Component to control work order creation
-->
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
          Submit a Work Order Ticket
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
                class="pa-0"
              >
                <v-row>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                    class="px-1"
                  >
                    <v-autocomplete
                      v-model="department"
                      :items="departments"
                      item-text="text"
                      item-value="value"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                      label="Please Select Help Topic"
                      placeholder="Please Select Help Topic"
                      required
                      :hide-details="!departmentErrors"
                      :error-messages="departmentErrors"
                    />
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                    class="px-1"
                  >
                    <v-autocomplete
                      v-model="building"
                      :items="buildings"
                      item-text="text"
                      item-value="value"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                      label="Please Select a Location"
                      placeholder="Please Select a Location"
                      required
                      :hide-details="!buildingErrors"
                      :error-messages="buildingErrors"
                    />
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                    class="px-1"
                  >
                    <v-autocomplete
                      v-model="staffDepartment"
                      name="staffDepartment"
                      :items="departmentsStaff"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                      label="What department is the issue in?"
                      placeholder="What department is the issue in?"
                      required
                      :hide-details="!staffDepartmentErrors"
                      :error-messages="staffDepartmentErrors"
                    />
                  </v-col>
                  <v-col
                    v-if="department === 'bioMed' || department === 'facilities'"
                    cols="12"
                    sm="6"
                    md="4"
                    class="px-1"
                  >
                    <v-text-field
                      v-model="tag"
                      name="tag"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                      label="Asset Tag"
                      placeholder="Asset Tag"
                      :required="department === 'bioMed' || department === 'facilities'"
                      :hide-details="!tagErrors"
                      :error-messages="tagErrors"
                    />
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                    class="px-1"
                  >
                    <v-text-field
                      v-model="phone"
                      name="phone"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                      label="Phone Number or Extension"
                      placeholder="Phone Number or Extension"
                      required
                      :hide-details="!phoneErrors"
                      :error-messages="phoneErrors"
                    />
                  </v-col>
                  <v-col
                    v-if="iAmClaims.admin || iAmClaims.it"
                    cols="12"
                    sm="6"
                    md="4"
                    class="px-1"
                  >
                    <v-autocomplete
                      v-model="requestedBy"
                      name="requestedBy"
                      :items="users"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                      label="Requested By"
                      placeholder="Requested By"
                      hide-details
                    />
                  </v-col>
                  <v-col
                    v-if="iAmClaims.admin || iAmClaims.it"
                    cols="12"
                    sm="6"
                    md="4"
                    class="px-1"
                  >
                    <v-autocomplete
                      v-model="assignedTo"
                      name="assignedTo"
                      :items="workers"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                      label="Assign To"
                      placeholder="Assign To"
                    />
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                    class="px-1"
                  >
                    <v-select
                      v-if="summaries.length > 0"
                      v-model="subject"
                      :items="summaries"
                      name="subject"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                      label="Issue Summary"
                      placeholder="Issue Summary"
                      required
                      :hide-details="!subjectErrors"
                      :error-messages="subjectErrors"
                    />
                    <v-text-field
                      v-else
                      v-model="subject"
                      name="subject"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                      label="Issue Short Summary"
                      placeholder="Issue Short Summary"
                      required
                      :hide-details="!subjectErrors"
                      :error-messages="subjectErrors"
                    />
                  </v-col>
                  <v-col
                    v-if="subject === 'Resident Needs'"
                    cols="12"
                    sm="6"
                    md="4"
                    class="px-1"
                  >
                    <v-select
                      v-model="options['Resident Needs']"
                      label="Resident Needs"
                      placeholder="Resident Needs"
                      :items="[
                        'Activities',
                        'Family Requests',
                        'Special Requests'
                      ]"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                      :required="subject === 'Meal Tickets'"
                      :error-messages="residentNeedsErrors"
                    />
                  </v-col>
                  <v-col
                    v-if="subject === 'Meal Tickets'"
                    cols="12"
                    sm="6"
                    md="4"
                    class="px-1"
                  >
                    <v-text-field
                      v-model="options['Number of Tickets']"
                      label="Number of Tickets"
                      placeholder="Number of Tickets"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                      :required="subject === 'Meal Tickets'"
                      :error-messages="numberTicketsErrors"
                    />
                  </v-col>
                  <v-col
                    v-if="subject === 'Catering'"
                    cols="12"
                    sm="6"
                    md="4"
                    class="px-1"
                  >
                    <v-text-field
                      v-model="options['Meal Requested']"
                      label="Meal Requested"
                      placeholder="Meal Requested"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                      :required="subject === 'Catering'"
                      :error-messages="mealRequestedErrors"
                    />
                  </v-col>
                  <v-col
                    v-if="subject === 'Meals Delivered'"
                    cols="12"
                    sm="6"
                    md="4"
                    class="px-1"
                  >
                    <v-text-field
                      v-model="options['Room Number']"
                      label="Room Number"
                      placeholder="Room Number"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                      :required="subject === 'Meals Delivered'"
                      :error-messages="roomNumberErrors"
                    />
                  </v-col>
                  <v-col
                    v-if="subject === 'Catering' || subject === 'Meals Delivered'"
                    cols="12"
                    sm="6"
                    md="4"
                    class="px-1"
                  >
                    <v-text-field
                      v-model="options['Number of Meals']"
                      label="Number of Meals"
                      placeholder="Number of Meals"
                      :outlined="$vuetify.breakpoint.mdAndUp"
                      :required="subject === 'Catering' || subject === 'Meals Delivered'"
                      :error-messages="numberOfMealsErrors"
                    />
                  </v-col>
                  <v-col
                    v-if="subject === 'Catering' || subject === 'Meals Delivered'"
                    cols="12"
                    sm="6"
                    md="4"
                    class="px-1"
                  >
                    <v-menu
                      ref="cateringDateMenu"
                      v-model="cateringDateMenu"
                      :close-on-content-click="false"
                      :return-value.sync="options.Date"
                      transition="scale-transition"
                      offset-y
                      full-width
                      min-width="290px"
                    >
                      <template
                        v-slot:activator="{ on }"
                      >
                        <v-text-field
                          v-model="options.Date"
                          label="Date"
                          placeholder="Date"
                          :outlined="$vuetify.breakpoint.mdAndUp"
                          prepend-inner-icon="mdi-calendar"
                          readonly
                          :required="subject === 'Catering' || subject === 'Meals Delivered'"
                          :error-messages="dateErrors"
                          v-on="on"
                        />
                      </template>
                      <v-date-picker
                        v-model="options.Date"
                        scrollable
                        color="purple"
                      >
                        <div class="flex-grow-1" />
                        <v-btn
                          text
                          color="primary"
                          @click="cateringDateMenu = false"
                        >
                          Cancel
                        </v-btn>
                        <v-btn
                          text
                          color="primary"
                          @click="$refs.cateringDateMenu.save(options.Date)"
                        >
                          OK
                        </v-btn>
                      </v-date-picker>
                    </v-menu>
                  </v-col>
                  <v-col
                    v-if="subject === 'Catering' || subject === 'Meals Delivered'"
                    cols="12"
                    sm="6"
                    md="4"
                    class="px-1"
                  >
                    <v-menu
                      ref="cateringTimeMenu"
                      v-model="cateringTimeMenu"
                      :close-on-content-click="false"
                      :return-value.sync="options.Time"
                      transition="scale-transition"
                      offset-y
                      full-width
                      min-width="290px"
                    >
                      <template
                        v-slot:activator="{ on }"
                      >
                        <v-text-field
                          v-model="options.Time"
                          label="Time"
                          placeholder="Time"
                          :outlined="$vuetify.breakpoint.mdAndUp"
                          prepend-inner-icon="mdi-clock"
                          readonly
                          :required="subject === 'Catering' || subject === 'Meals Delivered'"
                          :error-messages="timeErrors"
                          v-on="on"
                        />
                      </template>
                      <v-time-picker
                        v-model="options.Time"
                        scrollable
                        color="purple"
                      >
                        <v-btn
                          text
                          color="secondary"
                          @click="cateringTimeMenu = false"
                        >
                          Cancel
                        </v-btn>
                        <v-spacer />
                        <v-btn
                          text
                          color="primary"
                          @click="$refs.cateringTimeMenu.save(options.Time)"
                        >
                          OK
                        </v-btn>
                      </v-time-picker>
                    </v-menu>
                  </v-col>
                  <v-col
                    cols="12"
                    class="px-1"
                  >
                    <VueEditor
                      id="editor"
                      ref="editor"
                      v-model="description"
                      placeholder="Please describe the issue you are having"
                      :editor-toolbar="customToolbar"
                      :error-messages="descriptionErrors"
                      use-custom-image-handler
                      @image-added="handleFileAdded"
                    />
                    <v-progress-linear
                      v-model="fileUploadStatus"
                      :active="fileUploadStatus > 0"
                      color="info"
                    />
                    <div
                      v-show="filesUploaded.length > 0"
                    >
                      <div
                        v-for="(item, index) in filesUploaded"
                        :key="index"
                      >
                        <a
                          :href="item.url"
                          download
                          target="_blank"
                        >
                          {{ item.name }}
                        </a>
                      </div>
                    </div>
                    <p
                      v-show="descriptionErrors.length > 0"
                      class="red--text text--darken-1 caption"
                    >
                      {{ descriptionErrors[0] }}
                    </p>
                  </v-col>
                  <v-col
                    cols="12"
                    class="pt-3 text-right"
                  >
                    <v-btn
                      depressed
                      color="primary"
                      :loading="loading"
                      @click="submit"
                    >
                      Submit
                    </v-btn>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
          </div>
        </v-expand-transition>
        <v-dialog
          v-model="dialog"
          max-width="500"
        >
          <v-card>
            <v-card-title
              class="headline"
              primary-title
            >
              Thank you
            </v-card-title>
            <v-card-text>
              Your ticket has been created.
            </v-card-text>
            <v-card-actions>
              <div
                class="flex-grow-1"
              />
              <v-btn
                color="primary"
                text
                @click="dialog = false"
              >
                Okay
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card>
    </v-hover>
  </v-col>
</template>

<script>
import { VueEditor } from 'vue2-editor'
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'

// Check if file is an image
const imageReg = /[/.](gif|jpg|jpeg|tiff|png|svg|bmp)$/i

export default {
  components: {
    VueEditor
  },
  mixins: [validationMixin],
  validations: {
    department: {
      required
    },
    description: {
      required
    },
    building: {
      required
    },
    options: {
      Date: {
        required
      },
      'Meal Requested': {
        required
      },
      'Number of Meals': {
        required
      },
      'Number of Tickets': {
        required
      },
      'Resident Needs': {
        required
      },
      'Room Number': {
        required
      },
      Time: {
        required
      }
    },
    phone: {
      required
    },
    staffDepartment: {
      required
    },
    subject: {
      required
    },
    tag: {
      required
    }
  },
  data () {
    return {
      assignedTo: null,
      building: null,
      cateringDateMenu: false,
      cateringTimeMenu: false,
      childRef: null,
      customToolbar: [
        [
          'bold',
          'italic',
          'underline',
          'strike'
        ],
        [
          'blockquote',
          'code-block'
        ],
        [
          {
            'list': 'ordered'
          },
          {
            'list': 'bullet'
          }
        ],
        [
          {
            'color': []
          },
          {
            'background': []
          }
        ],
        [
          'image'
        ],
        [
          'clean'
        ]
      ],
      department: null,
      departments: [
        {
          text: 'Biomedical',
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
          text: 'Statistics',
          value: 'statistics'
        },
        {
          text: 'Transportation',
          value: 'transportation'
        }
      ],
      descIndex: [],
      description: null,
      dialog: false,
      fileUploadStatus: 0,
      filesUploaded: [],
      loading: false,
      options: {},
      pastedNumber: 1,
      phone: null,
      requestedBy: null,
      staffDepartment: null,
      subject: null,
      tag: null,
      ticketNumber: null,
      users: []
    }
  },
  computed: {
    buildingErrors () {
      const errors = []
      if (!this.$v.building.$dirty) { return errors }
      !this.$v.building.required && errors.push('Please select a location.')
      return errors
    },
    buildings () { return this.$store.state.buildings },
    dateErrors () {
      const errors = []
      if (!this.$v.options.Date.$dirty) { return errors }
      if (this.department === 'dietary') {
        if (this.subject === 'Catering' || this.subject === 'Meals Delivered') {
          !this.$v.options.Date.required && errors.push('Date is required.')
          return errors
        } else {
          return errors
        }
      } else {
        return errors
      }
    },
    departmentErrors () {
      const errors = []
      if (!this.$v.department.$dirty) { return errors }
      !this.$v.department.required && errors.push('Please select a help topic.')
      return errors
    },
    departmentsStaff () { return this.$store.state.departmentsStaff },
    descriptionErrors () {
      const errors = []
      if (!this.$v.description.$dirty) { return errors }
      !this.$v.description.required && errors.push('Please describe the issue you are having.')
      return errors
    },
    iAmClaims () {
      return this.$store.state.claims
    },
    mealRequestedErrors () {
      const errors = []
      if (!this.$v.options['Meal Requested'].$dirty) { return errors }
      if (this.department === 'dietary' && this.subject === 'Catering') {
        !this.$v.options['Meal Requested'].required && errors.push('Number of Meals is required.')
        return errors
      } else {
        return errors
      }
    },
    // Control is component is minimized, value is in store
    minimize: {
      get () {
        return this.$store.state.createMinimize
      },
      set (value) {
        this.$store
          .dispatch('updateCreateMinimize', value)
      }
    },
    numberOfMealsErrors () {
      const errors = []
      if (!this.$v.options['Number of Meals'].$dirty) { return errors }
      if (this.department === 'dietary') {
        if (this.subject === 'Catering' || this.subject === 'Meals Delivered') {
          !this.$v.options['Number of Meals'].required && errors.push('Number of Meals is required.')
          return errors
        } else {
          return errors
        }
      } else {
        return errors
      }
    },
    numberTicketsErrors () {
      const errors = []
      if (!this.$v.options['Number of Tickets'].$dirty) { return errors }
      if (this.department === 'dietary') {
        if (this.subject === 'Meal Tickets') {
          !this.$v.options['Number of Tickets'].required && errors.push('Number of Tickets is required.')
          return errors
        } else {
          return errors
        }
      } else {
        return errors
      }
    },
    phoneErrors () {
      const errors = []
      if (!this.$v.phone.$dirty) { return errors }
      !this.$v.phone.required && errors.push('Please enter a phone number or extension.')
      return errors
    },
    residentNeedsErrors () {
      const errors = []
      if (!this.$v.options['Resident Needs'].$dirty) { return errors }
      if (this.department === 'dietary') {
        if (this.subject === 'Resident Needs') {
          !this.$v.options['Resident Needs'].required && errors.push('Resident Needs is required.')
          return errors
        } else {
          return errors
        }
      } else {
        return errors
      }
    },
    roomNumberErrors () {
      const errors = []
      if (!this.$v.options['Room Number'].$dirty) { return errors }
      if (this.department === 'dietary') {
        if (this.subject === 'Meals Delivered') {
          !this.$v.options['Room Number'].required && errors.push('Room Number is required.')
          return errors
        } else {
          return errors
        }
      } else {
        return errors
      }
    },
    staffDepartmentErrors () {
      const errors = []
      if (!this.$v.staffDepartment.$dirty) { return errors }
      !this.$v.staffDepartment.required && errors.push('Please select a department.')
      return errors
    },
    subjectErrors () {
      const errors = []
      if (!this.$v.subject.$dirty) { return errors }
      !this.$v.subject.required && errors.push('Please enter an issue summary.')
      return errors
    },
    summaries () {
      if (this.department === 'it') {
        return [
          'Affinity',
          'Audio/Video Equipment',
          'Computer/Tablet',
          'Demographic Change Form',
          'DocuTap',
          'ePHI Form',
          'Epic/SoftLab',
          'Epic Training Request',
          'Employee Change Form',
          'Hardware/Workflow Request',
          'Laptop Request Form',
          'MM Hayes/Cash Registers/Vending Machines',
          'New Contracted Employee Form',
          'New Hire Form',
          'Phones',
          'Point Click Care',
          'Printing',
          'Separation of Service Form',
          'Signage',
          'Social Media Request',
          'TV/Cable Service',
          'Websites/Intranet',
          'Windows Password Reset',
          'Work Order System',
          'Other'
        ]
      } else if (this.department === 'dietary') {
        return [
          'Catering',
          'Meal Tickets',
          'Meals Delivered',
          'Resident Needs',
          'Other'
        ]
      } else {
        return []
      }
    },
    tagErrors () {
      const errors = []
      if (!this.$v.tag.$dirty) { return errors }
      if (this.department === 'bioMed' || this.department === 'facilities') {
        !this.$v.tag.required && errors.push('Please enter an asset tag.')
        return errors
      } else {
        return errors
      }
    },
    timeErrors () {
      const errors = []
      if (!this.$v.options.Time.$dirty) { return errors }
      if (this.department === 'dietary') {
        if (this.subject === 'Catering' || this.subject === 'Meals Delivered') {
          !this.$v.options.Time.required && errors.push('Time is required.')
          return errors
        } else {
          return errors
        }
      } else {
        return errors
      }
    },
    user () { return this.$store.state.user },
    workers () {
      return this.$store.state.workers
    }
  },
  mounted () {
    this.$store
      .dispatch('updateCreateMinimize')
    this.getWorkers()
    this.getUsers()
    this.setChildRef()
    // Add listeners to editor for file drop and paste
    document
      .getElementById('editor')
      .addEventListener('drop', (event) => { this.handleDrop(event) })
    document
      .getElementById('editor')
      .addEventListener('paste', (event) => { this.handlePaste(event) })
  },
  methods: {
    // Child reference for Firebase storage, based on user's uid and date to keep references unique
    // It will overwrite the file if it is not unique
    setChildRef () {
      if (!this.$firebase.auth().currentUser) { return setTimeout(() => { this.setChildRef() }, 250) }
      this.childRef = `workOrders/${this.$firebase.auth().currentUser.uid}/${new Date()}`
    },
    // List of all current users
    getUsers () {
      if (!this.$firebase.auth().currentUser) {
        setTimeout(() => {
          this.getUsers()
        }, 150)
      } else {
        this.$store
          .dispatch('getUsersList', this.$firebase.auth().currentUser.uid)
          .then((response) => { this.users = response })
          .catch((error) => {
            this.$store
              .dispatch('updateLocalErrors', error)
          })
      }
    },
    // List of all current workers
    getWorkers () {
      if (this.$store.state.workers.length === 0) {
        this.$store
          .dispatch('getWorkers')
      }
    },
    // Drop event in editor, upload file on drop
    handleDrop (evt) {
      evt.preventDefault()
      if (evt.dataTransfer && evt.dataTransfer.files && evt.dataTransfer.files.length) {
        for (const file of evt.dataTransfer.files) {
          if (file.size < 20000000) {
            const resetUploader = () => {
              const uploader = document.getElementById('file-upload')
              uploader.value = ''
            }
            const uploadTask = this.$storage
              .ref()
              .child(`${this.childRef}/${file.name}`)
              .put(file)
            // Track upload status
            uploadTask
              .on('state_changed', (snapshot) => {
                this.fileUploadStatus = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              }, (error) => {
                this.fileUploadStatus = 0
                this.$store
                  .dispatch('updateLocalErrors', error)
                resetUploader()
              }, () => {
                // Insert url of image into editor
                uploadTask.snapshot.ref
                  .getDownloadURL()
                  .then((downloadURL) => {
                    if (imageReg.test(file.type)) {
                      if (this.$refs.editor.quill.hasFocus()) {
                        const range = this.$refs.editor.quill.getSelection()
                        const cursorLocation = range.index
                        this.$refs.editor.quill
                          .insertEmbed(cursorLocation, 'image', downloadURL)
                      } else {
                        this.$refs.editor.quill
                          .insertEmbed(0, 'image', downloadURL)
                      }
                    }
                    this.fileUploadStatus = 0
                    this.filesUploaded
                      .push({
                        name: file.name,
                        url: downloadURL
                      })
                    resetUploader()
                  })
              })
          } else {
            this.$store
              .dispatch('updateLocalErrors', new Error('Your file is too big, please select a file under 20 MB. Thank you.'))
          }
          break
        }
      }
    },
    // Handle paste events in editor, much like drop event above, checks if the item is a file, if so it uploads it
    handlePaste (evt) {
      if (evt.clipboardData && evt.clipboardData.items && evt.clipboardData.items.length) {
        for (const item of evt.clipboardData.items) {
          if (item.kind === 'file') {
            evt.preventDefault()
            const file = item.getAsFile()
            const ext = file.name.split('.').pop()
            if (file.size < 20000000) {
              const resetUploader = () => {
                const uploader = document.getElementById('file-upload')
                uploader.value = ''
              }
              const uploadTask = this.$storage
                .ref()
                .child(`${this.childRef}/clipboard${this.pastedNumber}.${ext}`)
                .put(file)
              uploadTask
                .on('state_changed', (snapshot) => {
                  this.fileUploadStatus = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                }, (error) => {
                  this.fileUploadStatus = 0
                  this.$store
                    .dispatch('updateLocalErrors', error)
                  resetUploader()
                }, () => {
                  uploadTask.snapshot.ref
                    .getDownloadURL()
                    .then((downloadURL) => {
                      if (imageReg.test(file.type)) {
                        const range = this.$refs.editor.quill.getSelection()
                        const cursorLocation = range.index
                        this.$refs.editor.quill
                          .insertEmbed(cursorLocation, 'image', downloadURL)
                      }
                      this.fileUploadStatus = 0
                      this.filesUploaded
                        .push({
                          name: `clipboard${this.pastedNumber}.${ext}`,
                          url: downloadURL
                        })
                      this.pastedNumber++
                      resetUploader()
                    })
                })
            } else {
              this.$store
                .dispatch('updateLocalErrors', new Error('Your file is too big, please select a file under 20 MB. Thank you.'))
            }
            break
          }
        }
      }
    },
    finish () {
      for (let i = 0; i < this.users.length; i++) {
        if (this.requestedBy === this.users[i].value) { this.requestedBy = this.users[i] }
      }
      const read = {}
      // Autoassign statistics category to DEMO
      if (this.department === 'statistics') {
        this.assignedTo = {
          displayName: '',
          workerId: ''
        }
      }
      // Mark ticket as read for user's own work order
      read[this.$firebase.auth().currentUser.uid] = true
      this.loading = true
      // Create and "index" array of items, so the ticket can be searched effectively
      this.toIndex(this.description)
        .then(() => this.$db
          .collection('workOrders')
          .orderBy('ticketNumber', 'desc')
          .limit(1)
          .get()
        )
        // Set a ticket number for this new ticket
        .then((querySnapshot) => this.updateTicketNumber(querySnapshot))
        .then((response) => this.$db
          .collection('workOrders')
          .add({
            active: true,
            assignedTo: this.assignedTo,
            building: this.building,
            createdDate: this.$firebase.firestore.Timestamp.now(),
            commentCount: 0,
            department: this.department,
            descIndex: this.descIndex,
            description: this.description,
            filesUploaded: this.filesUploaded,
            from: this.user.email,
            lastUpdated: this.$firebase.firestore.Timestamp.now(),
            options: this.options,
            phone: this.phone,
            priority: 'Normal',
            read,
            staffDepartment: this.staffDepartment,
            status: 'Open',
            subject: this.subject,
            tag: (this.tag) ? this.tag : null,
            ticketNumber: this.ticketNumber,
            user: (this.requestedBy) ? this.requestedBy.text : this.$firebase.auth().currentUser.displayName,
            userId: (this.requestedBy) ? this.requestedBy.value : this.$firebase.auth().currentUser.uid,
            workOrderType: 'workorder'
          })
        )
        .then((docRef) => this.updateMeta(docRef))
        .then((response) => {
          this.dialog = true
          this.assignedTo = null
          this.building = null
          this.department = null
          this.description = null
          this.phone = null
          this.requestedBy = null
          this.staffDepartment = null
          this.subject = null
          this.loading = false
          this.$v.$reset()
        })
        .catch((error) => {
          this.loading = false
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    // Upload file and add it to the editor if it is an image
    handleFileAdded (file, Editor, cursorLocation, resetUploader) {
      if (file.size < 20000000) {
        const uploadTask = this.$storage
          .ref()
          .child(`${this.childRef}/${file.name}`)
          .put(file)
        uploadTask
          .on('state_changed', (snapshot) => {
            this.fileUploadStatus = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          }, (error) => {
            this.fileUploadStatus = 0
            this.$store
              .dispatch('updateLocalErrors', error)
            resetUploader()
          }, () => {
            uploadTask.snapshot.ref
              .getDownloadURL()
              .then((downloadURL) => {
                if (imageReg.test(file.type)) {
                  Editor
                    .insertEmbed(cursorLocation, 'image', downloadURL)
                }
                this.fileUploadStatus = 0
                this.filesUploaded.push({
                  name: file.name,
                  url: downloadURL
                })
                resetUploader()
              })
          })
      } else {
        this.$store
          .dispatch('updateLocalErrors', new Error('Your file is too big, please select a file under 20 MB. Thank you.'))
      }
    },
    request (value) {
      console.log(value)
    },
    // Remove html from data
    strip (html) {
      const doc = new DOMParser().parseFromString(html, 'text/html')
      return doc.body.textContent || null
    },
    submit () {
      this.$v.$touch()
      // Different validation checks based on what department the ticket is for
      if (!this.$v.$invalid) {
        this.finish()
      } else if (this.department === 'dietary' && !this.$v.department.$invalid && !this.$v.building.$invalid && !this.$v.description.$invalid && !this.$v.phone.$invalid && !this.$v.staffDepartment.$invalid && !this.$v.subject.$invalid) {
        if (this.subject === 'Catering' && !this.$v.options.Date.$invalid && !this.$v.options['Meal Requested'].$invalid && !this.$v.options['Number of Meals'].$invalid && !this.$v.options.Time.$invalid) {
          this.finish()
        } else if (this.subject === 'Meal Tickets' && !this.$v.options['Number of Tickets'].$invalid) {
          this.finish()
        } else if (this.subject === 'Meals Delivered' && !this.$v.options.Date.$invalid && !this.$v.options['Number of Meals'].$invalid && !this.$v.options['Room Number'].$invalid && !this.$v.options.Time.$invalid) {
          this.finish()
        } else if (this.subject === 'Other') {
          this.finish()
        } else if (this.subject === 'Resident Needs' && !this.$v.options['Resident Needs'].$invalid) {
          this.finish()
        }
      } else if (this.department === 'facilities' && !this.$v.department.$invalid && !this.$v.building.$invalid && !this.$v.description.$invalid && !this.$v.phone.$invalid && !this.$v.staffDepartment.$invalid && !this.$v.subject.$invalid && !this.$v.tag.$invalid) {
        this.finish()
      } else if (this.department === 'bioMed' && !this.$v.department.$invalid && !this.$v.building.$invalid && !this.$v.description.$invalid && !this.$v.phone.$invalid && !this.$v.staffDepartment.$invalid && !this.$v.subject.$invalid && !this.$v.tag.$invalid) {
        this.finish()
      } else if (this.department !== 'bioMed' && this.department !== 'facilities' && this.department !== 'dietary' && !this.$v.department.$invalid && !this.$v.building.$invalid && !this.$v.description.$invalid && !this.$v.phone.$invalid && !this.$v.staffDepartment.$invalid && !this.$v.subject.$invalid) {
        this.finish()
      }
    },
    // Creates an array in the ticket that makes it easier to search by, based on subject, description, user name
    toIndex (description) {
      return new Promise((resolve, reject) => {
        try {
          description += (this.requestedBy) ? ` ${this.requestedBy.text} ` : ` ${this.$firebase.auth().currentUser.displayName} `
          description += (this.subject) ? ` ${this.subject} ` : ''
          // Common words to remove from the array
          const common = [
            'a',
            'and',
            'are',
            'do',
            'doing',
            'done',
            'i',
            'in',
            'is',
            'it',
            'its',
            'for',
            'me',
            'mine',
            'my',
            'of',
            'or',
            'our',
            'so',
            'that',
            'the',
            'their',
            'them',
            'there',
            'they',
            'theyre',
            'this',
            'to',
            'us',
            'we'
          ]
          const noHtml = (description) ? this.strip(description) : null
          const noNumbers = (noHtml) ? noHtml.replace(/[0-9]/g, ' ') : null
          const text = (noNumbers) ? noNumbers.replace(/[^\w\s]/gi, ' ') : null
          const whiteSpacetoComma = (text) ? text.replace(/\s/g, ',') : null
          const lowerCase = (whiteSpacetoComma) ? whiteSpacetoComma.toLowerCase() : null
          const arr = (lowerCase) ? lowerCase.split(',') : []
          let c = arr.length
          while (c--) {
            if (arr[c] === '') {
              arr
                .splice(c, 1)
            } else if (common.includes(arr[c])) {
              arr
                .splice(c, 1)
            }
          }
          // Remove duplicate entries
          this.descIndex = arr.filter((elem, index, self) => { return index === self.indexOf(elem) })
          resolve(true)
        } catch (e) {
          reject(e)
        }
      })
    },
    // Update storage item with relevant ticket id
    updateMeta (docRef) {
      return new Promise((resolve, reject) => {
        if (this.filesUploaded.length > 0) {
          for (let i = 0; i < this.filesUploaded.length; i++) {
            this.$storage
              .ref()
              .child(`${this.childRef}/${this.filesUploaded[i].name}`)
              .updateMetadata({
                customMetadata: {
                  workOrder: docRef.id
                }
              })
              .then((response) => resolve(response))
              .catch((error) => reject(error))
          }
        } else {
          resolve('No File uploaded')
        }
      })
    },
    // Find last inserted ticket and create a new number for this ticket
    updateTicketNumber (querySnapshot) {
      return new Promise((resolve, reject) => {
        try {
          querySnapshot
            .forEach((doc) => {
              this.ticketNumber = doc.data().ticketNumber + 1
            })
          if (!this.ticketNumber) {
            throw new Error('Ticket number could not be created.')
          }
          resolve(true)
        } catch (error) {
          reject(error)
        }
      })
    }
  }
}
</script>
