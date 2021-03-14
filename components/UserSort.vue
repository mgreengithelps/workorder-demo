<template>
  <v-select
    v-model="letter"
    :items="letters"
    :loading="loading"
    :loader-height="4"
    label="Sort"
    prepend-inner-icon="mdi-table-search"
    placeholder="Sort"
    :outlined="$vuetify.breakpoint.mdAndUp"
    @input="alphaSort"
  />
</template>

<script>
export default {
  data () {
    return {
      letter: null,
      letters: [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z'
      ],
      loading: false
    }
  },
  mounted () {
    this.$bus
      .$on('clearUsersLetter', () => { this.letter = null })
  },
  methods: {
    alphaSort (letter) {
      this.loading = true
      this.$store
        .dispatch('updateUsers')
        .then(() => this.$store
          .dispatch('sortUsers', { letter })
        )
        .then(() => { this.loading = false })
        .catch((error) => {
          this.loading = false
          this.$store
            .dispatch('updateLocalErrors', error)
        })
    }
  }
}
</script>
