<!--
Error dialog component, handles UX for errors throughout app
Can be found in both layouts files
Relies on Vuex store for data
-->
<template>
  <v-dialog
    v-model="dialog"
    persistent
    width="300"
  >
    <v-card
      v-if="error"
    >
      <v-card-title
        primary-title
        class="title"
      >
        <v-icon
          color="error"
        >
          mdi-alert
        </v-icon>
        &nbsp;An Error Has Occured!
      </v-card-title>
      <v-card-text>
        {{ error.message }}
      </v-card-text>
      <v-card-actions>
        <div
          class="flex-grow-1"
        />
        <v-btn
          color="primary"
          text
          @click="clearError"
        >
          Okay
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data () {
    return {
      dialog: false
    }
  },
  computed: {
    // Get errors from Vuex store
    error () {
      return this.$store.state.localErrors
    }
  },
  watch: {
    // Control dialog if there is an error
    error (val) {
      this.dialog = (Object.keys(val).length > 0) ? true : false
    }
  },
  methods: {
    // Clears error upon dismissal of dialog
    clearError () {
      this.$store
        .dispatch('updateLocalErrors', {})
    }
  }
}
</script>
