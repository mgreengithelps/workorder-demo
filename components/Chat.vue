<template>
  <div
    :class="{
      'pa-5': $vuetify.breakpoint.mdAndUp,
      'pa-1': $vuetify.breakpoint.smAndDown
    }"
  >
    <v-text-field
      v-model="input"
      hide-details
      label="Leave a comment"
      placeholder="Leave a comment"
      outlined
      class="text-with-buttons"
      @keydown.enter="comment"
    >
      <template
        v-slot:append
      >
        <v-btn
          class="mx-0"
          text
          color="primary"
          :loading="fileLoading"
          @click="$refs.files.click()"
        >
          Upload File
        </v-btn>
        <input
          ref="files"
          type="file"
          style="display:none"
          @input="upload"
        >
        <v-btn
          class="mx-0"
          depressed
          color="primary"
          :loading="loading"
          @click="comment"
        >
          Post
        </v-btn>
      </template>
    </v-text-field>
    <v-timeline>
      <v-timeline-item
        fill-dot
        class="white--text mb-5"
        color="info"
        large
      >
        <template
          v-slot:icon
        >
          <span
            v-if="user && user.displayName"
          >
            {{ user.displayName.charAt(0).toUpperCase() }} {{ user.displayName.substr(user.displayName.indexOf(' ') + 1).charAt(0).toUpperCase() }}
          </span>
        </template>
      </v-timeline-item>
      <v-slide-x-transition
        group
      >
        <v-timeline-item
          v-for="(item, index) in comments"
          :key="index"
          class="mb-3"
          :left="item.uid !== user.uid"
          :right="item.uid === user.uid"
          :color="(item.uid === user.uid) ? 'info' : 'primary'"
          small
          fill-dot
        >
          <v-card
            :color="(item.uid === user.uid) ? 'info' : 'primary'"
            outlined
          >
            <v-card-title
              class="caption"
            >
              <span>
                {{ item. displayName }}
              </span>
              &ensp;
              <span
                style="color: rgba(255, 255, 255, 0.7)"
              >
                {{ item.time }}
              </span>
            </v-card-title>
            <v-card-text
              v-if="item.file && item.file.length > 0"
            >
              <div
                v-for="(f, i) in item.file"
                :key="i"
              >
                <v-btn
                  small
                  rounded
                  depressed
                  color="white"
                  :href="f.url"
                  download
                  class="black--text"
                >
                  <v-icon
                    :size="20"
                    style="transform:rotate(-90deg)"
                  >
                    mdi-attachment
                  </v-icon>
                  &nbsp;{{ f.name }}
                </v-btn>
              </div>
            </v-card-text>
            <v-card-text
              class="body-1 white--text"
            >
              {{ item.text }}
            </v-card-text>
          </v-card>
        </v-timeline-item>
      </v-slide-x-transition>
    </v-timeline>
  </div>
</template>

<script>
export default {
  // Data provided by parent component
  props: {
    orderId: {
      type: String,
      default: null
    },
    ownerEmail: {
      type: String,
      default: null
    },
    ownerName: {
      type: String,
      default: null
    },
    workerId: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      canClose: false,
      comments: [],
      fileLoading: false,
      filesUploaded: [],
      fileUploadStatus: 0,
      id: null,
      input: null,
      loading: false
    }
  },
  computed: {
    timeline () { return this.$store.state.comments },
    user () { return this.$store.state.user }
  },
  watch: {
    // Update comments when timeline changes
    timeline (value) {
      if (value && value.id) {
        this.id = value.id
        const arr = []
        for (let i = 0; i < value.comments.length; i++) {
          arr[i] = value.comments[i]
        }
        this.comments = arr
      }
    }
  },
  beforeMount () { this.getComments() },
  methods: {
    getComments () {
      if (!this.orderId) { return setTimeout(() => { this.getComments() }, 150) }
      this.$store
        .dispatch('getComments', { orderId: this.orderId })
        .catch((error) => {
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    // Add comment to top of comments array
    commentUnshift (data) {
      return new Promise((resolve, reject) => {
        try {
          this.comments
            .unshift(data)
          this.loading = false
          this.input = null
          resolve(true)
        } catch (error) {
          this.loading = false
          this.fileLoading = false
          reject(error)
        }
      })
    },
    comment () {
      this.loading = true
      // Get date/time from api (@/functions/index.js)
      this.$store
        .dispatch('getDateAndTime')
        // Add comment to comments
        .then((response) => this
          .commentUnshift({
            displayName: this.user.displayName,
            email: this.user.email,
            file: this.filesUploaded,
            text: this.input,
            time: `${response.date} ${response.time}`,
            uid: this.user.uid
          })
        )
        // Send comments to actions to update
        .then((response) => this.$store
          .dispatch('updateComments', {
            id: this.id,
            orderId: this.orderId,
            comments: this.comments,
            ignoreEmail: this.user.email,
            ownerEmail: this.ownerEmail,
            ownerName: this.ownerName
          })
        )
        // Update ticket doc with comment count
        .then(() => this.$db
          .collection('workOrders')
          .doc(this.orderId)
          .get()
        )
        .then((doc) => this.commentCount(doc))
        .then(() => {
          this.$refs.files.value = ''
          this.fileLoading = false
          this.filesUploaded.length = 0
        })
        .catch((error) => {
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    },
    // Set amount of comments in ticket and set unread number
    commentCount (doc) {
      return new Promise((resolve, reject) => {
        const commentCount = (this.comments && this.comments.length > 0) ? this.comments.length : 1
        const unreadComments = (doc.data().unreadComments) ? doc.data().unreadComments : {}
        Object
          .keys(unreadComments)
          .forEach((k) => {
            let count = unreadComments[k]
            count++
            unreadComments[k] = count
          })
        if (!unreadComments[this.workerId]) { unreadComments[this.$firebase.auth().currentUser.uid] = commentCount }
        unreadComments[this.$firebase.auth().currentUser.uid] = 0
        this.$db
          .collection('workOrders')
          .doc(this.orderId)
          .update({
            commentCount,
            unreadComments
          })
          .then((response) => resolve(response))
          .catch((error) => reject(error))
      })
    },
    // Upload file into firebase storage
    upload (event) {
      if (event.target.files[0] && event.target.files[0].size < 20000000) {
        this.fileLoading = true
        const file = event.target.files[0]
        const uploadTask = this.$storage
          .ref()
          .child(`workOrders/${this.$firebase.auth().currentUser.uid}/${file.name}`)
          .put(file)
        // Track upload status
        uploadTask
          .on('state_changed', (snapshot) => {
            this.fileUploadStatus = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          }, (error) => {
            this.fileUploadStatus = 0
            this.fileLoading = false
            this.$store
              .dispatch('updateLocalErrors', error)
          }, () => {
            uploadTask.snapshot.ref
              .getDownloadURL()
              .then((downloadURL) => {
                this.fileUploadStatus = 0
                this.filesUploaded
                  .push({
                    name: file.name,
                    url: downloadURL
                  })
                this.comment()
              })
          })
      } else {
        this.$refs.files.value = ''
        this.$store
          .dispatch('updateLocalErrors', new Error('Your file is too big, please select a file under 20 MB. Thank you.'))
      }
    }
  }
}
</script>

<style>
.text-with-buttons.v-text-field--enclosed .v-input__append-inner {
  margin-top: 10px;
}
</style>
