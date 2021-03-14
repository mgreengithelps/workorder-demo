export default {
  clearAssets (state) {
    state.assets = []
  },
  clearPMs (state) {
    state.pms = []
  },
  clearStats (state) {
    state.woStats = []
    state.pmStats = []
  },
  clearStaffWOs (state) {
    state.staffWorkOrders = []
  },
  clearWOs (state) {
    state.workorders = []
  },
  clearWOIndex (state) {
    state.woIndex = []
  },
  removeAsset (state, data) {
    for (let i = 0; i < state.assets.length; i++) {
      if (state.assets[i].assetId === data.assetId) {
        state.assets
          .splice(i, 1)
        break
      }
    }
  },
  // Remove user from store after deletion
  removeUser (state, data) {
    state.singleUser = {}
    for (let i = 0; i < state.users.length; i++) {
      if (state.users[i].userId === data) {
        state.users
          .splice(i, 1)
        break
      }
    }
  },
  // Set Department for Assets listed under Assets Mgmt Dashboard
  setAssetDepartment (state, data) { state.assetDepartment = data },
  setAssetLoading (state, data) { state.assetLoading = data },
  // Set list for assets
  setAssets (state, data) {
    state.assets = []
    state.assets = data
  },
  setAssetWorkers (state, data) { state.assetWorkers = data },
  // Set access for current logged in User
  setClaims (state, data) { state.claims = data },
  setCreateMinimize (state, data) {
    state.createMinimize = data
  },
  // Set comments for a work order in state
  setComments (state, data) {
    state.comments = []
    state.comments = data
  },
  // Detach an asset from a user
  setDetachAsset (state, data) {
    for (let i = 0; i < state.singleUser.assets.length; i++) {
      if (state.singleUser.assets[i].id === data.exists) {
        state.singleUser.assets
          .splice(i, 1)
        break
      }
    }
  },
  setErrors (state, data) {
    state.errors = []
    state.errors = [...data]
  },
  setLocalErrors (state, data) {
    state.localErrors = {}
    state.localErrors = data
  },
  setLocations (state, data) {
    state.locations = [{
      text: 'All',
      value: 'All'
    }, ...data]
  },
  setManufacturers (state, data) { state.manufacturers = data },
  setModels (state, data) { state.models = data },
  setPMAssignee (state, data) {
    state.pmAssignee = data
  },
  setPMDepartment (state, data) {
    state.pmDepartment = data
  },
  setPMDescending (state, data) {
    state.pmDescending = data
  },
  setPMLocations (state, data) {
    state.pmLocations = data
  },
  setPMs (state, data) {
    state.pms = []
    state.pms = data
  },
  setPMMinimize (state, data) {
    state.pmMinimize = data
  },
  setPMSortBy (state, data) {
    state.pmSortBy = data
  },
  setPMStatus (state, data) {
    state.pmStatus = data
  },
  setReportingDepartment (state, data) { state.reportingDepartment = data },
  // Search for single user data in users array and update
  setSingleUser (state, data) {
    state.singleUser = {}
    state.singleUser = data
  },
  setStaffMinimize (state, data) {
    state.staffMinimize = data
  },
  setStaffStatus (state, data) {
    state.staffStatus = data
  },
  setStaffWorkOrders (state, data) {
    state.staffWorkOrders = []
    state.staffWorkOrders = data
  },
  setTemplates (state, data) {
    state.templates = []
    state.templates = data
  },
  setUser (state, data) { state.user = data },
  // Set list for users
  setUsers (state, data) {
    state.users = []
    state.users = [...data]
  },
  setWorkers (state, data) { state.workers = data },
  setWorkorders (state, data) {
    state.workorders = []
    state.workorders = data
  },
  setWoAssignee (state, data) {
    state.woAssignee = data
  },
  setWoDescending (state, data) {
    state.woDescending = data
  },
  setWoDepartment (state, data) {
    state.woDepartment = data
  },
  setWoLocations (state, data) {
    state.woLocations = data
  },
  setWoMinimize (state, data) {
    state.woMinimize = data
  },
  setWoSortBy (state, data) {
    state.woSortBy = data
  },
  setWoIndex (state, data) {
    state.woIndex = []
    state.woIndex = data
  },
  setWoStats (state, data) {
    state.woStats = {}
    state.woStats = data
  },
  setPmStats (state, data) {
    state.pmStats = {}
    state.pmStats = data
  },
  setWoStatus (state, data) {
    state.woStatus = data
  }
}
