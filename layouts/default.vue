<template>
  <v-app>
    <v-app-bar
      fixed
      app
      flat
      dense
    >
      <!--:hide-on-scroll="$vuetify.breakpoint.smAndDown"> -->
      <v-toolbar-title
        class="body-1"
      >
        Demo
      </v-toolbar-title>
      <v-spacer />
      <v-btn
        v-show="$vuetify.breakpoint.smAndDown"
        icon
        aria-label="Menu"
        @click="drawer = !drawer"
      >
        <v-icon>
          mdi-menu
        </v-icon>
      </v-btn>
    </v-app-bar>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :right="$vuetify.breakpoint.smAndDown"
      :mobile-break-point="960"
      mini-variant-width="75"
      fixed
      app
    >
      <v-list
        class="py-0"
      >
        <v-list-item
          v-show="$vuetify.theme.dark"
        >
          <v-img
            alt="spot-logo"
            :src="require('~/assets/img/spot_white.svg')"
            :width="25"
            :height="25"
            contain
            class="spot-logo"
          />
        </v-list-item>
        <v-list-item
          v-show="!$vuetify.theme.dark"
        >
          <v-img
            alt="spot-logo"
            :src="require('~/assets/img/spot_dark.svg')"
            :width="25"
            :height="25"
            contain
            class="spot-logo"
          />
        </v-list-item>
        <v-divider />
        <v-list-item>
          {{ initials }}
        </v-list-item>
        <v-hover>
          <v-list-item
            slot-scope="{ hover }"
            nuxt
            :to="`/${userName}/dashboard`"
          >
            <v-list-item-action
              class="align-center"
            >
              <v-icon
                class="pb-1"
                :size="15"
              >
                mdi-home
              </v-icon>
              <v-slide-y-reverse-transition>
                <span
                  v-if="hover || $nuxt.$route.name === 'user-dashboard'"
                  :class="`${($nuxt.$route.name === 'user-dashboard') ? 'primary' : 'grey'}--text mini-text text-xs-center`"
                >
                  DASHBOARD
                </span>
              </v-slide-y-reverse-transition>
            </v-list-item-action>
          </v-list-item>
        </v-hover>
        <v-hover>
          <v-list-item
            slot-scope="{ hover }"
            nuxt
            :to="`/${userName}/workorder`"
          >
            <v-list-item-action
              class="align-center"
            >
              <v-icon
                class="pb-1"
                :size="15"
              >
                mdi-help-circle
              </v-icon>
              <v-slide-y-reverse-transition>
                <div
                  v-if="hover || $nuxt.$route.name === 'user-workorder'"
                  :class="`${($nuxt.$route.name === 'user-workorder') ? 'primary' : 'grey'}--text mini-text text-xs-center item`"
                >
                  &nbsp;WORK
                  <br>
                  ORDER
                </div>
              </v-slide-y-reverse-transition>
            </v-list-item-action>
          </v-list-item>
        </v-hover>
        <v-hover
          v-show="isWorker"
        >
          <v-list-item
            slot-scope="{ hover }"
            nuxt
            :to="`/${userName}/assets`"
          >
            <v-list-item-action
              class="align-center"
            >
              <v-icon
                class="pb-1"
                :size="15"
              >
                mdi-monitor
              </v-icon>
              <v-slide-y-reverse-transition>
                <span
                  v-if="hover || $nuxt.$route.name === 'user-assets'"
                  :class="`${($nuxt.$route.name === 'user-assets') ? 'primary' : 'grey'}--text mini-text text-xs-center item`"
                >
                  ASSETS
                </span>
              </v-slide-y-reverse-transition>
            </v-list-item-action>
          </v-list-item>
        </v-hover>
        <v-hover
          v-show="isWorker"
        >
          <v-list-item
            slot-scope="{ hover }"
            nuxt
            :to="`/${userName}/templates`"
          >
            <v-list-item-action
              class="align-center"
            >
              <v-icon
                class="pb-1"
                :size="15"
              >
                mdi-text-box
              </v-icon>
              <v-slide-y-reverse-transition>
                <span
                  v-if="hover || $nuxt.$route.name === 'user-templates'"
                  :class="`${($nuxt.$route.name === 'user-templates') ? 'primary' : 'grey'}--text mini-text text-xs-center item`"
                >
                  TEMPLATES
                </span>
              </v-slide-y-reverse-transition>
            </v-list-item-action>
          </v-list-item>
        </v-hover>
        <v-hover
          v-show="isWorker"
        >
          <v-list-item
            slot-scope="{ hover }"
            nuxt
            :to="`/${userName}/users`"
          >
            <v-list-item-action
              class="align-center"
            >
              <v-icon
                class="pb-1"
                :size="15"
              >
                mdi-account-supervisor-circle
              </v-icon>
              <v-slide-y-reverse-transition>
                <span
                  v-if="hover || $nuxt.$route.name === 'user-users'"
                  :class="`${($nuxt.$route.name === 'user-users') ? 'primary' : 'grey'}--text mini-text text-xs-center item`"
                >
                  USERS
                </span>
              </v-slide-y-reverse-transition>
            </v-list-item-action>
          </v-list-item>
        </v-hover>
        <v-hover>
          <v-list-item
            slot-scope="{ hover }"
            @click="changeTheme"
          >
            <v-list-item-action
              class="align-center"
            >
              <v-icon
                class="pb-1"
                :size="15"
              >
                mdi-eye
              </v-icon>
              <v-slide-y-reverse-transition>
                <span
                  v-if="hover"
                  class="grey--text mini-text text-center item"
                >
                  THEME
                </span>
              </v-slide-y-reverse-transition>
            </v-list-item-action>
          </v-list-item>
        </v-hover>
        <v-hover>
          <v-list-item
            slot-scope="{ hover }"
            @click="logout"
          >
            <v-list-item-action
              class="align-center"
            >
              <v-icon
                class="pb-1"
                :size="15"
                style="transform: rotateY(180deg)"
              >
                mdi-exit-to-app
              </v-icon>
              <v-slide-y-reverse-transition>
                <span
                  v-if="hover"
                  :class="`${($nuxt.$route.name === 'user-workorder') ? 'primary' : 'grey'}--text mini-text text-xs-center item`"
                >
                  LOGOUT
                </span>
              </v-slide-y-reverse-transition>
            </v-list-item-action>
          </v-list-item>
        </v-hover>
      </v-list>
      <v-footer
        fixed
        class="transparent"
      >
        <span
          class="transparent grey--text caption pb-1"
        >
          &copy;
          <br>
          Demo {{ year }}
        </span>
      </v-footer>
    </v-navigation-drawer>
    <v-content>
      <!-- <FireWorks /> -->
      <nuxt />
    </v-content>
    <v-snackbar
      v-model="notificationAsk"
      :timeout="0"
    >
      Would you like to enable notifications?
      <v-btn
        depressed
        color="primary"
        @click.native="enableNotifications"
      >
        Yes
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="secondary"
        @click.native="notificationAsk = false"
      >
        Cancel
      </v-btn>
    </v-snackbar>
    <v-snackbar
      v-model="newUpdate"
      :timeout="0"
    >
      A New Update is Available!
      <v-btn
        text
        color="primary"
        @click.native="reload"
      >
        Refresh
      </v-btn>
      <v-btn
        text
        color="secondary"
        @click.native="newUpdate = false"
      >
        Ignore
      </v-btn>
    </v-snackbar>
    <ErrorReport />
  </v-app>
