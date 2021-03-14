<template>
  <v-dialog
    v-model="dialog"
    persistent
    width="500"
  >
    <v-card>
      <v-card-title
        class="primary white--text"
      >
        Reassign PMs
      </v-card-title>
      <v-card-text
        class="py-5"
      >
        <v-autocomplete
          v-model="from"
          :items="workers"
          :outlined="$vuetify.breakpoint.mdAndUp"
          hide-details
          label="Transfer PMs From"
          placeholder="Transfer PMs From"
        />
      </v-card-text>
      <v-card-text>
        <v-autocomplete
          v-model="to"
          :items="workers"
          :outlined="$vuetify.breakpoint.mdAndUp"
          hide-details
          label="Transfer PMs To"
          placeholder="Transfer PMs To"
        />
      </v-card-text>
      <v-card-text
        v-if="loading"
      >
        <v-progress-linear
          :value="progress"
          color="primary"
        />
        <div
          class="d-flex justify-end"
        >
          {{ completed }} out of {{ finishline }}
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn
          text
          color="secondary"
          @click="close"
        >
          Close
        </v-btn>
        <v-spacer />
        <v-btn
          depressed
          color="primary"
          @click="transfer"
        >
          Transfer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    dialog: {
      type: Boolean,
      default () {
        return false
      }
    }
  },
  data () {
    return {
      completed: 0,
      finishline: 0,
      from: null,
      loading: false,
      progress: 0,
      to: null
    }
  },
  computed: {
    assetDepartment () { return this.$store.state.assetDepartment },
    workers () { return this.$store.state.assetWorkers }
  },
  methods: {
    close () {
      this.$bus.$emit('closePmTransfer')
    },
    loop (querySnapshot) {
      (async () => {
        for (let i = 0; i < querySnapshot.docs.length; i++) {
          const doc = querySnapshot.docs[i].data()
          doc.id = querySnapshot.docs[i].id
          await this.updatePM(doc)
          const divide = i / this.finishline
          this.progress = Math.round(divide * 100)
          this.completed = i
          if (this.completed === this.finishline) {
            this.loading = false
            this.close()
          }
        }
      })()
    },
    transfer () {
      if (this.from && this.to) {
        this.loading = true
        this.$db
          .collection('assets')
          .where('department', '==', this.assetDepartment)
          .get()
          .then((querySnapshot) => {
            this.finishline = querySnapshot.docs.length - 1
            this.loop(querySnapshot)
          })
          .catch((error) => {
            this.$store
              .dispatch('updateLocalErrors', error)
          })
      }
    },
    updatePM (doc) {
      return new Promise((resolve, reject) => {
        if (doc.pms && Array.isArray(doc.pms) && doc.pms.length > 0) {
          const pms = doc.pms
          let run = false
          for (let i = 0; i < pms.length; i++) {
            if (pms[i].assignedTo && pms[i].assignedTo.workerId && pms[i].assignedTo.workerId === this.from.workerId) {
              pms[i].assignedTo = this.to
              run = true
            }
          }
          if (run) {
            this.$db
              .collection('assets')
              .doc(doc.id)
              .update({ pms })
              .then((response) => resolve(response))
              .catch((error) => reject(error))
          } else {
            resolve({ message: 'No PM to update' })
          }
        } else {
          resolve({ message: 'No PM to update' })
        }
      })
    }
  }
}
</script>
