<!-- View all Users for Users Page -->
<template>
  <v-container
    fluid
    :class="{
      'px-3 pt-0': $vuetify.breakpoint.mdAndUp,
      'pa-1': $vuetify.breakpoint.smAndDown
    }"
  >
    <v-row>
      <v-col
        cols="12"
      >
        <v-card
          outlined
        >
          <span
            ref="userScroll"
          />
          <v-card-title
            class="display-1 pb-3"
          >
            Users
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-container
              fluid
              class="pa-0"
            >
              <v-row>
                <v-col
                  cols="10"
                  sm="9"
                  class="pr-1"
                >
                  <v-text-field
                    v-model="searchName"
                    name="searchName"
                    append-icon="mdi-refresh"
                    prepend-inner-icon="mdi-table-search"
                    :outlined="$vuetify.breakpoint.mdAndUp"
                    label="Search User by Name"
                    placeholder="Search User by Name"
                    :loading="loading"
                    @click:append="refresh"
                    @click:prepend-inner="search"
                    @keyup.enter="search"
                  />
                </v-col>
                <v-col
                  cols="2"
                  sm="3"
                  class="pl-1"
                >
                  <UserSort />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-divider />
          <UsersTable />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  components: {
    UserSort: () => import('@/components/UserSort.vue'),
    UsersTable: () => import('@/components/UsersTable.vue')
  },
  data () {
    return {
      loading: false,
      searchName: null
    }
  },
  methods: {
    refresh () {
      // Return back to all users
      this.loading = 'info'
      this.searchName = null
      this.$bus
        .$emit('clearUsersLetter')
      this.$store
        .dispatch('updateUsers')
        .then(() => { this.loading = false })
        .catch((error) => {
          this.loading = false
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    search () {
      if (!this.searchName) {
        this.refresh()
      } else {
        this.loading = 'info'
        this.$store
          .dispatch('updateUsers')
          .then(() => this.$store
            .dispatch('searchUsers', { searchName: this.searchName })
          )
          .then(() => { this.loading = false })
          .catch((error) => {
            this.$store
              .dispatch('updateLocalErrors', error)
          })
      }
    }
  }
}
</script>
