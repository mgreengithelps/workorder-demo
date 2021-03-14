<template>
  <v-container
    class="px-0"
  >
    <v-row>
      <v-col
        cols="12"
        sm="12"
        md="6"
      >
        <span
          class="headline"
        >
          User Access
        </span>
        <br>
        <span
          class="caption"
        >
          Sets UI and Database access level for User
        </span>
        <v-radio-group
          v-model="customClaims"
        >
          <v-radio
            value="staff"
            :readonly="nonAdmin"
            name="customClaims"
            label="Staff"
            color="primary"
          />
          <v-radio
            value="facilities"
            :readonly="nonAdmin"
            name="customClaims"
            label="Facilities"
            color="primary"
          />
          <v-radio
            value="managerMaint"
            :readonly="nonAdmin"
            name="customClaims"
            label="Facilities Manager"
            color="primary"
          />
          <v-radio
            value="bioMed"
            :readonly="nonAdmin"
            name="customClaims"
            label="Bio Med"
            color="primary"
          />
          <v-radio
            value="dietary"
            :readonly="nonAdmin"
            name="customClaims"
            label="Dietary"
            color="primary"
          />
          <v-radio
            value="managerDietary"
            :readonly="nonAdmin"
            name="customClaims"
            label="Dietary Manager"
            color="primary"
          />
          <v-radio
            value="grounds"
            :readonly="nonAdmin"
            name="customClaims"
            label="Grounds"
            color="primary"
          />
          <v-radio
            value="evs"
            :readonly="nonAdmin"
            name="customClaims"
            label="House Keeping"
            color="primary"
          />
          <v-radio
            value="managerEVS"
            :readonly="nonAdmin"
            name="customClaims"
            label="House Keeping Manager"
            color="primary"
          />
          <v-radio
            value="it"
            :readonly="nonAdmin"
            name="customClaims"
            label="IT"
            color="primary"
          />
          <v-radio
            value="transportation"
            :readonly="nonAdmin"
            name="customClaims"
            label="Transportation"
            color="primary"
          />
          <v-radio
            value="admin"
            :readonly="!iAmClaims.admin"
            name="customClaims"
            label="Admin"
            color="primary"
          />
        </v-radio-group>
      </v-col>
      <v-col
        v-if="iAmClaims.admin || iAmClaims.managerMaint"
        cols="12"
        sm="12"
        md="6"
      >
        <span
          class="headline"
        >
          Facility Access
        </span>
        <br>
        <span
          class="caption"
        >
          Sets access to Facilities
        </span>
        <v-container
          class="px-0"
        >
          <v-row>
            <v-col
              cols="12"
            >
              Current Access
            </v-col>
            <v-col
              v-for="(selection, i) in selections"
              :key="i"
              cols="12"
              sm="12"
              md="6"
            >
              <v-btn
                depressed
                rounded
                color="success"
                @click="changeSelection(selection, i, 'subtract')"
              >
                <v-icon
                  left
                >
                  mdi-check-circle
                </v-icon>
                {{ selection.text }}
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
        <v-container
          class="px-0"
        >
          <v-row>
            <v-col
              cols="12"
            >
              Add Access
            </v-col>
            <v-col
              v-for="(item, i) in buildings"
              :key="i"
              cols="12"
            >
              <v-btn
                v-if="!selections.includes(item)"
                depressed
                rounded
                color="primary"
                @click="changeSelection(item, i, 'add')"
              >
                <v-icon
                  left
                >
                  mdi-plus-circle
                </v-icon>
                {{ item.text }}
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data () {
    return {
      buildings: [
        {
          text: '',
          value: ''
        }
      ],
      selections: []
    }
  },
  computed: {
    customClaims: {
      get () {
        let val = null
        Object
          .keys(this.$store.state.singleUser.customClaims)
          .forEach((k) => {
            if (this.$store.state.singleUser.customClaims[k]) { val = k }
          })
        return val
      },
      set (value) {
        const arr = {}
        Object
          .keys(this.$store.state.singleUser.customClaims)
          .forEach((k) => { arr[k] = false })
        arr[value] = true
        this.$store
          .dispatch('changeAccess', {
            reqId: this.$firebase.auth().currentUser.uid,
            userId: this.$route.params.id,
            customClaims: arr
          })
          .catch((error) => {
            this.$store
              .dispatch('updateLocalErrors', error)
          })
      }
    },
    iAmClaims () { return this.$store.state.claims },
    nonAdmin () {
      if (this.iAmClaims.admin) {
        return false
      } else if (this.claims !== 'admin') {
        return false
      } else {
        return true
      }
    },
    facilities () {
      return this.$store.state.singleUser.facilities
    }
  },
  watch: {
    facilities (value) {
      this.selections = []
      for (let i = 0; i < value.length; i++) {
        for (let n = 0; n < this.buildings.length; n++) {
          if (this.buildings[n].text === this.value[i].text) {
            this.buildings
              .splice(n, 1)
          }
        }
        this.selections
          .push(value[i])
      }
    },
    selections (value) {
      this.$store
        .dispatch('updateFacilties', {
          id: this.$route.params.id,
          facilities: value
        })
    }
  },
  beforeMount () {
    this.getSelections()
  },
  beforeDestroy () {
    this.selections = []
    this.buildings = [
      {
        text: '',
        value: ''
      }
    ]
    this.$store
      .commit('setSingleUser', {})
  },
  methods: {
    changeSelection (item, i, type) {
      if (type === 'add') {
        // this.selections.push(item)
        this.selections
          .splice(i, 0, item)
        this.buildings
          .splice(i, 1)
      } else {
        this.selections
          .splice(i, 1)
        this.buildings
          .splice(i, 0, item)
      }
    },
    getSelections () {
      this.selections = []
      if (this.facilities) {
        for (let i = 0; i < this.facilities.length; i++) {
          for (let n = 0; n < this.buildings.length; n++) {
            if (this.buildings[n].text === this.facilities[i].text) {
              this.buildings
                .splice(n, 1)
            }
          }
          this.selections
            .push(this.facilities[i])
        }
      }
    }
  }
}
</script>
