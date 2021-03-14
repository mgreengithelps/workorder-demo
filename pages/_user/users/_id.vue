<!-- Page to CRUD Ops for Single User Access and Assets -->
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
          v-if="user.displayName"
          outlined
        >
          <v-card-title>
            <v-icon
              class="primary--text"
              :size="100"
            >
              mdi-account-circle
            </v-icon>
          </v-card-title>
          <v-card-title
            class="display-1"
          >
            {{ user.displayName }}
          </v-card-title>
          <!-- Only show DB reference Number if Admin -->
          <v-card-title
            v-show="iAmClaims.admin"
            class="caption"
          >
            UID: {{ user.userId }}
          </v-card-title>
          <v-card-text
            class="caption"
          >
            Email: {{ user.email }}
          </v-card-text>
          <v-divider />
          <!-- Only show User Acces Change if Admin or IT -->
          <v-card-text
            v-show="iAmClaims.admin || iAmClaims.it"
          >
            <UserClaims />
          </v-card-text>
          <v-divider />
          <v-card-text>
            <p
              class="title"
            >
              User Assets
            </p>
            <p
              class="caption"
            >
              You can add a new Asset to the system and attach the User to the Asset here. If the asset already exists, please attach the user to the asset through the asset manager. You can also edit the user's current assets, and detach the user from the asset with the Detach button.
            </p>
            <!-- Add assets if they exist and add new ones with button press -->
            <div
              v-for="(item, index) in assets"
              :key="index"
            >
              <UserAssets
                :data-ref="index"
                :data-exists="(item.assetId) ? item.assetId : null"
                class="mb-5"
              />
            </div>
            <v-btn
              text
              color="primary"
              class="ml-0"
              @click="addAsset"
            >
              Add Asset
            </v-btn>
          </v-card-text>
          <v-divider />
          <!-- Delete User button, only accesible via Admin -->
          <v-card-actions
            v-show="iAmClaims.admin"
          >
            <div
              class="flex-grow-1"
            />
            <v-btn
              color="error"
              text
              @click="deleteDialog = true"
            >
              Delete User
            </v-btn>
          </v-card-actions>
        </v-card>
        <div
          v-else
          class="pa-5"
        >
          <v-progress-circular
            indeterminate
            color="info"
          />
        </div>
        <v-dialog
          v-model="deleteDialog"
          persistent
          width="500"
        >
          <v-card>
            <v-card-title
              :class="{
                'headline grey lighten-2': !$vuetify.dark,
                'headline': $vuetify.dark
              }"
              primary-title
            >
              Are you sure?
            </v-card-title>
            <v-card-text>
              This will PERMANENTLY delete the user information from the database and remove their auth user profile?
            </v-card-text>
            <v-divider />
            <v-card-actions>
              <div
                class="flex-grow-1"
              />
              <v-btn
                color="error"
                text
                :loading="deleteLoading"
                @click="deleteUser"
              >
                I accept
              </v-btn>
              <v-btn
                color="secondary"
                text
                @click="deleteDialog = false"
              >
                Cancel
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  components: {
    UserAssets: () => import('@/components/UserAssets.vue'),
    UserClaims: () => import('@/components/UserClaims.vue')
  },
  data () {
    return {
      assets: [],
      claimLoading: false,
      deleteDialog: false,
      deleteLoading: false
    }
  },
  computed: {
    iAmClaims () { return this.$store.state.claims },
    user () { return this.$store.state.singleUser }
  },
  beforeMount () {
    this.getUser()
    this.removeAsset()
  },
  methods: {
    // Add another asset field with button press
    addAsset () { this.assets.push({}) },
    // Send call to store to delete this user,
    // redirects back to users when finished
    deleteUser () {
      this.deleteLoading = true
      this.$store
        .dispatch('deleteUser', {
          reqId: this.$firebase.auth().currentUser.uid,
          userId: this.$route.params.id,
          category: this.user.displayName.charAt(0).toUpperCase()
        })
        .then(() => {
          this.deleteLoading = false
          this.$router.go(-1)
        })
        .catch((error) => {
          this.deleteLoading = false
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    // Get user from Users Store if populated, if not wait and rerun
    // until store is populated
    getUser () {
      if (!this.$firebase.auth().currentUser) {
        setTimeout(() => { this.getUser() }, 250)
      } else {
        this.$store
          .dispatch('updateSingleUser', {
            reqId: this.$firebase.auth().currentUser.uid,
            userId: this.$route.params.id
          })
          .then((response) => {
            this.setAssets()
            console.log(this.user)
          })
          .catch((error) => {
            this.$store
              .dispatch('updateLocalErrors', error)
          })
      }
    },
    // Remove asset on bus call from asset component, just deletes a new entry
    // if asset already exists, makes a call to store to detach from user
    removeAsset () {
      this.$bus
        .$on('removeAssets', (data) => {
          if (data.exists) {
            this.$store
              .dispatch('detachAsset', data)
              .then(() => {
                this.assets
                  .splice(data.refNumber, 1)
              })
              .catch((error) => {
                this.$store
                  .dispatch('updateLocalErrors', error)
              })
          } else {
            this.assets.splice(data.refNumber, 1)
            console.log(this.assets)
          }
        })
    },
    // Set assets for user if exists
    setAssets () {
      if (this.user.assets && this.user.assets.length > 0) {
        for (let i = 0; i < this.user.assets.length; i++) {
          this.assets[i] = this.user.assets[i]
        }
      }
    }
  }
}
</script>
