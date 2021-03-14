<!--
Shows errors for admin to review
-->
<template>
  <v-card>
    <v-card-title
      primary-title
      class="subtitle-1"
    >
      Recent Errors
    </v-card-title>
    <v-divider />
    <div
      v-for="(items, index) in errors"
      :key="index"
    >
      <v-card-text
        class="caption pb-0 font-weight-bold"
      >
        {{ items.date }}
      </v-card-text>
      <v-card-text
        class="caption pb-0 pt-1"
      >
        {{ items.error.message }}
      </v-card-text>
      <v-card-text
        class="caption pb-0 pt-1"
      >
        <i>
          {{ items.user }}
        </i>
      </v-card-text>
    </div>
    <v-card-actions>
      <div
        class="flex-grow-1"
      />
      <v-btn
        color="primary"
        text
        to="dashboard/error-report"
      >
        Show All Errors
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  computed: {
    errors () { return this.$store.state.errors }
  },
  beforeMount () { this.getData() },
  methods: {
    getData () {
      this.$store
        .dispatch('getErrors', 5)
        .catch((error) => console.error(error))
    }
  }
}
</script>
