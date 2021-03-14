<!--
Component to handle manually adding users to the system.
-->
<template>
  <div>
    <v-card>
      <v-card-title
        primary-title
        class="subtitle-1"
      >
        New User
      </v-card-title>
      <v-divider />
      <v-card-text>
        Manually add a new user who does not have a licensed 365 account. You need to add a nonlicensed account first and make note of the Display Name you want to use and the User Id created in the 365 account. The user id MUST match what you put in the input field below. You also must use a valid email, you can use an email that is not an office 365 email, preferably one the user will use so they will receive updates from the system.
      </v-card-text>
      <v-card-text>
        <v-text-field
          v-model="userId"
          name="userId"
          label="User Id"
          outlined
          placeholder="User Id"
          :error-messages="userIdErrors"
        />
        <v-text-field
          v-model="displayName"
          name="displayName"
          label="Display Name"
          outlined
          placeholder="Display Name"
          :error-messages="displayNameErrors"
        />
        <v-text-field
          v-model="email"
          name="email"
          label="Email"
          outlined
          placeholder="Email"
          :error-messages="emailErrors"
        />
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="primary"
          depressed
          :loading="loading"
          @click="claims"
        >
          save
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'

export default {
  mixins: [validationMixin],
  validations: {
    userId: {
      required
    },
    displayName: {
      required
    },
    email: {
      required
    }
  },
  data () {
    return {
      userId: null,
      displayName: null,
      email: null,
      loading: false
    }
  },
  computed: {
    userIdErrors () {
      const errors = []
      if (!this.$v.userId.$dirty) { return errors }
      !this.$v.userId.required && errors.push('Required.')
      return errors
    },
    displayNameErrors () {
      const errors = []
      if (!this.$v.displayName.$dirty) { return errors }
      !this.$v.displayName.required && errors.push('Required.')
      return errors
    },
    emailErrors () {
      const errors = []
      if (!this.$v.email.$dirty) { return errors }
      !this.$v.email.required && errors.push('Required.')
      return errors
    }
  },
  methods: {
    claims () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.loading = true
        // Send new User creation to backend @/functions/index.js
        this.$axios
          .request({
            url: '/user/create',
            method: 'POST',
            data: {
              displayName: this.displayName,
              email: this.email,
              reqId: this.$firebase.auth().currentUser.uid,
              userId: this.userId
            }
          })
          // Function in @/store/actions.js, updates the user's access claims
          .then((response) => this.$store
            .dispatch('changeAccess', {
              reqId: this.$firebase.auth().currentUser.uid,
              userId: this.userId,
              customClaims: {
                admin: false,
                facilities: false,
                bioMed: false,
                dietary: false,
                evs: false,
                grounds: false,
                it: false,
                managerDietary: false,
                managerEVS: false,
                managerMaint: false,
                staff: true,
                transportation: false
              }
            })
          )
          // Update user entry in database
          .then((result) => this.$db
            .collection('users')
            .doc(this.userId)
            .set({
              displayName: this.displayName,
              email: this.email
            }, { merge: true })
          )
          .then((response) => {
            alert('Added')
            this.loading = false
          })
          .catch((error) => {
            this.loading = false
            this.$store
              .dispatch('updateLocalErrors', error)
          })
      }
    }
  }
}
</script>
