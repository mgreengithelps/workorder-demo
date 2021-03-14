<template>
  <v-row
    justify="center"
    align="center"
    style="height:100vh"
  >
    <v-col
      cols="12"
      sm="8"
      md="4"
      lg="3"
      class="loginWindow"
    >
      <v-card
        :class="{
          'pt-5 loginWindow': $vuetify.breakpoint.smAndDown,
          'elevation-19 pt-3 loginWindow': $vuetify.breakpoint.mdAndUp
        }"
      >
        <v-img
          contain
          height="125"
          :src="require('@/assets/img/.svg')"
        />
        <v-card-text
          :class="{
            'text-center subheading mt-3': $vuetify.breakpoint.smAndDown,
            'text-center subheading': $vuetify.breakpoint.mdAndUp
          }"
        >
          Work Order and Asset Management
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="primary"
            block
            depressed
            nuxt
            :loading="signInLoading"
            @click="login"
          >
            Sign In
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  layout: 'login',
  data () {
    return {
      signInLoading: true
    }
  },
  watch: {
    $signInLoading (val) {
      console.log(val)
      this.signInLoading = val
    }
  },
  mounted () {
    // Route to dashboard if user is already signed in
    this.$firebase
      .auth()
      .onAuthStateChanged((user) => {
        if (user) {
          // Change route to user dashboard
          this.$router
            .push(`/${this.$firebase.auth().currentUser.displayName.replace(/\s+/g, '')}/dashboard`)
        } else {
          // No user, timeout loading icon
          setTimeout(() => { this.signInLoading = false }, 1000)
        }
      })
  },
  methods: {
    login () {
      // Login to MS with redirect, see msal.js plugin
      this.signInLoading = true
      this.$msal
        .loginRedirect(this.$tokenRequest)
    }
  }
}
</script>

<style scoped>
.loginWindow {
  height: auto;
}
@media (max-width: 599px) {
  .loginWindow {
    height: 100%;
  }
}
</style>
