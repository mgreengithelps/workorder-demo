<template>
  <v-card>
    <v-card-title
      primary-title
      class="title"
    >
      Hello {{ user.displayName }}
    </v-card-title>
    <v-card-title
      class="subtitle-1 pt-0"
    >
      Welcome to DEMO Work Order support system.
    </v-card-title>
    <v-card-text>
      You can review your current work orders or submit a new work order by clicking on the&nbsp;
      <v-btn
        small
        depressed
        :to="`/${userName}/workorder`"
      >
        Work Order
        <v-icon
          color="primary"
          :size="20"
        >
          mdi-help-circle
        </v-icon>
      </v-btn>
      &nbsp;tab in the menu.
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
