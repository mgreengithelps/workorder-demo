<template>
  <v-card>
    <v-card-title
      primary-title
      class="subtitle-1"
    >
      Create Report
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-container
        fluid
        class="pa-0"
      >
        <v-row
          align="center"
        >
          <v-col
            cols="12"
            sm="6"
            md="3"
            class="py-0"
          >
            <v-menu
              ref="fromMenu"
              v-model="fromMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template
                v-slot:activator="{ on }"
              >
                <v-text-field
                  v-model="from"
                  name="from"
                  :outlined="$vuetify.breakpoint.mdAndUp"
                  label="From Date"
                  placeholder="From Date"
                  :error-messages="fromErrors"
                  v-on="on"
                />
              </template>
              <v-date-picker
                v-model="from"
                no-title
                @input="fromMenu = false"
              />
            </v-menu>
          </v-col>
          <v-col
            cols="12"
            sm="6"
            md="3"
            class="py-0"
          >
            <v-menu
              ref="toMenu"
              v-model="toMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template
                v-slot:activator="{ on }"
              >
                <v-text-field
                  v-model="to"
                  name="to"
                  :outlined="$vuetify.breakpoint.mdAndUp"
                  label="To Date"
                  placeholder="To Date"
                  :error-messages="toErrors"
                  v-on="on"
                />
              </template>
              <v-date-picker
                v-model="to"
                no-title
                @input="toMenu = false"
              />
            </v-menu>
          </v-col>
          <v-col
            cols="12"
            sm="6"
            md="3"
            class="py-0"
          >
            <v-select
              v-model="topic"
              name="topic"
              :items="items"
              :outlined="$vuetify.breakpoint.mdAndUp"
              label="Report Topic"
              placeholder="Report Topic"
              :error-messages="topicErrors"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
            md="3"
            class="py-0 mb-4"
          >
            <v-btn
              depressed
              color="primary"
              class="mb-5"
              :loading="loading"
              @click="generate"
            >
              Generate
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'

