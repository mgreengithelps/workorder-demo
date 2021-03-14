import moment from 'moment'
import fb from '@/plugins/firebase'

const db = fb.db
const firebase = fb.firebase
const batchAssetUpdate = (querySnapshot, data) => {
  return new Promise((resolve, reject) => {
    const result = []
    const errors = []
    querySnapshot
      .forEach((doc) => {
        (async () => {
          await db
            .collection('assets')
            .doc(doc.id)
            .update(data)
            .then((response) => result.push(response))
            .catch((error) => errors.push(error))
        })()
      })
    if (errors.length > 0) {
      reject(errors)
    } else {
      resolve(result)
    }
  })
}

const errorToJson = (error) => {
  console.log(error)
  if (error) {
    const plainObject = {}
    Object
      .getOwnPropertyNames(error)
      .forEach((key) => {
        if (typeof plainObject[key] !== 'function') { plainObject[key] = error[key] }
      })
    return plainObject
  } else {
    return null
  }
}

const filterUsers = (users, data) => {
  return new Promise((resolve, reject) => {
    try {
      const arr = []
      for (let i = 0; i < users.length; i++) {
        if (typeof users[i] === 'object' && users[i].displayName && users[i].displayName.toLowerCase().includes(data.searchName.toLowerCase())) {
          arr.push(users[i])
        } else {
          continue
        }
      }
      resolve(arr)
    } catch (error) {
      reject(error)
    }
  })
}

const processDate = (date) => {
  if (typeof date === 'object') {
    return moment(date.toDate()).format('MM/DD/YYYY hh:mm:ss A')
  } else {
    return date
  }
}

const setSingleUserClaims = (user, customClaims) => {
  return new Promise((resolve, reject) => {
    try {
      user.customClaims = customClaims
      user.assets = []
      resolve(user)
    } catch (error) { reject(error) }
  })
}

const setSingleUserAssets = (querySnapshot, user) => {
  return new Promise((resolve, reject) => {
    try {
      querySnapshot
        .forEach((doc) => {
          const arr = doc.data()
          arr.assetId = doc.id
          user.assets.push(arr)
        })
      resolve(user)
    } catch (error) { reject(error) }
  })
}

let assetUnsub = null
let commentUnsub = null
let errorUnsub = null
let pmsUnsub = null
let staffOrderUnsub = null
let templateUnsub = null
let workOrderUnsub = null
let wcCountUnsub = null

