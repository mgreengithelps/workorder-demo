<!--
I use this to run custom scripts against the database if I need to change a bunch of stuff around for some reason.
It is commented out in @/pages/_user/dashboard/index.vue
You can change whatever in this to suite your needs
-->
<template>
  <v-card>
    <v-card-text>
      <v-btn
        color="primary"
        depressed
        :loading="loading"
        @click="makeArrays"
      >
        Add Template Index
      </v-btn>
      <v-progress-linear
        :value="progress"
        color="primary"
        class="my-3"
      />
      <span>
        {{ done }} / {{ total }}
      </span>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  data () {
    return {
      done: 0,
      loading: false,
      progress: 0,
      total: 0
    }
  },
  methods: {
    loop (querySnapshot) {
      return new Promise((resolve, reject) => {
        this.total = querySnapshot.docs.length
        try {
          (async () => {
            for (let i = 0; i < this.total; i++) {
              await this.toIndex(querySnapshot.docs[i], i)
                .catch((error) => reject(error))
            }
            resolve({ message: 'done' })
          })()
        } catch (e) {
          reject(e)
        }
      })
    },
    toIndex (doc, i) {
      return new Promise((resolve, reject) => {
        try {
          console
            .log(doc.id)
          const arr = []
          const pms = (doc.data().pms && Array.isArray(doc.data().pms) && doc.data().pms.length > 0) ? doc.data().pms : null
          if (pms) {
            for (let c = 0; c < pms.length; c++) {
              if (pms[c].template) {
                arr
                  .push(pms[c].template)
              }
            }
          }
          // Remove duplicate entries
          const descIndex = arr.filter((elem, index, self) => { return index === self.indexOf(elem) })
          this.$db
            .collection('assets')
            .doc(doc.id)
            .update({ templateIndex: descIndex })
            .then((response) => {
              this.done = i + 1
              this.progress = this.done / this.total * 100
              resolve(response)
            })
        } catch (e) {
          reject(e)
        }
      })
    },
    makeArrays () {
      this.loading = true
      this.$db
        .collection('assets')
        .get()
        .then((querySnapshot) => this.loop(querySnapshot))
        .then((result) => {
          setTimeout(() => {
            this.done = 0
            this.progress = 0
            this.total = 0
            this.loading = false
          }, 500)
        })
        .catch((error) => {
          console.error(error)
          setTimeout(() => {
            this.done = 0
            this.progress = 0
            this.total = 0
            this.loading = false
          }, 500)
        })
    }
  }
}
</script>
