<!--
General Announcements componenet to be shown on the user's dashboard, currently commented out in @/pages/_user/dashboard/index.vue
-->
<template>
  <v-card>
    <v-card-title
      primary-title
      class="title"
    >
      <v-icon
        color="primary"
        :size="20"
      >
        mdi-help-circle
      </v-icon>
      &nbsp;
      AHN Announcements
    </v-card-title>
    <v-card-title
      class="subtitle-1 pt-0"
    >
      Flu Campaign has Started!
    </v-card-title>
    <v-card-text>
      Attention: DEMO Employees. Kick Flu Before It Kicks You! The Flu Vaccination Campaign is currently going on; make sure to find time to get your vaccination.
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  computed: {
    user () { return this.$store.state.user },
    userName () {
      if (this.user.displayName) {
        return this.user.displayName.replace(/\s+/g, '')
      } else {
        return null
      }
    }
  }
}
</script>