</template>

<script>
const linkWaiting = localStorage.getItem('linkWaiting')
export default {
  components: {
    ErrorReport: () => import('@/components/ErrorReport.vue')
  },
  data () {
    return {
      dark: false,
      drawer: this.drwr,
      miniVariant: true,
      newUpdate: false,
      notificationAsk: false,
      year: new Date().getFullYear()
    }
  },
  computed: {
    // Displays drawer if not mobile/tablet
    drwr () {
      if (this.$vuetify.breakpoint.smAndDown) {
        return false
      } else {
        return true
      }
    },
    // Show user name without spaces in the route
    userName () {
      if (this.user.displayName) {
        return this.user.displayName.replace(/\s+/g, '')
      } else {
        return 'user'
      }
    },
    // Initials for menu
    initials () {
      if (this.user.displayName) {
        return `${this.user.displayName.charAt(0).toUpperCase()} ${this.user.displayName.substr(this.user.displayName.indexOf(' ') + 1).charAt(0).toUpperCase()}`
      } else {
        return 'AH'
      }
    },
    // Checks if user is an admin
    isAdmin () {
      if (this.claims && this.claims.admin) {
        return true
      } else {
        return false
      }
    },
    // Checks if user is a worker, has access to get assigned work orders, etc.
    isWorker () {
      if (!this.claims || this.claims.staff === true || this.claims.dietary === true || this.claims.managerDietary === true) {
        return false
      } else {
        return true
      }
    },
    // User access level
    claims () { return this.$store.state.claims },
    // User information
    user () { return this.$store.state.user }
  },
  beforeMount () {
    this.newVersion()
    // this.registerNotifications()
    this.userAuth()
    this.setTheme()
    this.setDepartment()
  },
  methods: {
    // Stores theme changes in local storage
    changeTheme () {
      (this.$vuetify.theme.dark) ? this.$vuetify.theme.dark = false : this.$vuetify.theme.dark = true
      localStorage
        .setItem('theme', this.$vuetify.theme.dark)
    },
    // Function not in use, created to send push notifications
    enableNotifications () {
      if ('Notification' in window && this.$firebase.messaging.isSupported()) {
        Notification
          .requestPermission((status) => {
            this.notificationAsk = false
            if (status !== 'granted') {
              // TODO: Set date to ask again
            } else {
              this.$messaging
                .getToken()
                .then((currentToken) => {
                  if (currentToken) {
                    this.sendTokenToServer(currentToken)
                    this.refreshedToken()
                    this.$messaging
                      .onMessage((payload) => {
                        console.log('Message received. ', payload)
                      })
                  }
                })
                .catch((error) => {
                  console
                    .error(error)
                })
            }
          })
      }
    },
    async newVersion () {
      // Check if new version of Service Worker or cache is available,
      // if so pass worker to watch when its finished installing and alert user,
      // with snackbar, or if its just cache alert user there is an update
      // with a snackbar
      const sw = await navigator.serviceWorker
      if (sw) {
        sw
          .getRegistrations()
          .then((registrations) => {
            for (const worker of registrations) {
              if (worker.waiting && worker.installing) {
                this.trackInstalling(worker)
              }
            }
          })
        // BroadcastChannel API supported. Watch for update message
        if ('BroadcastChannel' in self) {
          const updatesChannel = new BroadcastChannel('new-update-channel')
          updatesChannel
            .addEventListener('message', (event) => { this.updateReady() })
        }
      }
    },
    // Not in use, used to register pushed notifications
    registerNotifications () {
      if ('Notification' in window && this.$firebase.messaging.isSupported()) {
        this.$messaging
          .getToken()
          .then((currentToken) => {
            if (currentToken) {
              this.sendTokenToServer(currentToken)
              this.refreshedToken()
              this.$messaging
                .onMessage((payload) => {
                  console
                    .log('Message received. ', payload)
                })
            } else {
              // TODO: Check if they have declined before, check date, and then show if expired
              this.notificationAsk = true
            }
          })
          .catch((error) => {
            console
              .error(error)
          })
      }
    },
    // Not in use, used for push notifications
    refreshedToken () {
      if ('Notification' in window && this.$firebase.messaging.isSupported()) {
        this.$messaging
          .onTokenRefresh(() => {
            this.$messaging
              .getToken()
              .then((refreshedToken) => {
                this.sendTokenToServer(refreshedToken)
              })
              .catch((error) => {
                console
                  .error(error)
              })
          })
      }
    },
    // Refresh the page
    reload () { location.reload(true) },
    // Not in use, used for push notifications
    sendTokenToServer (token) {
      if (!this.$firebase.auth().currentUser) { return setTimeout(() => { this.sendTokenToServer(token) }, 250) }
      console.log(token)
      this.$db
        .collection('users')
        .doc(this.$firebase.auth().currentUser.uid)
        .update({ messageToken: token })
        .catch((error) => {
          console
            .error(error)
        })
    },
    // Sets UI based on User's Access level
    setDepartment () {
      if (this.$store.state.department) {
        return
      } else if (Object.keys(this.claims).length === 0) {
        return setTimeout(() => { this.setDepartment() }, 150)
      }
      let access = null
      Object.keys(this.claims)
        .forEach((k) => { if (this.claims[k]) { access = k } })
      switch (access) {
        case 'admin':
          this.$store
            .commit('setAssetDepartment', 'it')
          break
        case 'managerEVS':
          this.$store
            .commit('setAssetDepartment', 'evs')
          break
        case 'managerMaint':
          this.$store
            .commit('setAssetDepartment', 'facilities')
          break
        default:
          this.$store
            .commit('setAssetDepartment', access)
          break
      }
    },
    // Listen for when new worker is installed then show snackbar
    trackInstalling (worker) {
      worker
        .addEventListener('statechange', () => {
          if (worker.state === 'installed') {
            worker
              .postMessage({ type: 'SKIP_WAITING' })
            this
              .updateReady(worker)
          }
        })
    },
    // Show snackbar when update is available
    updateReady (worker) { this.newUpdate = true },
    userAuth () {
      // Watch for User auth change in Firebase, reroute if not user, add data to store if user
      this.$firebase
        .auth()
        .onAuthStateChanged((user) => {
          if (!user) {
            localStorage
              .setItem('linkWaiting', this.$router.currentRoute.path)
            this.$router
              .push('/')
          } else {
            // If a linked is store because of a redirect, update route with right user name and redirect
            if (linkWaiting) {
              const regex = /\/(.*?)\//
              const strToMatch = linkWaiting
              const matched = regex.exec(strToMatch)
              const newRoute = strToMatch.replace(matched[1], this.$firebase.auth().currentUser.displayName.replace(/\s+/g, ''))
              this.$router.push(newRoute)
              localStorage.removeItem('linkWaiting')
            }
            // Basic User info
            this.$store
              .dispatch('updateUser', {
                displayName: user.displayName,
                email: user.email,
                uid: user.uid
              })
              .catch((error) => {
                this.$store
                  .dispatch('updateLocalErrors', error)
              })
            // User access claims
            this.$firebase.auth().currentUser
              .getIdTokenResult()
              .then((idTokenResult) => this.$store
                .dispatch('updateClaims', idTokenResult.claims)
              )
          }
        })
    },
    logout () {
      // Logout of MS on this App and Firebase
      this.$msal
        .logout()
      this.$firebase
        .auth()
        .signOut()
        .catch((error) => {
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    // Get theme from local storage and set it
    setTheme () {
      if (localStorage.getItem('theme') && localStorage.getItem('theme') === 'true') {
        this.$vuetify.theme.dark = true
      } else {
        this.$vuetify.theme.dark = false
      }
    }
  }
}
</script>

<style>
.mini-text {
  font-size: 0.65rem;
  letter-spacing: 0.1rem;
}
.spot-logo {
  width: 25px;
}
</style>
