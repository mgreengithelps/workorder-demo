<template>
  <v-card>
    <v-card-title
      primary-title
      class="subtitle-1"
    >
      Update User
    </v-card-title>
    <v-divider />
    <v-card-text>
      Update a Current User's email and Display Name. You will need their 365 account ID (same as their Firebase Document ID).
    </v-card-text>
    <v-card-text>
      <v-text-field
        v-model="uid"
        name="uid"
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
        @click="send"
      >
        save
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'

export default {
  mixins: [validationMixin],
  validations: {
    displayName: { required },
    email: { required },
    uid: { required }
  },
  data () {
    return {
      displayName: null,
      email: null,
      loading: false,
      uid: null
    }
  },
  computed: {
    userIdErrors () {
      const errors = []
      if (!this.$v.uid.$dirty) { return errors }
      !this.$v.uid.required && errors.push('Required.')
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
    send () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.loading = true
        this.$axios
          .request({
            url: '/user/update',
            method: 'POST',
            data: {
              displayName: this.displayName,
              email: this.email,
              uid: this.uid
            }
          })
          .then((response) => {
            alert('User has been updated!')
            this.loading = false
            this.displayName = null
            this.email = null
            this.uid = null
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
