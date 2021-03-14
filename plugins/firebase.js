import Vue from 'vue'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'
import 'firebase/analytics'
import 'firebase/performance'
if (!window.document.documentMode) {
  // Messaging does not work with IE, check if not IE then import
  import('firebase/messaging')
    .then(() => {
      if ('Notification' in window && firebase.messaging.isSupported()) {
        const messaging = firebase.messaging()
        messaging
          .usePublicVapidKey('')
        Vue.$messaging = Vue.prototype.$messaging = messaging
      }
    })
}

firebase
  .initializeApp({
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
  })
/*
firebase
  .firestore()
  .enablePersistence({ synchronizeTabs: true })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console
        .warn('[WARNING] Multiple tabs open, persistence can only be enabled in one tab at a time.')
    } else if (err.code === 'unimplemented') {
      console
        .warn('[WARNING] The current browser does not support all of the features required to enable persistence...')
    } else {
      console
        .error(err)
    }
  })
*/

Vue.$firebase = Vue.prototype.$firebase = firebase
Vue.$db = Vue.prototype.$db = firebase.firestore()
Vue.$storage = Vue.prototype.$storage = firebase.storage()

const db = firebase.firestore()

export default { db, firebase }

firebase
  .analytics()

const perf = firebase
  .performance()

Vue
  .use(perf)