export default {
  mixins: [validationMixin],
  validations: {
    from: {
      required
    },
    to: {
      required
    },
    topic: {
      required
    }
  },
  data () {
    return {
      from: null,
      fromMenu: false,
      items: [
        {
          text: 'All',
          value: 'All'
        },
        {
          text: 'PMs',
          value: 'PM'
        },
        {
          text: 'Work Orders',
          value: 'workorder'
        }
      ],
      loading: false,
      reports: [],
      to: null,
      toMenu: false,
      topic: null
    }
  },
  computed: {
    department () { return this.$store.state.reportingDepartment },
    fromErrors () {
      const errors = []
      if (!this.$v.from.$dirty) { return errors }
      !this.$v.from.required && errors.push('Please pick a from date.')
      return errors
    },
    toErrors () {
      const errors = []
      if (!this.$v.to.$dirty) { return errors }
      !this.$v.to.required && errors.push('Please pick a from date.')
      return errors
    },
    topicErrors () {
      const errors = []
      if (!this.$v.topic.$dirty) { return errors }
      !this.$v.topic.required && errors.push('Please pick a from date.')
      return errors
    }
  },
  methods: {
    addReport (querySnapshot) {
      return new Promise((resolve, reject) => {
        try {
          for (let i = 0; i < querySnapshot.docs.length; i++) {
            this.reports
              .push(querySnapshot.docs[i])
          }
          resolve({ message: 'Finished' })
        } catch (e) {
          reject(e)
        }
      })
    },
    generate () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.loading = true
        const start = new Date(this.$moment(this.from).subtract(1, 'days').format('MM/DD/YYYY hh:mm:ss A'))
        const end = new Date(this.$moment(this.to).add(1, 'days').format('MM/DD/YYYY hh:mm:ss A'))
        this.reports = []
        if (this.topic === 'All') {
          this.$db
            .collection('workOrders')
            .where('createdDate', '>', start)
            .where('createdDate', '<', end)
            .where('department', '==', this.department)
            .get()
            .then((querySnapshot) => this.addReport(querySnapshot))
            .then((response) => {
              let csv = 'Assigned To,Building,Department,Created,Closed,Status,Type,Subject,Description,User\n'
              for (let i = 0; i < this.reports.length; i++) {
                const doc = this.reports[i]
                let staffDepartment = ''
                if (doc.data().workOrderType && doc.data().workOrderType === 'PM') {
                  staffDepartment = (doc.data().departmentIn) ? doc.data().departmentIn : ''
                } else {
                  staffDepartment = (doc.data().staffDepartment) ? doc.data().staffDepartment : ''
                }
                const displayName = (doc.data().assignedTo && doc.data().assignedTo.displayName) ? doc.data().assignedTo.displayName : ''
                const building = (doc.data().building) ? doc.data().building : ''
                const createdDate = (doc.data().createdDate) ? this.processDate(doc.data().createdDate) : ''
                const closedDate = (doc.data().closedDate) ? this.processDate(doc.data().closedDate) : ''
                const status = (doc.data().status) ? doc.data().status : ''
                const workOrderType = (doc.data().workOrderType) ? doc.data().workOrderType : ''
                const subject = (doc.data().subject) ? doc.data().subject.replace(/<[^>]*>?/gm, '').replace(/,/g, ' ').replace(/&/g, ' ').replace(/\+/g, ' ').replace(/=/g, ' ').replace(/%5B/g, '[').replace(/%5D/g, ']').replace(/nbsp;/g, '') : ''
                const description = (doc.data().description) ? doc.data().description.replace(/<[^>]*>?/gm, '').replace(/,/g, ' ').replace(/&/g, ' ').replace(/\+/g, ' ').replace(/=/g, ' ').replace(/%5B/g, '[').replace(/%5D/g, ']').replace(/nbsp;/g, '') : ''
                const user = (doc.data().user) ? doc.data().user : ''
                csv += `${displayName},${building},${staffDepartment},${createdDate},${closedDate},${status},${workOrderType},${subject},${description},${user}\n`
              }
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.setAttribute('href', url)
              link.setAttribute('download', `WorkOrderReport_${this.$moment(this.from).format('MM/DD/YYYY')}_${this.$moment(this.to).format('MM/DD/YYYY')}.csv`)
              link.style.visibility = 'hidden'
              document.body.appendChild(link)
              link.click()
              this.loading = false
              setTimeout(() => {
                document.body.removeChild(link)
              }, 1000)
            })
            .catch((error) => {
              this.loading = false
              this.$store
                .dispatch('updateLocalErrors', error)
            })
        } else {
          this.$db
            .collection('workOrders')
            .where('createdDate', '>', start)
            .where('createdDate', '<', end)
            .where('department', '==', this.department)
            .where('workOrderType', '==', this.topic)
            .get()
            .then((querySnapshot) => this.addReport(querySnapshot))
            .then((response) => {
              console.log(this.reports.length)
              let csv = 'Assigned To,Building,Department,Created,Closed,Status,Type,Subject,Description,User\n'
              for (let i = 0; i < this.reports.length; i++) {
                const doc = this.reports[i]
                let staffDepartment = ''
                if (doc.data().workOrderType && doc.data().workOrderType === 'PM') {
                  staffDepartment = (doc.data().departmentIn) ? doc.data().departmentIn : ''
                } else {
                  staffDepartment = (doc.data().staffDepartment) ? doc.data().staffDepartment : ''
                }
                const displayName = (doc.data().assignedTo && doc.data().assignedTo.displayName) ? doc.data().assignedTo.displayName : ''
                const building = (doc.data().building) ? doc.data().building : ''
                const createdDate = (doc.data().createdDate) ? this.processDate(doc.data().createdDate) : ''
                const closedDate = (doc.data().closedDate) ? this.processDate(doc.data().closedDate) : ''
                const status = (doc.data().status) ? doc.data().status : ''
                const workOrderType = (doc.data().workOrderType) ? doc.data().workOrderType : ''
                const subject = (doc.data().subject) ? doc.data().subject.replace(/<[^>]*>?/gm, '').replace(/,/g, ' ').replace(/&/g, ' ').replace(/\+/g, ' ').replace(/=/g, ' ').replace(/%5B/g, '[').replace(/%5D/g, ']').replace(/nbsp;/g, '') : ''
                const description = (doc.data().description) ? doc.data().description.replace(/<[^>]*>?/gm, '').replace(/,/g, ' ').replace(/&/g, ' ').replace(/\+/g, ' ').replace(/=/g, ' ').replace(/%5B/g, '[').replace(/%5D/g, ']').replace(/nbsp;/g, '') : ''
                const user = (doc.data().user) ? doc.data().user : ''
                csv += `${displayName},${building},${staffDepartment},${createdDate},${closedDate},${status},${workOrderType},${subject},${description},${user}\n`
              }
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.setAttribute('href', url)
              link.setAttribute('download', `WorkOrderReport_${this.$moment(this.from).format('MM/DD/YYYY')}_${this.$moment(this.to).format('MM/DD/YYYY')}.csv`)
              link.style.visibility = 'hidden'
              document.body.appendChild(link)
              link.click()
              this.loading = false
              setTimeout(() => {
                document.body.removeChild(link)
              }, 1000)
            })
            .catch((error) => {
              this.loading = false
              this.$store
                .dispatch('updateLocalErrors', error)
            })
        }
      }
    },
    processDate (date) {
      if (typeof date === 'object') {
        return this.$moment(date.toDate()).format('MM/DD/YYYY hh:ss A')
      } else {
        return date
      }
    }
  }
}
</script>
