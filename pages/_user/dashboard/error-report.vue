<template>
  <v-container
    v-if="iAmClaims.admin"
    fluid
    :class="{
      'pa-3': $vuetify.breakpoint.mdAndUp,
      'pa-1': $vuetify.breakpoint.smAndDown
    }"
  >
    <v-row>
      <v-col
        v-for="(error, index) in errors"
        :key="index"
        cols="12"
        sm="6"
        md="3"
        lg="4"
        class="pa-1"
      >
        <v-card
          outlined
        >
          <v-card-title
            class="subtitle-1 pb-0"
            primary-title
          >
            {{ error.user }}
          </v-card-title>
          <v-card-text
            class="subtitle-2"
          >
            {{ error.date }}
          </v-card-text>
          <v-expansion-panels
            focusable
          >
            <v-expansion-panel>
              <v-expansion-panel-header>
                Error Details
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-card-text>
                  {{ error.error.message }}
                </v-card-text>
                <v-card-text
                  style="word-break:break-word"
                >
                  {{ error.error.stack }}
                </v-card-text>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
          <v-card-actions>
            <div
              class="flex-grow-1"
            />
            <v-tooltip
              bottom
            >
              <template
                v-slot:activator="{ on }"
              >
                <v-btn
                  fab
                  depressed
                  color="primary"
                  v-on="on"
                  @click="resolve(error.id)"
                >
                  <v-icon>
                    mdi-database-check
                  </v-icon>
                </v-btn>
              </template>
              <span>
                Mark as Resolved
              </span>
            </v-tooltip>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  computed: {
    errors () { return this.$store.state.errors },
    iAmClaims () { return this.$store.state.claims }
  },
  beforeMount () { this.getData() },
  methods: {
    getData () {
      this.$store
        .dispatch('getErrors', 500)
        .catch((error) => {
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    resolve (id) {
      this.$db
        .collection('errors')
        .doc(id)
        .update({ resolved: true })
        .catch((error) => {
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    }
  }
}
</script>

<style>
.v-expansion-panel::before {
  box-shadow: none;
}
</style>