export default {
  // Bulk reassign Work Orders or Assets
  bulkReassign (context, data) {
    return new Promise((resolve, reject) => {
      try {
        if (data.db === 'assets') {
          for (let i = 0; i < data.items.length; i++) {
            (async () => {
              await db
                .collection(data.db)
                .doc(data.items[i].assetId)
                .update({
                  assignedTo: data.worker
                })
                .catch((error) => {
                  throw error
                })
            })()
          }
          resolve(true)
        } else {
          for (let i = 0; i < data.items.length; i++) {
            (async () => {
              await db
                .collection(data.db)
                .doc(data.items[i].id)
                .update({
                  assignedTo: data.worker
                })
                .catch((error) => {
                  throw error
                })
            })()
          }
          resolve(true)
        }
      } catch (error) {
        reject(error)
      }
    })
  },
  // Change Access Level for user
  changeAccess (context, data) {
    return new Promise((resolve, reject) => {
      this.$axios
        .request({
          url: '/claims',
          method: 'POST',
          data
        })
        .then((response) => {
          context
            .commit('setSingleUser', data)
          resolve(true)
        })
        .catch((error) => reject(error))
    })
  },
  // Send PM date to Mutation
  commitPMs ({ commit, state }, querySnapshot) {
    return new Promise((resolve, reject) => {
      const pms = []
      for (let i = 0; i < querySnapshot.docs.length; i++) {
        const doc = querySnapshot.docs[i]
        const createdDate = (doc.data().createdDate) ? processDate(doc.data().createdDate) : null
        const lastUpdated = (doc.data().lastUpdated) ? processDate(doc.data().lastUpdated) : null
        const start = new Date(processDate(doc.data().createdDate))
        const sla = (doc.data().department !== 'dietary') ? new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000)
        const arr = {
          assignedTo: (doc.data().assignedTo && typeof doc.data().assignedTo === 'object') ? doc.data().assignedTo : 'Not Assigned',
          createdDate,
          departmentIn: doc.data().departmentIn,
          description: doc.data().description,
          id: doc.id,
          lastUpdated,
          pastDue: (new Date() > sla && doc.data().status !== 'Closed') ? '!' : '',
          priority: doc.data().priority,
          quickNote: doc.data().quickNote,
          read: doc.data().read,
          status: doc.data().status,
          subject: doc.data().subject,
          task: doc.data().task,
          unreadComments: (doc.data().unreadComments && doc.data().unreadComments[state.user.uid]) ? doc.data().unreadComments[state.user.uid] : ' ',
          urgent: (doc.data().priority === 'Urgent') ? 'URGENT' : ''
        }
        if (state.pmLocations && state.pmLocations === 'All') {
          Object
            .freeze(arr)
          pms
            .push(arr)
        } else if (state.pmLocations && state.pmLocations === arr.departmentIn) {
          Object
            .freeze(arr)
          pms
            .push(arr)
        }
      }
      Object
        .freeze(pms)
      commit('setPMs', pms)
      resolve(true)
    })
  },
  // Send Work Order data to Mutation
  commitWorkOrders ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      const workorders = []
      for (let i = 0; i < data.docs.docs.length; i++) {
        const doc = data.docs.docs[i]
        const createdDate = (doc.data().createdDate) ? processDate(doc.data().createdDate) : null
        const lastUpdated = (doc.data().lastUpdated) ? processDate(doc.data().lastUpdated) : null
        const start = new Date(processDate(doc.data().createdDate))
        const sla = (doc.data().department !== 'dietary') ? new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000)
        const arr = {
          assignedTo: (doc.data().assignedTo && typeof doc.data().assignedTo === 'object') ? doc.data().assignedTo : 'Not Assigned',
          building: doc.data().building,
          commentCount: doc.data().commentCount,
          createdDate,
          id: doc.id,
          lastUpdated,
          pastDue: (new Date() > sla && doc.data().status !== 'Closed') ? '!' : '',
          priority: doc.data().priority,
          quickNote: doc.data().quickNote,
          read: doc.data().read,
          staffDepartment: doc.data().staffDepartment,
          status: doc.data().status,
          subject: doc.data().subject,
          ticketNumber: doc.data().ticketNumber,
          unreadComments: (doc.data().unreadComments && doc.data().unreadComments[state.user.uid]) ? doc.data().unreadComments[state.user.uid] : ' ',
          urgent: (doc.data().priority === 'Urgent') ? 'URGENT' : '',
          user: doc.data().user
        }
        if (data.type !== 'staff' && state.woLocations && state.woLocations === 'All') {
          for (let n = 0; n < state.locations.length; n++) {
            if (arr.building === state.locations[n].value) {
              Object
                .freeze(arr)
              workorders
                .push(arr)
              break
            }
          }
        } else if (data.type !== 'staff' && state.woLocations) {
          if (state.woLocations === arr.building) {
            Object
              .freeze(arr)
            workorders
              .push(arr)
          }
        } else {
          Object
            .freeze(arr)
          workorders
            .push(arr)
        }
      }
      Object
        .freeze(workorders)
      if (data.type === 'staff') {
        commit('setStaffWorkOrders', workorders)
      } else {
        commit('setWorkorders', workorders)
      }
      resolve(true)
    })
  },
  updateWoIndex ({ commit, state }, index) {
    return new Promise((resolve, reject) => {
      commit('setWoIndex', index)
      resolve(true)
    })
  },
  // Clear PM array in state
  destroyAssets ({ commit, state }) {
    if (assetUnsub) { assetUnsub() }
    commit('clearAssets')
  },
  // Clear PM array in state
  destroyPMs ({ commit, state }) {
    if (pmsUnsub) { pmsUnsub() }
    commit('clearPMs')
  },
  // Clear Staff Work Orders array in state
  destroyStaffWOs ({ commit, state }) {
    if (staffOrderUnsub) { staffOrderUnsub() }
    commit('clearStaffWOs')
  },
  // Clear Staff Work Orders array in state
  destroyStats ({ commit, state }) {
    if (wcCountUnsub) { wcCountUnsub() }
    commit('clearStats')
  },
  // Clear Work Orders array in state
  destroyWOs ({ commit, state }) {
    if (workOrderUnsub) { workOrderUnsub() }
    commit('clearWOs')
  },
  // Detach asset associated to user
  detachAsset (context, data) {
    return new Promise((resolve, reject) => {
      db
        .collection('assets')
        .doc(data.exists)
        .update({ userId: null })
        .then(() => {
          context
            .commit('setDetachAsset', data)
          resolve(true)
        })
        .catch((error) => reject(error))
    })
  },
  deleteAsset ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      db
        .collection('assets')
        .doc(data.assetId)
        .delete()
        .then((result) => {
          commit('removeAsset', data)
          return resolve(result)
        })
        .catch((error) => reject(error))
    })
  },
  // Only admin can delete, deletes from DB and Auth in Firebase
  deleteUser (context, data) {
    return new Promise((resolve, reject) => {
      // Detach assets from user
      db
        .collection('assets')
        .where('userId', '==', data.userId)
        .get()
        .then((querySnapshot) => batchAssetUpdate(querySnapshot, { userId: null }))
        // Remove user from DB, start with index
        .then((result) => db
          .collection('usersIndex')
          .where()
          .get()
        )
        .then((querySnapshot) => {
          let query = null
          querySnapshot
            .forEach((doc) => {
              for (let i = 0; i < query.length; i++) {
                if (query[i].userId === data.userId) {
                  query = doc.data().users
                  query.splice(i, 1)
                  db
                    .collection('usersIndex')
                    .doc(doc.id)
                    .update({ users: query })
                    // Delete user from DB users
                    .then(() => db
                      .collection('users')
                      .doc(data.userId)
                      .delete()
                    )
                    .then(() => this.$axios
                      .request({
                        url: '/user/delete',
                        method: 'POST',
                        data
                      })
                    )
                    // Remove User from local store
                    .then((response) => {
                      context
                        .commit('removeUser', data.userId)
                      resolve(true)
                    })
                    .catch((error) => {
                      throw error
                    })
                  break
                }
              }
            })
          if (!query) {
            // Needs to throw error
            query = []
            resolve(query)
          }
        })
        .catch((error) => resolve(error))
    })
  },
  // Send to firebase db for error logging
  errorReport (context, data) {
    console
      .error(data)
    db
      .collection('errors')
      .add(data)
      .catch((error) => { console.error(error) })
  },
  // Get assets from DB assets indexes and put into state
  getAssets ({ commit, state }, active) {
    return new Promise((resolve, reject) => {
      commit('setAssetLoading', true)
      if (assetUnsub) { assetUnsub() }
      assetUnsub = db
        .collection('assets')
        .where('department', '==', state.assetDepartment)
        .where('active', '==', active)
        .orderBy('tag')
        .onSnapshot((querySnapshot) => {
          const assets = []
          for (let c = 0; c < querySnapshot.docs.length; c++) {
            const doc = querySnapshot.docs[c]
            const arr = {}
            arr.assetId = doc.id
            arr.assignedTo = ''
            arr.description = (doc.data().description) ? doc.data().description : null
            arr.location = (doc.data().departmentIn) ? doc.data().departmentIn : null
            arr.tag = (doc.data().tag && Array.isArray(doc.data().tag)) ? doc.data().tag[0] : ['No Tag']
            if (doc.data().pms && Array.isArray(doc.data().pms) && doc.data().pms.length > 0) {
              arr.pm = true
              for (let i = 0; i < doc.data().pms.length; i++) {
                if (doc.data().pms[i].assignedTo && doc.data().pms[i].assignedTo.displayName) {
                  arr.assignedTo += doc.data().pms[i].assignedTo.displayName
                  arr.assignedTo += ' '
                }
              }
            }
            Object
              .freeze(arr)
            assets
              .push(arr)
          }
          Object
            .freeze(assets)
          commit('setAssets', assets)
          commit('setAssetLoading', false)
          resolve(true)
        }, (error) => reject(error))
    })
  },
  // Get comments for a work order
  getComments ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      if (commentUnsub) { commentUnsub() }
      commentUnsub = db
        .collection('comments')
        .where('orderId', '==', data.orderId)
        .onSnapshot((querySnapshot) => {
          querySnapshot
            .forEach((doc) => {
              if (doc.exists) {
                const arr = doc.data()
                arr.id = doc.id
                commit('setComments', arr)
                resolve(arr)
              } else {
                commentUnsub()
                resolve('No comments')
              }
            })
        })
    })
  },
  // Get server date and time
  getDateAndTime (context, data) {
    return new Promise((resolve, reject) => {
      this.$axios
        .get('/dateTime')
        .then((response) => resolve(response.data))
        .catch((error) => reject(error))
    })
  },
  // Get recent errors for admin dashboard
  getErrors ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      if (errorUnsub) { errorUnsub() }
      errorUnsub = db
        .collection('errors')
        .where('resolved', '==', false)
        .orderBy('date', 'desc')
        .limit(data)
        .onSnapshot((querySnapshot) => {
          const arr = []
          querySnapshot
            .forEach((doc) => {
              const d = {}
              Object
                .keys(doc.data())
                .forEach((k) => {
                  d[k] = doc.data()[k]
                })
              d.id = doc.id
              if (d.date && typeof d.date === 'object') {
                d.date = processDate(doc.data().date)
              } else if (d.date) {
                d.date = moment(doc.data().date).format('MM/DD/YYYY hh:mm:ss A')
              }
              arr
                .push(d)
            })
          commit('setErrors', arr)
          resolve(arr)
        }, (error) => reject(error))
    })
  },
  // Models for assets
  getModels ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      if (state.assetDepartment === 'it') {
        db
          .collection('itModels')
          .doc('KvnIG84xqnDcguwo4z7n')
          .get()
          .then((doc) => {
            const models = doc.data().models.sort((a, b) => {
              if (a.toLowerCase() < b.toLowerCase()) { return -1 }
              if (a.toLowerCase() > b.toLowerCase()) { return 1 }
              return 0
            })
            const manufacturers = doc.data().manufacturers.sort((a, b) => {
              if (a.toLowerCase() < b.toLowerCase()) { return -1 }
              if (a.toLowerCase() > b.toLowerCase()) { return 1 }
              return 0
            })
            Object
              .freeze(models)
            Object
              .freeze(manufacturers)
            commit('setModels', models)
            commit('setManufacturers', manufacturers)
            resolve(true)
          })
          .catch((error) => reject(error))
      }
    })
  },
  // Send single asset for editing/viewing a single asset
  getSingleAsset (context, data) {
    return new Promise((resolve, reject) => {
      db
        .collection('assets')
        .doc(data.assetId)
        .get()
        .then((doc) => {
          const arr = doc.data()
          arr.assetId = doc.id
          resolve(arr)
        })
        .catch((error) => reject(error))
    })
  },
  // Get templates for PMs
  getTemplates ({ commit, state }) {
    return new Promise((resolve, reject) => {
      if (templateUnsub) { templateUnsub() }
      templateUnsub = db
        .collection('templates')
        .where('department', '==', state.assetDepartment)
        .onSnapshot((querySnapshot) => {
          const templates = []
          querySnapshot
            .forEach((doc) => {
              const arr = doc.data()
              arr.id = doc.id
              Object
                .freeze(arr)
              templates
                .push(arr)
            })
          Object
            .freeze(templates)
          commit('setTemplates', templates)
          resolve(true)
        }, (error) => {
          reject(error)
        })
    })
  },
  // Get list of names of all Employees
  getUsersList (context, data) {
    return new Promise((resolve, reject) => {
      db
        .collection('usersIndex')
        .orderBy('store')
        .get()
        .then((querySnapshot) => {
          const arr = []
          for (let c = 0; c < querySnapshot.docs.length; c++) {
            const doc = querySnapshot.docs[c]
            for (let i = 0; i < doc.data().users.length; i++) {
              const obj = {
                text: doc.data().users[i].displayName,
                value: doc.data().users[i].userId
              }
              Object
                .freeze(obj)
              arr
                .push(obj)
            }
          }
          Object
            .freeze(arr)
          resolve(arr)
        })
        .catch((error) => reject(error))
    })
  },
  // Get list of non-staff labeled Employees
  getWorkers ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      db
        .collection('users')
        .where('worker', '==', true)
        .orderBy('displayName', 'asc')
        .get()
        .then((querySnapshot) => {
          const arr = []
          querySnapshot
            .forEach((doc) => {
              arr
                .push({
                  text: doc.data().displayName,
                  value: {
                    displayName: doc.data().displayName,
                    workerId: doc.id
                  }
                })
            })
          arr
            .unshift({
              text: 'All',
              value: {
                displayName: 'all',
                workerId: null
              }
            })
          arr
            .unshift({
              text: 'Not Assigned',
              value: {
                displayName: 'Not Assigned',
                workerId: null
              }
            })
          commit('setWorkers', arr)
          resolve(true)
        })
        .catch((error) => reject(error))
    })
  },
  getAssetWorkers ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      db
        .collection('users')
        .where('worker', '==', true)
        .orderBy('displayName', 'asc')
        .get()
        .then((querySnapshot) => {
          const arr = []
          querySnapshot
            .forEach((doc) => {
              arr
                .push({
                  text: doc.data().displayName,
                  value: {
                    displayName: doc.data().displayName,
                    workerId: doc.id
                  }
                })
            })
          commit('setAssetWorkers', arr)
          resolve(true)
        })
        .catch((error) => reject(error))
    })
  },
  // Get work order and pm stats
  getWOStats ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      if (wcCountUnsub) { wcCountUnsub() }
      const startMonth = new Date(moment().subtract(30, 'days').format('MM/DD/YYYY hh:mm:ss A'))
      if (data.type === 'worker') {
        wcCountUnsub = db
          .collection('workOrders')
          .where('assignedTo.workerId', '==', data.uid)
          .where('createdDate', '>', startMonth)
          .onSnapshot((querySnapshot) => {
            const pm = {}
            const wo = {}
            querySnapshot
              .forEach((doc) => {
                const start = new Date(processDate(doc.data().createdDate))
                const sla = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000)
                let isLate = false
                if (new Date() > sla) {
                  isLate = true
                }
                if (doc.data().assignedTo && doc.data().assignedTo.workerId && doc.data().workOrderType === 'PM') {
                  if (pm[doc.data().assignedTo.workerId]) {
                    let open = pm[doc.data().assignedTo.workerId].open
                    open++
                    pm[doc.data().assignedTo.workerId].open = open
                    if (doc.data().closedDate) {
                      let closed = (pm[doc.data().assignedTo.workerId].closed) ? pm[doc.data().assignedTo.workerId].closed : 0
                      closed++
                      pm[doc.data().assignedTo.workerId].closed = closed
                    } else if (!doc.data().closedDate && isLate) {
                      let pastDue = (pm[doc.data().assignedTo.workerId].pastDue) ? pm[doc.data().assignedTo.workerId].pastDue : 0
                      pastDue++
                      pm[doc.data().assignedTo.workerId].pastDue = pastDue
                    }
                  } else {
                    pm[doc.data().assignedTo.workerId] = {
                      closed: (doc.data().closedDate) ? 1 : 0,
                      date: data.startMonthShort,
                      name: doc.data().assignedTo.displayName,
                      open: 1,
                      pastDue: (isLate && !doc.data().closedDate) ? 1 : 0
                    }
                  }
                } else if (doc.data().assignedTo && doc.data().assignedTo.workerId) {
                  if (wo[doc.data().assignedTo.workerId]) {
                    let open = wo[doc.data().assignedTo.workerId].open
                    open++
                    wo[doc.data().assignedTo.workerId].open = open
                    if (doc.data().closedDate) {
                      let closed = (wo[doc.data().assignedTo.workerId].closed) ? wo[doc.data().assignedTo.workerId].closed : 0
                      closed++
                      wo[doc.data().assignedTo.workerId].closed = closed
                    } else if (!doc.data().closedDate && isLate) {
                      let pastDue = (wo[doc.data().assignedTo.workerId].pastDue) ? wo[doc.data().assignedTo.workerId].pastDue : 0
                      pastDue++
                      wo[doc.data().assignedTo.workerId].pastDue = pastDue
                    }
                  } else {
                    wo[doc.data().assignedTo.workerId] = {
                      closed: (doc.data().closedDate) ? 1 : 0,
                      date: data.startMonthShort,
                      name: doc.data().assignedTo.displayName,
                      open: 1,
                      pastDue: (isLate && !doc.data().closedDate) ? 1 : 0
                    }
                  }
                }
              })
            Object
              .freeze(wo)
            Object
              .freeze(pm)
            commit('setWoStats', wo)
            commit('setPmStats', pm)
            resolve(true)
          }, (error) => {
            reject(error)
          })
      } else {
        wcCountUnsub = db
          .collection('workOrders')
          .where('department', '==', data.department)
          .where('createdDate', '>', startMonth)
          .onSnapshot((querySnapshot) => {
            const pm = {}
            const wo = {}
            querySnapshot
              .forEach((doc) => {
                const start = new Date(processDate(doc.data().createdDate))
                const sla = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000)
                let isLate = false
                if (new Date() > sla) {
                  isLate = true
                }
                if (doc.data().assignedTo && doc.data().assignedTo.workerId && doc.data().workOrderType === 'PM') {
                  if (pm[doc.data().assignedTo.workerId]) {
                    let open = pm[doc.data().assignedTo.workerId].open
                    open++
                    pm[doc.data().assignedTo.workerId].open = open
                    if (doc.data().closedDate) {
                      let closed = (pm[doc.data().assignedTo.workerId].closed) ? pm[doc.data().assignedTo.workerId].closed : 0
                      closed++
                      pm[doc.data().assignedTo.workerId].closed = closed
                    } else if (isLate && !doc.data().closedDate) {
                      let pastDue = (pm[doc.data().assignedTo.workerId].pastDue) ? pm[doc.data().assignedTo.workerId].pastDue : 0
                      pastDue++
                      pm[doc.data().assignedTo.workerId].pastDue = pastDue
                    }
                  } else {
                    pm[doc.data().assignedTo.workerId] = {
                      closed: (doc.data().closedDate) ? 1 : 0,
                      date: data.startMonthShort,
                      name: doc.data().assignedTo.displayName,
                      open: 1,
                      pastDue: (isLate && !doc.data().closedDate) ? 1 : 0
                    }
                  }
                } else if (doc.data().assignedTo && doc.data().assignedTo.workerId) {
                  if (wo[doc.data().assignedTo.workerId]) {
                    let open = wo[doc.data().assignedTo.workerId].open
                    open++
                    wo[doc.data().assignedTo.workerId].open = open
                    if (doc.data().closedDate) {
                      let closed = (wo[doc.data().assignedTo.workerId].closed) ? wo[doc.data().assignedTo.workerId].closed : 0
                      closed++
                      wo[doc.data().assignedTo.workerId].closed = closed
                    } else if (isLate && !doc.data().closedDate) {
                      let pastDue = (wo[doc.data().assignedTo.workerId].pastDue) ? wo[doc.data().assignedTo.workerId].pastDue : 0
                      pastDue++
                      wo[doc.data().assignedTo.workerId].pastDue = pastDue
                    }
                  } else {
                    wo[doc.data().assignedTo.workerId] = {
                      closed: (doc.data().closedDate) ? 1 : 0,
                      date: data.startMonthShort,
                      name: doc.data().assignedTo.displayName,
                      open: 1,
                      pastDue: (isLate && !doc.data().closedDate) ? 1 : 0
                    }
                  }
                }
              })
            Object
              .freeze(wo)
            Object
              .freeze(pm)
            commit('setWoStats', wo)
            commit('setPmStats', pm)
            resolve(true)
          }, (error) => {
            reject(error)
          })
      }
    })
  },
  // Save a new asset or update an existing one
  saveAsset ({ dispatch, state }, data) {
    return new Promise((resolve, reject) => {
      if (data.assetId === 'new') {
        db
          .collection('assets')
          .add(data)
          .then((docRef) => {
            resolve(docRef.id)
          })
          .catch((error) => reject(error))
      } else {
        db
          .collection('assets')
          .doc(data.assetId)
          .update(data)
          .then(() => {
            resolve(data.assetId)
          })
          .catch((error) => reject(error))
      }
    })
  },
  searchAssets ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      if (assetUnsub) { assetUnsub() }
      if (!data.searchDescription) {
        assetUnsub = db
          .collection('assets')
          .where('department', '==', state.assetDepartment)
          .where('active', '==', data.active)
          .orderBy('tag')
          .onSnapshot((querySnapshot) => {
            const assets = []
            for (let c = 0; c < querySnapshot.docs.length; c++) {
              const doc = querySnapshot.docs[c]
              if (doc.data().tag && Array.isArray(doc.data().tag)) {
                for (let i = 0; i < doc.data().tag.length; i++) {
                  if (doc.data().tag[i].toLowerCase().includes(data.searchName.toLowerCase())) {
                    const arr = {}
                    arr.assetId = doc.id
                    arr.assignedTo = ''
                    arr.description = (doc.data().description) ? doc.data().description : null
                    arr.location = (doc.data().departmentIn) ? doc.data().departmentIn : null
                    arr.tag = doc.data().tag[0]
                    if (doc.data().pms && Array.isArray(doc.data().pms) && doc.data().pms.length > 0) {
                      arr.pm = true
                      for (let i = 0; i < doc.data().pms.length; i++) {
                        if (doc.data().pms[i].assignedTo && doc.data().pms[i].assignedTo.displayName) {
                          arr.assignedTo += doc.data().pms[i].assignedTo.displayName
                          arr.assignedTo += ' '
                        }
                      }
                    }
                    Object
                      .freeze(arr)
                    assets
                      .push(arr)
                  }
                }
              }
            }
            Object
              .freeze(assets)
            commit('setAssets', assets)
            resolve(true)
          }, (error) => reject(error))
      } else {
        assetUnsub = db
          .collection('assets')
          .where('department', '==', state.assetDepartment)
          .where('active', '==', data.active)
          .orderBy('description')
          .onSnapshot((querySnapshot) => {
            const assets = []
            for (let c = 0; c < querySnapshot.docs.length; c++) {
              const doc = querySnapshot.docs[c]
              const arr = {}
              if (doc.data().description && doc.data().description.toLowerCase().includes(data.searchDescription.toLowerCase())) {
                arr.assetId = doc.id
                arr.assignedTo = ''
                arr.description = (doc.data().description) ? doc.data().description : null
                arr.location = (doc.data().departmentIn) ? doc.data().departmentIn : null
                arr.tag = doc.data().tag[0]
                if (doc.data().pms && Array.isArray(doc.data().pms) && doc.data().pms.length > 0) {
                  arr.pm = true
                  for (let i = 0; i < doc.data().pms.length; i++) {
                    if (doc.data().pms[i].assignedTo && doc.data().pms[i].assignedTo.displayName) {
                      arr.assignedTo += doc.data().pms[i].assignedTo.displayName
                      arr.assignedTo += ' '
                    }
                  }
                }
                Object
                  .freeze(arr)
                assets
                  .push(arr)
              }
            }
            Object
              .freeze(assets)
            commit('setAssets', assets)
            resolve(true)
          }, (error) => reject(error))
      }
    })
  },
  searchUsers ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      filterUsers(state.users, data)
        .then((response) => {
          commit('setUsers', response)
          return resolve(true)
        })
        .catch((error) => reject(error))
    })
  },
  sortAssets ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      try {
        const arr = []
        if (assetUnsub) { assetUnsub() }
        for (let i = 0; i < state.assets.length; i++) {
          if (state.assets[i].description && state.assets[i].description.charAt(0).toUpperCase() === data.letter) { arr.push(state.assets[i]) }
        }
        commit('setAssets', arr)
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  },
  sortUsers ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      try {
        const arr = []
        for (let i = 0; i < state.users.length; i++) {
          if (typeof state.users[i] === 'object' && state.users[i].displayName && state.users[i].displayName.charAt(0).toUpperCase() === data.letter) {
            arr
              .push(state.users[i])
          }
        }
        Object
          .freeze(arr)
        commit('setUsers', arr)
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  },
  // Reporting department for stats
  updateReportingDepartment ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      try {
        const reportingDepartment = localStorage
          .getItem('reportingDepartment')
        if (!data && reportingDepartment) {
          commit('setReportingDepartment', reportingDepartment)
          resolve('Updated')
        } else if (data) {
          localStorage
            .setItem('reportingDepartment', data)
          commit('setReportingDepartment', data)
          resolve('Updated')
        } else {
          resolve('Nothing to update')
        }
      } catch (error) {
        reject(error)
      }
    })
  },
  // Unsubsribe to comments listener
  unsubComments ({ commit, state }) {
    if (commentUnsub) { commentUnsub() }
    commit('setComments', [])
  },
  updateAssetDepartment ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      try {
        commit('setAssetDepartment', data)
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  },
  // Get auth claims from firebase and put in store to update UI
  // depending on user access levels
  updateClaims (context, data) {
    const access = {}
    Object
      .keys(data)
      .forEach((k) => {
        // Ignore not needed keys from claims and add needed to access object
        switch (k) {
          case 'name':
            break
          case 'iss':
            break
          case 'aud':
            break
          case 'auth_time':
            break
          case 'user_id':
            break
          case 'sub':
            break
          case 'iat':
            break
          case 'exp':
            break
          case 'email':
            break
          case 'email_verified':
            break
          case 'firebase':
            break
          default:
            access[k] = data[k]
            break
        }
      })
    context.commit('setClaims', access)
  },
  // Adds new comment to work order
  updateComments ({ dispatch, state }, data) {
    return new Promise((resolve, reject) => {
      if (data.id) {
        db
          .collection('comments')
          .doc(data.id)
          .update(data)
          .then((response) => resolve(response))
          .catch((error) => reject(error))
      } else {
        db
          .collection('comments')
          .add(data)
          .then((response) => dispatch('getComments', data))
          .then((response) => resolve(response))
          .catch((error) => reject(error))
      }
    })
  },
  // Grab or save Create Work Order Minimize state
  updateCreateMinimize ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      try {
        const minimize = (localStorage.getItem('createMinimize') && localStorage.getItem('createMinimize') === 'true') ? true : false
        if (typeof data === 'boolean') {
          localStorage
            .setItem('createMinimize', data)
          commit('setCreateMinimize', data)
          resolve('Updated')
        } else {
          commit('setCreateMinimize', minimize)
          resolve('Updated')
        }
      } catch (error) {
        reject(error)
      }
    })
  },
  updateFacilties ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      db
        .collection('users')
        .doc(data.id)
        .update({
          facilities: data.facilities
        })
        .then((response) => resolve(response))
        .catch((error) => reject(error))
    })
  },
  updateLocalErrors ({ commit, dispatch, state }, error) {
    return new Promise((resolve, reject) => {
      try {
        const err = errorToJson(error)
        commit('setLocalErrors', err)
        if (Object.keys(err).length > 0 && firebase.auth().currentUser) {
          dispatch('errorReport', {
            date: firebase.firestore.Timestamp.fromDate(new Date()),
            error: {
              message: err.message,
              stack: err.stack
            },
            resolved: false,
            user: firebase.auth().currentUser.displayName
          })
        }
        resolve({ message: 'Commited' })
      } catch (e) {
        console
          .error(e)
        reject(e)
      }
    })
  },
  updateLocations ({ commit, state }) {
    return new Promise((resolve, reject) => {
      try {
        const locations = []
        if (state.user && state.user.facilities) {
          for (let i = 0; i < state.user.facilities.length; i++) {
            locations
              .push(state.user.facilities[i])
          }
        }
        Object
          .freeze(locations)
        commit('setLocations', locations)
        resolve(true)
      } catch (e) {
        reject(e)
      }
    })
  },
  // Update single user state for admin (when viewing/editing another user),
  // include claims call to api backend and assets call to firestore collection
  // for user id
  updateSingleUser ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      let user
      const setU = (data) => {
        return new Promise((resolve, reject) => {
          try {
            user = data
            resolve(data)
          } catch (error) {
            reject(error)
          }
        })
      }
      this.$axios
        // Get users customClaims from backend
        .get('/claims', { params: data })
        // Set claims for user
        .then((response) => setSingleUserClaims(data, response.data.customClaims))
        .then((response) => setU(response))
        // Assign user variable data thus far
        .then((response) => db
          .collection('assets')
          .where('userId', '==', user.userId)
          .get()
        )
        // Set any assets the user owns
        .then((querySnapshot) => setSingleUserAssets(querySnapshot, user))
        // Update user again
        .then((response) => setU(response))
        .then((response) => db
          // Get the rest of the user information then assign it to the user variable
          .collection('users')
          .doc(user.userId)
          .get()
        )
        .then((doc) => {
          Object
            .keys(doc.data())
            .forEach((k) => {
              // Skip claims and assets if in there, it is already set above
              if (k !== 'customClaims' && k !== 'assets') { user[k] = doc.data()[k] }
            })
          commit('setSingleUser', user)
          resolve(true)
        })
        .catch((error) => { reject(error) })
    })
  },
  // Get logged in client user data and set in state
  updateUser (context, data) {
    return new Promise((resolve, reject) => {
      const arr = {}
      if (data && Object.keys(data).length > 0) {
        Object
          .keys(data)
          .forEach((k) => {
            arr[k] = data[k]
          })
      }
      db
        .collection('users')
        .doc(arr.uid)
        .get()
        .then((doc) => {
          if (doc.exists) {
            Object
              .keys(doc.data())
              .forEach((k) => {
                arr[k] = doc.data()[k]
              })
          }
          context.commit('setUser', arr)
          resolve(true)
        })
        .catch((error) => reject(error))
    })
  },
  // Get all users from DB usersIndex and put into state
  updateUsers ({ commit, state }) {
    return new Promise((resolve, reject) => {
      const users = []
      db
        .collection('usersIndex')
        .orderBy('store')
        .get()
        .then((querySnapshot) => {
          for (let c = 0; c < querySnapshot.docs.length; c++) {
            const doc = querySnapshot.docs[c]
            for (let i = 0; i <= doc.data().users.length; i++) {
              const arr = doc.data().users[i]
              Object
                .freeze(arr)
              users
                .push(arr)
            }
          }
          Object
            .freeze(users)
          commit('setUsers', users)
          resolve(true)
        })
        .catch((error) => { reject(error) })
    })
  },
  // Grab or save PM Assignee state
  updatePMAssignee ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      try {
        const assignee = localStorage
          .getItem('pmAssignee')
        if (!data && assignee) {
          commit('setPMAssignee', JSON.parse(assignee))
          resolve('Updated')
        } else if (data) {
          localStorage
            .setItem('pmAssignee', JSON.stringify(data))
          commit('setPMAssignee', data)
          resolve('Updated')
        } else {
          resolve('Nothing to update')
        }
      } catch (error) {
        reject(error)
      }
    })
  },
  // Grab or save PM Department state
  updatePMDeparment ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      try {
        const department = localStorage
          .getItem('pmDepartment')
        if (!data && department) {
          commit('setPMDepartment', department)
          resolve('Updated')
        } else if (data) {
          localStorage
            .setItem('pmDepartment', data)
          commit('setPMDepartment', data)
          resolve('Updated')
        } else {
          resolve('Nothing to update')
        }
      } catch (error) {
        reject(error)
      }
    })
  },
  // Grab or save Work Order Descending state
  updatePMDescending ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      try {
        const descending = (localStorage.getItem('pmDescending') && localStorage.getItem('pmDescending') === 'true') ? true : false
        if (typeof data === 'boolean') {
          localStorage
            .setItem('pmDescending', data)
          commit('setPMDescending', data)
          resolve('Updated')
        } else {
          commit('setPMDescending', descending)
          resolve('Updated')
        }
      } catch (error) {
        reject(error)
      }
    })
  },
  // Grab or save PM Locations state
  updatePMLocations ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      try {
        const locations = localStorage
          .getItem('pmLocations')
        if (!data && locations) {
          commit('setPMLocations', locations)
          resolve('Updated')
        } else if (data) {
          localStorage
            .setItem('pmLocations', data)
          commit('setPMLocations', data)
          resolve('Updated')
        } else {
          resolve('Nothing to update')
        }
      } catch (error) {
        reject(error)
      }
    })
  },
  updatePMs ({ dispatch, state }, data) {
    return new Promise((resolve, reject) => {
      if (data.department === 'all' && data.field === 'assignedTo') {
        if (pmsUnsub) { pmsUnsub() }
        if (data.value && data.value.displayName === 'Not Assigned') {
          pmsUnsub = db
            .collection('workOrders')
            .where('status', '==', data.status)
            .where('workOrderType', '==', 'PM')
            .where('assignedTo', '==', null)
            .onSnapshot((querySnapshot) => {
              dispatch('commitPMs', querySnapshot)
                .then(() => resolve(true))
            }, (error) => {
              reject(error)
            })
        } else if (data.value && data.value.displayName === 'all') {
          pmsUnsub = db
            .collection('workOrders')
            .where('status', '==', data.status)
            .where('workOrderType', '==', 'PM')
            .onSnapshot((querySnapshot) => {
              dispatch('commitPMs', querySnapshot)
                .then(() => resolve(true))
            }, (error) => {
              reject(error)
            })
        } else if (!data.value || !data.value.workerId) {
          pmsUnsub = db
            .collection('workOrders')
            .where('status', '==', data.status)
            .where('workOrderType', '==', 'PM')
            .onSnapshot((querySnapshot) => {
              dispatch('commitPMs', querySnapshot)
                .then(() => resolve(true))
            }, (error) => {
              reject(error)
            })
        } else {
          pmsUnsub = db
            .collection('workOrders')
            .where('status', '==', data.status)
            .where('workOrderType', '==', 'PM')
            .where('assignedTo.workerId', '==', data.value.workerId)
            .onSnapshot((querySnapshot) => {
              dispatch('commitPMs', querySnapshot)
                .then(() => resolve(true))
            }, (error) => {
              reject(error)
            })
        }
      } else if (data.field === 'assignedTo') {
        if (pmsUnsub) { pmsUnsub() }
        if (data.value && data.value.displayName === 'Not Assigned') {
          pmsUnsub = db
            .collection('workOrders')
            .where('assignedTo', '==', null)
            .where('department', '==', data.department)
            .where('status', '==', data.status)
            .where('workOrderType', '==', 'PM')
            .onSnapshot((querySnapshot) => {
              dispatch('commitPMs', querySnapshot)
                .then(() => resolve(true))
            }, (error) => {
              reject(error)
            })
        } else if (data.value && data.value.displayName === 'all') {
          pmsUnsub = db
            .collection('workOrders')
            .where('department', '==', data.department)
            .where('status', '==', data.status)
            .where('workOrderType', '==', 'PM')
            .onSnapshot((querySnapshot) => {
              dispatch('commitPMs', querySnapshot)
                .then(() => resolve(true))
            }, (error) => {
              reject(error)
            })
        } else if (!data.value || !data.value.workerId) {
          pmsUnsub = db
            .collection('workOrders')
            .where('department', '==', data.department)
            .where('status', '==', data.status)
            .where('workOrderType', '==', 'PM')
            .onSnapshot((querySnapshot) => {
              dispatch('commitPMs', querySnapshot)
                .then(() => resolve(true))
            }, (error) => {
              reject(error)
            })
        } else {
          pmsUnsub = db
            .collection('workOrders')
            .where('assignedTo.workerId', '==', data.value.workerId)
            .where('department', '==', data.department)
            .where('status', '==', data.status)
            .where('workOrderType', '==', 'PM')
            .onSnapshot((querySnapshot) => {
              dispatch('commitPMs', querySnapshot)
                .then(() => resolve(true))
            }, (error) => {
              reject(error)
            })
        }
      } else {
        if (pmsUnsub) { pmsUnsub() }
        pmsUnsub = db
          .collection('workOrders')
          .where(data.field, '==', data.value)
          .where('department', '==', data.department)
          .where('status', '==', data.status)
          .where('workOrderType', '==', 'PM')
          .onSnapshot((querySnapshot) => {
            dispatch('commitPMs', querySnapshot)
              .then(() => resolve(true))
          }, (error) => {
            reject(error)
          })
      }
    })
  },
  // Grab or save Work Order Minimize state
  updatePMMinimize ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      try {
        const minimize = (localStorage.getItem('pmMinimize') && localStorage.getItem('pmMinimize') === 'true') ? true : false
        if (typeof data === 'boolean') {
          localStorage
            .setItem('pmMinimize', data)
          commit('setPMMinimize', data)
          resolve('Updated')
        } else {
          commit('setPMMinimize', minimize)
          resolve('Updated')
        }
      } catch (error) {
        reject(error)
      }
    })
  },
  // Grab or save PM Sort By state
  updatePMSortBy ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      try {
        const sortBy = localStorage
          .getItem('pmSortBy')
        if (!data && sortBy) {
          commit('setPMSortBy', sortBy)
          resolve('Updated')
        } else if (data) {
          localStorage
            .setItem('pmSortBy', data)
          commit('setPMSortBy', data)
          resolve('Updated')
        } else {
          resolve('Nothing to update')
        }
      } catch (error) {
        reject(error)
      }
    })
  },
  // Grab or save PM status Open/Closed Button state
  updatePMStatus ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      try {
        const status = localStorage
          .getItem('pmStatus')
        if (!data && status) {
          commit('setPMStatus', status)
          resolve('Updated')
        } else if (data) {
          localStorage
            .setItem('pmStatus', data)
          commit('setPMStatus', data)
          resolve('Updated')
        } else {
          resolve('Nothing to update')
        }
      } catch (error) {
        reject(error)
      }
    })
  },
  // Grab or save Staff Work Order Minimize state
  updateStaffMinimize ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      try {
        const minimize = (localStorage.getItem('staffMinimize') && localStorage.getItem('staffMinimize') === 'true') ? true : false
        if (typeof data === 'boolean') {
          localStorage
            .setItem('staffMinimize', data)
          commit('setStaffMinimize', data)
          resolve('Updated')
        } else {
          commit('setStaffMinimize', minimize)
          resolve('Updated')
        }
      } catch (error) {
        reject(error)
      }
    })
  },
  // Grab or save Staff Work Order status Open/Closed Button state
  updateStaffStatus ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      try {
        const status = localStorage
          .getItem('staffStatus')
        if (!data && status) {
          commit('setStaffStatus', status)
          resolve('Updated')
        } else if (data) {
          localStorage
            .setItem('staffStatus', data)
          commit('setStaffStatus', data)
          resolve('Updated')
        } else {
          resolve('Nothing to update')
        }
      } catch (error) {
        reject(error)
      }
    })
  },
  updateWorkorders ({ dispatch, state }, data) {
    return new Promise((resolve, reject) => {
      if (data.staff === true) {
        if (staffOrderUnsub) { staffOrderUnsub() }
        staffOrderUnsub = db
          .collection('workOrders')
          .where(data.field, '==', data.value)
          .where('status', '==', data.status)
          .where('workOrderType', '==', 'workorder')
          .onSnapshot((querySnapshot) => {
            dispatch('commitWorkOrders', { docs: querySnapshot, type: 'staff' })
              .then(() => resolve(true))
          }, (error) => {
            reject(error)
          })
      } else if (data.department === 'all' && data.field === 'assignedTo') {
        if (workOrderUnsub) { workOrderUnsub() }
        if (data.value && data.value.displayName === 'Not Assigned') {
          workOrderUnsub = db
            .collection('workOrders')
            .where('status', '==', data.status)
            .where('workOrderType', '==', 'workorder')
            .where('assignedTo', '==', null)
            .onSnapshot((querySnapshot) => {
              dispatch('commitWorkOrders', { docs: querySnapshot, type: 'worker' })
                .then(() => resolve(true))
            }, (error) => {
              reject(error)
            })
        } else if (data.value && data.value.displayName === 'all') {
          workOrderUnsub = db
            .collection('workOrders')
            .where('status', '==', data.status)
            .where('workOrderType', '==', 'workorder')
            .onSnapshot((querySnapshot) => {
              dispatch('commitWorkOrders', { docs: querySnapshot, type: 'worker' })
                .then(() => resolve(true))
            }, (error) => {
              reject(error)
            })
        } else if (!data.value || !data.value.workerId) {
          workOrderUnsub = db
            .collection('workOrders')
            .where('status', '==', data.status)
            .where('workOrderType', '==', 'workorder')
            .onSnapshot((querySnapshot) => {
              dispatch('commitWorkOrders', { docs: querySnapshot, type: 'worker' })
                .then(() => resolve(true))
            }, (error) => {
              reject(error)
            })
        } else {
          workOrderUnsub = db
            .collection('workOrders')
            .where('status', '==', data.status)
            .where('workOrderType', '==', 'workorder')
            .where('assignedTo.workerId', '==', data.value.workerId)
            .onSnapshot((querySnapshot) => {
              dispatch('commitWorkOrders', { docs: querySnapshot, type: 'worker' })
                .then(() => resolve(true))
            }, (error) => {
              reject(error)
            })
        }
      } else if (data.field === 'assignedTo') {
        if (workOrderUnsub) { workOrderUnsub() }
        if (data.value && data.value.displayName === 'Not Assigned') {
          workOrderUnsub = db
            .collection('workOrders')
            .where('assignedTo', '==', null)
            .where('department', '==', data.department)
            .where('status', '==', data.status)
            .where('workOrderType', '==', 'workorder')
            .onSnapshot((querySnapshot) => {
              dispatch('commitWorkOrders', { docs: querySnapshot, type: 'worker' })
                .then(() => resolve(true))
            }, (error) => {
              reject(error)
            })
        } else if (data.value && data.value.displayName === 'all') {
          workOrderUnsub = db
            .collection('workOrders')
            .where('department', '==', data.department)
            .where('status', '==', data.status)
            .where('workOrderType', '==', 'workorder')
            .onSnapshot((querySnapshot) => {
              dispatch('commitWorkOrders', { docs: querySnapshot, type: 'worker' })
                .then(() => resolve(true))
            }, (error) => {
              reject(error)
            })
        } else if (!data.value || !data.value.workerId) {
          workOrderUnsub = db
            .collection('workOrders')
            .where('department', '==', data.department)
            .where('status', '==', data.status)
            .where('workOrderType', '==', 'workorder')
            .onSnapshot((querySnapshot) => {
              dispatch('commitWorkOrders', { docs: querySnapshot, type: 'worker' })
                .then(() => resolve(true))
            }, (error) => {
              reject(error)
            })
        } else {
          workOrderUnsub = db
            .collection('workOrders')
            .where('assignedTo.workerId', '==', data.value.workerId)
            .where('department', '==', data.department)
            .where('status', '==', data.status)
            .where('workOrderType', '==', 'workorder')
            .onSnapshot((querySnapshot) => {
              dispatch('commitWorkOrders', { docs: querySnapshot, type: 'worker' })
                .then(() => resolve(true))
            }, (error) => {
              reject(error)
            })
        }
      } else {
        if (workOrderUnsub) { workOrderUnsub() }
        if (data.customSearch) {
          const value = (data.field === 'ticketNumber') ? parseInt(data.value) : data.value
          workOrderUnsub = db
            .collection('workOrders')
            .where(data.field, '==', value)
            .where('workOrderType', '==', 'workorder')
            .onSnapshot((querySnapshot) => {
              dispatch('commitWorkOrders', { docs: querySnapshot, type: 'worker' })
                .then(() => resolve(true))
            }, (error) => {
              reject(error)
            })
        } else if (data.department === 'all') {
          workOrderUnsub = db
            .collection('workOrders')
            .where(data.field, '==', data.value)
            .where('status', '==', data.status)
            .where('workOrderType', '==', 'workorder')
            .onSnapshot((querySnapshot) => {
              dispatch('commitWorkOrders', { docs: querySnapshot, type: 'worker' })
                .then(() => resolve(true))
            }, (error) => {
              reject(error)
            })
        } else {
          workOrderUnsub = db
            .collection('workOrders')
            .where(data.field, '==', data.value)
            .where('department', '==', data.department)
            .where('status', '==', data.status)
            .where('workOrderType', '==', 'workorder')
            .onSnapshot((querySnapshot) => {
              dispatch('commitWorkOrders', { docs: querySnapshot, type: 'worker' })
                .then(() => resolve(true))
            }, (error) => {
              reject(error)
            })
        }
      }
    })
  },
  // Grab or save Work Order Assignee state
  updateWoAssignee ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      try {
        const assignee = localStorage
          .getItem('woAssignee')
        if (!data && assignee) {
          commit('setWoAssignee', JSON.parse(assignee))
          resolve('Updated')
        } else if (data) {
          localStorage
            .setItem('woAssignee', JSON.stringify(data))
          commit('setWoAssignee', data)
          resolve('Updated')
        } else {
          resolve('Nothing to update')
        }
      } catch (error) {
        reject(error)
      }
    })
  },
  // Grab or save Work Order Descending state
  updateWoDescending ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      try {
        const descending = (localStorage.getItem('woDescending') && localStorage.getItem('woDescending') === 'true') ? true : false
        if (typeof data === 'boolean') {
          localStorage
            .setItem('woDescending', data)
          commit('setWoDescending', data)
          resolve('Updated')
        } else {
          commit('setWoDescending', descending)
          resolve('Updated')
        }
      } catch (error) {
        reject(error)
      }
    })
  },
  // Grab or save Work Order Department state
  updateWoDeparment ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      try {
        const assignee = localStorage
          .getItem('woDepartment')
        if (!data && assignee) {
          commit('setWoDepartment', assignee)
          resolve('Updated')
        } else if (data) {
          localStorage
            .setItem('woDepartment', data)
          commit('setWoDepartment', data)
          resolve('Updated')
        } else {
          resolve('Nothing to update')
        }
      } catch (error) {
        reject(error)
      }
    })
  },
  // Grab or save Work Order Locations state
  updateWoLocations ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      try {
        const locations = localStorage
          .getItem('woLocations')
        if (!data && locations) {
          commit('setWoLocations', locations)
          resolve('Updated')
        } else if (data) {
          localStorage
            .setItem('woLocations', data)
          commit('setWoLocations', data)
          resolve('Updated')
        } else {
          resolve('Nothing to update')
        }
      } catch (error) {
        reject(error)
      }
    })
  },
  // Grab or save Work Order Minimize state
  updateWoMinimize ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      try {
        const minimize = (localStorage.getItem('woMinimize') && localStorage.getItem('woMinimize') === 'true') ? true : false
        if (typeof data === 'boolean') {
          localStorage
            .setItem('woMinimize', data)
          commit('setWoMinimize', data)
          resolve('Updated')
        } else {
          commit('setWoMinimize', minimize)
          resolve('Updated')
        }
      } catch (error) {
        reject(error)
      }
    })
  },
  // Grab or save Work Order Sort By state
  updateWoSortBy ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      try {
        const sortBy = localStorage
          .getItem('woSortBy')
        if (!data && sortBy) {
          commit('setWoSortBy', sortBy)
          resolve('Updated')
        } else if (data) {
          localStorage
            .setItem('woSortBy', data)
          commit('setWoSortBy', data)
          resolve('Updated')
        } else {
          resolve('Nothing to update')
        }
      } catch (error) {
        reject(error)
      }
    })
  },
  // Grab or save Work Order status Open/Closed Button state
  updateWoStatus ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      try {
        const status = localStorage
          .getItem('woStatus')
        if (!data && status) {
          commit('setWoStatus', status)
          resolve('Updated')
        } else if (data) {
          localStorage
            .setItem('woStatus', data)
          commit('setWoStatus', data)
          resolve('Updated')
        } else {
          resolve('Nothing to update')
        }
      } catch (error) {
        reject(error)
      }
    })
  }
}
