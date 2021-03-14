export default () => ({
  // Current department of assets
  assetDepartment: null,
  assetLoading: false,
  // All assets found in logged in users department
  assets: [],
  assetWorkers: [],
  buildings: [
    {
      text: '',
      value: ''
    }
  ],
  // Access level for user
  claims: {},
  comments: [],
  createMinimize: false,
  departments: [
    ''
  ],
  departmentsPM: [
    {
      text: 'Biomed',
      value: 'bioMed'
    },
    {
      text: 'Environmental Services',
      value: 'evs'
    },
    {
      text: 'Facilities',
      value: 'facilities'
    },
    {
      text: 'Grounds',
      value: 'grounds'
    },
    {
      text: 'Information Technology',
      value: 'it'
    },
    {
      text: 'Transportation',
      value: 'transportation'
    }
  ],
  departmentsStaff: [
    ''
  ],
  // List recent errors for admin dashboard
  errors: [],
  lastUser: null,
  localErrors: {},
  locations: [
    {
      text: 'All',
      value: 'All'
    }
  ],
  manufacturers: [],
  models: [],
  pmAssignee: null,
  pmDescending: true,
  pmDepartment: 'all',
  pmLocations: 'All',
  pms: [],
  pmStats: [],
  pmSortBy: 'createdDate',
  pmStatus: 'Open',
  pmMinimize: false,
  reportingDepartment: null,
  searchFields: [
    {
      text: 'Asset Tag',
      value: 'tag'
    },
    {
      text: 'Description',
      value: 'description'
    },
    {
      text: 'Location',
      value: 'departmentIn'
    },
    {
      text: 'Manufacturer',
      value: 'manufacturer'
    },
    {
      text: 'Model',
      value: 'modelNumber'
    },
    {
      text: 'Serial',
      value: 'serial'
    },
    {
      text: 'Staff Department',
      value: 'staffDepartment'
    },
    {
      text: 'Ticket Number',
      value: 'ticketNumber'
    },
    {
      text: 'User',
      value: 'userId'
    }
  ],
  // When viewing a single user in the app
  singleUser: {},
  staffMinimize: false,
  staffStatus: 'Open',
  // Current logged in user (you)
  user: {},
  // All users in the app
  users: [],
  workers: [],
  // All Work Orders relative to the users input
  workorders: [],
  staffWorkOrders: [],
  templates: [],
  woAssignee: null,
  woDescending: true,
  woDepartment: 'all',
  woIndex: [],
  woLocations: 'All',
  woMinimize: false,
  woSortBy: 'createdDate',
  woStats: [],
  woStatus: 'Open'
})
