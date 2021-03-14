<template>
  <v-card>
    <v-card-title
      primary-title
      class="subtitle-1"
    >
      ReIndex Work Order Numbers
    </v-card-title>
    <v-divider />
    <v-card-text>
      Take note that this is an expensive read write operation as it will read and write over every work order in the system.
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn
        color="primary"
        depressed
        @click="number"
      >
        ReIndex
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  methods: {
    number () {
      this.$db
        .collection('workOrders')
        .where('workOrderType', '==', 'workorder')
        .orderBy('createdDate')
        .get()
        .then((querySnapshot) => {
          for (let i = 0; i < querySnapshot.docs.length; i++) {
            this.$db
              .collection('workOrders')
              .doc(querySnapshot.docs[i].id)
              .update({
                ticketNumber: i + 1
              })
              .then(() => {
                console.log(`Updated ${i + 1}`)
              })
          }
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }
}
</script>
