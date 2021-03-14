<template>
  <v-data-table
    :headers="headers"
    :items="users"
    :items-per-page="100"
  >
    <template
      v-slot:item="{ item }"
    >
      <tr
        v-if="item && typeof item === 'object'"
        style="cursor:pointer"
        @click="$router.push(`users/${item.userId}`)"
      >
        <td>
          {{ item.displayName }}
        </td>
      </tr>
    </template>
  </v-data-table>
</template>

<script>
export default {
  data () {
    return {
      headers: [
        {
          text: 'User Name',
          value: 'displayName'
        }
      ]
    }
  },
  computed: {
    users () { return this.$store.state.users }
  }
}
</script>
