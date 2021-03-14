const path = require('path')
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const express = require('express')
const app = express()
const exphbs = require('express-handlebars')
// const csv = require('csvtojson')
// const csvFilePath = 'bioMed.csv'
const cors = require('cors')
// Enable CORS for Dev
const whiteList = [
  'http://localhost:3000',
  'http://localhost:5000'
]
const corsOptions = {
  origin: (origin, callback) => {
    const originIsWhitelisted = whiteList
      .includes(origin)
    callback(null, originIsWhitelisted)
  },
  credentials: false
}
const bodyParser = require('body-parser')
const moment = require('moment-timezone')
const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const { default: PQueue } = require('p-queue')
const pmQueue = new PQueue({ concurrency: 1 })
const cronQueue = new PQueue({ concurrency: 1 })
const serviceAccount = require('./acc/.json')
// Mail to on-premise mail server, connected through VPC Connector->VPC->VPN on GPC
// Standard mail, no html
const transporter = nodemailer
  .createTransport({
    host: '10.50.50.26',
    port: 25,
    /*
    pool: true,
    maxConnections: 3,
    rateDelta: 60000,
    rateLimit: 20,
    */
    secure: false,
    tls: {
      rejectUnauthorized: false
    }
  })
// Mail with HTML using handlebars
const transporterHbs = nodemailer
  .createTransport({
    host: '10.50.50.26',
    port: 25,
    /*
    pool: true,
    maxConnections: 3,
    rateDelta: 60000,
    rateLimit: 20,
    */
    secure: false,
    tls: {
      rejectUnauthorized: false
    }
  })

// Initialize Firebase app
admin
  .initializeApp({ credential: admin.credential.cert(serviceAccount) })

// Setup handlebars with nodemailer
transporterHbs
  .use('compile', hbs({
    viewEngine: {
      extName: '.hbs',
      partialsDir: path.join(__dirname, 'views/partials'),
      layoutsDir: path.join(__dirname, 'views/layouts'),
      defaultLayout: 'main.hbs'
    },
    extName: '.hbs',
    viewPath: path.join(__dirname, 'views')
  }))

/*
********************************************************************************

WELCOME TO THE LAND OF PROMISES!
Basically all functions tied to the api calls below return promises so chains
can be formed. We are calling Firestore a lot and want to wait and ensure
our requests go through and we are returning the appropriate responses.
Promise chains are queued with p-queue in order to fire in order.

********************************************************************************
*/

// Promise send mail no handlebars
const mailPromise = (mail) => {
  return new Promise((resolve, reject) => {
    transporter
      .sendMail(mail)
      .then((info) => {
        transporter
          .close()
        return resolve(info)
      })
      .catch((error) => reject(error))
  })
}

// Promise send mail with handlebars
const hbsPromise = (mail) => {
  return new Promise((resolve, reject) => {
    transporterHbs
      .sendMail(mail)
      .then((info) => {
        transporterHbs
          .close()
        return resolve(info)
      })
      .catch((error) => reject(error))
  })
}

// Create mail object with handlebars
const hbsMail = (data) => {
  return new Promise((resolve, reject) => {
    const mail = {
      from: 'postmaster@.org',
      to: data.to,
      subject: data.subject,
      template: 'mail',
      text: data.text,
      context: {
        body: data.body,
        link: data.link
      }
    }
    hbsPromise(mail)
      .then((response) => resolve(response))
      .catch((error) => reject(error))
  })
}

// Create mail object no handlebars
const workerMail = (data) => {
  return new Promise((resolve, reject) => {
    const mail = {
      from: 'postmaster@.org',
      to: data.to,
      subject: data.subject,
      template: 'worker',
      text: data.text,
      context: {
        body: data.body,
        link: data.link
      }
    }
    hbsPromise(mail)
      .then((response) => resolve(response))
      .catch((error) => reject(error))
  })
}

// Mailer for ticket reopen requests
const reopenMailer = (data) => {
  return new Promise((resolve, reject) => {
    const mail = {
      from: 'postmaster@.org',
      to: '',
      subject: 'Work Order Reopen Request',
      template: 'reopen',
      text: `Work Order Reopen request for Ticket ${data.link} by ${data.user}`,
      context: {
        user: data.user,
        link: data.link
      }
    }
    hbsPromise(mail)
      .then((response) => resolve(response))
      .catch((error) => reject(error))
  })
}

// Convert error to standard JSON for reporting
const errorToJson = (err) => {
  return new Promise((resolve, reject) => {
    try {
      const plainObject = {}
      Object
        .getOwnPropertyNames(err)
        .forEach((key) => {
          if (typeof plainObject[key] !== 'function') { plainObject[key] = err[key] }
        })
      resolve(plainObject)
    } catch (error) { reject(error) }
  })
}

// Add errors to database
const errorReport = (err) => {
  return new Promise((resolve, reject) => {
    console
      .error(err)
    errorToJson(err)
      .then((response) => admin
        .firestore()
        .collection('errors')
        .add({
          date: moment().tz('America/New_York').format(),
          error: response,
          resolved: false,
          user: 'Server Side'
        })
      )
      .then((response) => resolve(response))
      .catch((error) => reject(error))
  })
}

// Quicksort Sorting Algorithm, takes an array of objects and key you want to
// compare, forces toLocaleUpperCase of EN to make case insensitive
const quickSort = (arr, key) => {
  if (arr.length < 2) { return arr }
  const pivot = arr[Math.floor(Math.random() * arr.length)]
  const left = []
  const equal = []
  const right = []
  for (const element of arr) {
    if (element[key].toLocaleUpperCase('en') > pivot[key].toLocaleUpperCase('en')) {
      right.push(element)
    } else if (element[key].toLocaleUpperCase('en') < pivot[key].toLocaleUpperCase('en')) {
      left.push(element)
    } else {
      equal.push(element)
    }
  }
  return quickSort(left, key)
    .concat(equal)
    .concat(quickSort(right, key))
}

// ------- Begin App Function -------

// Get server Date and Time stamps
const getDateAndTime = () => {
  return new Promise((resolve, reject) => {
    try {
      resolve({
        date: moment().tz('America/New_York').format('l'),
        endMonth: moment().tz('America/New_York').endOf('month').format('MM/DD/YYYY hh:mm:ss A'),
        iso: moment().tz('America/New_York').format(),
        mmyyyy: moment().tz('America/New_York').format('MM/YYYY'),
        mmddyyyya: moment().tz('America/New_York').format('MM/DD/YYYY hh:mm:ss A'),
        startMonth: moment().tz('America/New_York').startOf('month').subtract(1, 'months').format('MM/DD/YYYY hh:mm:ss A'),
        startMonthShort: moment().tz('America/New_York').startOf('month').subtract(1, 'months').format('MM/DD/YYYY'),
        time: moment().tz('America/New_York').format('LTS')
      })
    } catch (error) {
      reject(error)
    }
  })
}

// Maximum retry limit
const retry = 5

// Sleep function for retry
const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

// Set access level for New User in Firebase Token Custom Claims, by default
// set to staff only, and then modified on Admin client side
const customClaim = (req) => {
  return new Promise((resolve, reject) => {
    admin
      .auth()
      .setCustomUserClaims(req.body.id, {
        admin: false,
        facilities: false,
        bioMed: false,
        dietary: false,
        evs: false,
        grounds: false,
        it: false,
        managerDietary: false,
        managerEVS: false,
        managerMaint: false,
        staff: true,
        transportation: false
      })
      .then((response) => resolve(response))
      .catch((error) => reject(error))
  })
}

// Wait and retry to check if user exists, if no user then create one
const newUserRetry = (req) => {
  return new Promise((resolve, reject) => {
    (async () => {
      for (let i = 0; i <= retry; i++) {
        if (i === retry) {
          admin
            .auth()
            .createUser({
              uid: req.body.id,
              email: req.body.mail,
              emailVerified: true,
              displayName: req.body.displayName
            })
            .then(() => customClaim(req))
            .then((response) => resolve(response))
            .catch((error) => reject(error))
        } else {
          await sleep(250)
          admin
            .auth()
            .getUser(req.body.id)
            .then((userRecord) => newUser(req))
            .then((userRecord) => resolve(userRecord))
            .catch((error) => { if (error.code !== 'auth/user-not-found') { reject(error) } })
        }
      }
    })()
  })
}

// Set New User details in Firebase Auth
const newUser = (req) => {
  return new Promise((resolve, reject) => {
    admin
      .auth()
      .updateUser(req.body.id, {
        email: req.body.mail,
        emailVerified: true,
        displayName: req.body.displayName
      })
      .then((userRecord) => resolve(userRecord))
      .catch((error) => reject(error))
  })
}

// Get User in Firebase Auth to see if they are new
const getUser = (req) => {
  return new Promise((resolve, reject) => {
    admin
      .auth()
      .getUser(req.body.id)
      .then((userRecord) => (!userRecord.email) ? reject(new Error({ code: 'no-custom-claims' })) : resolve(userRecord))
      .catch((error) => reject(error))
  })
}

// Create custom token from MS UID via Firebase Admin and Send to Client
// for Firebase Login
const createToken = (req) => {
  return new Promise((resolve, reject) => {
    admin
      .auth()
      .createCustomToken(req.body.id)
      .then((customToken) => resolve(customToken))
      .catch((error) => reject(error))
  })
}

// Get claims for user from Firebase
const getUserClaims = (req) => {
  return new Promise((resolve, reject) => {
    admin
      .auth()
      .getUser(req.query.userId)
      .then((userRecord) => resolve(userRecord))
      .catch((error) => reject(error))
  })
}

// Save user as a worker or not in the database
const setClaimInDB = (req) => {
  return new Promise((resolve, reject) => {
    if (req.body.customClaims.staff === true) {
      admin
        .firestore()
        .collection('users')
        .doc(req.body.userId)
        .update({ worker: false })
        .then((response) => resolve(response))
        .catch((error) => reject(error))
    } else {
      admin
        .firestore()
        .collection('users')
        .doc(req.body.userId)
        .update({ worker: true })
        .then((response) => resolve(response))
        .catch((error) => reject(error))
    }
  })
}

// Update user access in app through Claims
const setUserClaims = (req) => {
  return new Promise((resolve, reject) => {
    admin
      .auth()
      .setCustomUserClaims(req.body.userId, req.body.customClaims)
      .then((response) => setClaimInDB(req))
      .then((response) => resolve(response))
      .catch((error) => reject(error))
  })
}

// Send delete request and return promise, reject if not admin
const fireDelete = (req, userRecord) => {
  return new Promise((resolve, reject) => {
    if (!userRecord.customClaims.admin) { reject(new Error({ code: 'not-admin' })) }
    admin
      .auth()
      .deleteUser(req.body.userId)
      .then((response) => resolve(response))
      .catch((error) => reject(error))
  })
}

// Get claims for user requesting admin actions and make sure they are admin
// Delete a user requested by admin
const deleteUser = (req) => {
  return new Promise((resolve, reject) => {
    admin
      .auth()
      .getUser(reqId)
      .then((userRecord) => fireDelete(req, userRecord))
      .then((response) => resolve(response))
      .catch((error) => reject(error))
  })
}

// Update doc pms array to reflect last run and send to db
const setPmRan = (doc, key) => {
  return new Promise((resolve, reject) => {
    const arr = doc.data().pms
    arr[key].lastRun = moment().tz('America/New_York').format()
    admin
      .firestore()
      .collection('assets')
      .doc(doc.id)
      .update({
        pms: arr
      })
      .then((response) => resolve(response))
      .catch((error) => reject(error))
  })
}

// Adds a ticket number to ticket, takes last ticket number entered and adds 1
const setTicketNumber = (data, querySnapshot) => {
  return new Promise((resolve, reject) => {
    try {
      data.ticketNumber = (querySnapshot.docs[0].data().ticketNumber) ? querySnapshot.docs[0].data().ticketNumber + 1 : null
      resolve(data)
    } catch (e) {
      reject(e)
    }
  })
}

// Adds PM to Work Order DB
const runPM = (data) => {
  return new Promise((resolve, reject) => {
    admin
      .firestore()
      .collection('workOrders')
      .orderBy('ticketNumber', 'desc')
      .limit(1)
      .get()
      .then((querySnapshot) => setTicketNumber(data, querySnapshot))
      .then((result) => admin
        .firestore()
        .collection('workOrders')
        .add(result)
      )
      .then(() => admin
        .firestore()
        .collection('assets')
        .doc(data.assetId)
        .get()
      )
      .then((doc) => setPmRan(doc, data.key))
      .then((response) => resolve(response))
      .catch((error) => reject(error))
  })
}

// Switch by frequency, use moments difference calculator to get time from last
// PM run until now, if it never was ran, check if the start date is now or has
// passed, if so run
const sortPM = (data) => {
  return new Promise((resolve, reject) => {
    // Format today, run date, and last run time if available
    const now = moment().tz('America/New_York')
    const start = moment(data.start)
    const lastRun = (data.lastRun) ? moment(data.lastRun) : null
    // Number of Day of Week
    const todayDayOfWeek = moment().tz('America/New_York').format('d') // ex 01
    const dayOfWeek = moment(data.start).format('d') // ex 01
    // Number of the Day of the Month
    const todayDayOfMonth = moment().tz('America/New_York').format('D') // ex 28
    const fourteen = moment(data.start).add(14, 'days').format('D') // ex 28
    const dayOfMonth = moment(data.start).format('D') // ex 28
    // Number of the Day of the Year
    const todayDayOfYear = moment().tz('America/New_York').format('DDDD') // ex 300
    const dayOfYear = moment(data.start).format('DDDD') // ex 300
    const threeMonthsDayOfYear = moment(data.start).add(3, 'months').format('DDDD') // ex 300
    const sixMonthsDayOfYear = moment(data.start).add(6, 'months').format('DDDD') // ex 300
    const nineMonthsDayOfYear = moment(data.start).add(9, 'months').format('DDDD') // ex 300
    // Number of the Year
    const todayYear = moment().tz('America/New_York').format('Y') // ex 2020
    const year = moment(data.start).format('Y') // ex 2020
    // Day of Year with Year
    const todayDayandYear = moment().tz('America/New_York').format('DDDD-Y') // ex 300-2020
    const dayandYear = moment(data.start).format('DDDD-Y') // ex 300-2020
    const calcYears = (years) => {
      let result = false
      // Start y as the year this funtion is running
      let y = todayYear
      // Needs to be the same number day of the year to run
      if (todayDayOfYear === dayOfYear) {
        while (y >= year) {
          if (year === y) {
            // If start year is the same as y, then it needs ran
            result = true
            break
          } else {
            // Subtract years from y until y is either equal to start year or less than
            y = y - years
          }
        }
      }
      return result
    }
    const calcMonths = (months) => {
      let result = false
      // Start y as the year this funtion is running
      let y = todayYear
      // Today formatted Day and Year ex 300-2020
      let m = todayDayandYear
      // While y is greater than or equal to start year
      while (y >= year) {
        // If start Day and Year is the same as m Day and year Run
        if (dayandYear === m) {
          // If the dates now match, time to run, if not keep subtracting until year is less than start year
          result = true
          break
        } else {
          // Subtract the number of months from m
          m = moment(m).subtract(months, 'months').format('DDDD-Y')
          // Set y to the same year as the new m
          y = moment(m).format('Y')
        }
      }
      return result
    }
    let run = false
    // If PM has never been ran and it is past the scheduled start date, run the PM
    if (!lastRun && start.diff(now, 'days') <= 0) {
      run = true
    } else {
      // Calculate frequency using above functions to see if the PM is ready to run
      switch (data.freq) {
        case 'daily':
          run = true
          break
        case 'weekly':
          run = (dayOfWeek === todayDayOfWeek) ? true : false
          break
        case 'biMonthly':
          run = (dayOfMonth === todayDayOfMonth || fourteen === todayDayOfMonth) ? true : false
          break
        case 'monthly':
          run = (dayOfMonth === todayDayOfMonth) ? true : false
          break
        case 'quarterly':
          run = (dayOfYear === todayDayOfYear || threeMonthsDayOfYear === todayDayOfYear || sixMonthsDayOfYear === todayDayOfYear || nineMonthsDayOfYear === todayDayOfYear) ? true : false
          break
        case 'biAnnually':
          run = (dayOfYear === todayDayOfYear || sixMonthsDayOfYear === todayDayOfYear) ? true : false
          break
        case 'annually':
          run = (dayOfYear === todayDayOfYear) ? true : false
          break
        case 'twoYears':
          run = (calcYears(2)) ? true : false
          break
        case 'twoHalfYears':
          run = (calcMonths(30)) ? true : false
          break
        case 'threeYears':
          run = (calcYears(3)) ? true : false
          break
        case 'fourYears':
          run = (calcYears(4)) ? true : false
          break
        case 'fiveYears':
          run = (calcYears(5)) ? true : false
          break
        default:
          break
      }
    }
    // Run PM if run is true
    if (run) {
      runPM(data)
        .then((response) => resolve(response))
        .catch((error) => reject(error))
    } else {
      resolve('Not ready to run.')
    }
  })
}

// Add relevant info to PM before sending to sort
const constructPM = (doc) => {
  return new Promise((resolve, reject) => {
    const promises = []
    for (let i = 0; i < doc.data().pms.length; i++) {
      const pm = doc.data().pms[i]
      if (pm.freq && pm.start) {
        pm.assetId = doc.id
        pm.assetNotes = (doc.data().notes) ? doc.data().notes : null
        pm.assetType = (doc.data().notes) ? doc.data().notes : null
        pm.building = (doc.data().building) ? doc.data().building : null
        pm.createdDate = moment().tz('America/New_York').format('MM/DD/YYYY hh:mm:ss A')
        pm.department = (doc.data().department) ? doc.data().department : null
        pm.departmentIn = (doc.data().departmentIn) ? doc.data().departmentIn : null
        pm.description = (doc.data().description) ? doc.data().description : null
        pm.from = 'postmaster@.org'
        pm.key = i
        pm.lastUpdated = moment().tz('America/New_York').format('MM/DD/YYYY hh:mm:ss A')
        pm.manufacturer = (doc.data().manufacturer) ? doc.data().manufacturer : null
        pm.modelNumber = (doc.data().modelNumber) ? doc.data().modelNumber : null
        pm.priority = 'Normal'
        pm.purchaseDate = (doc.data().purchaseDate) ? doc.data().purchaseDate : null
        pm.serial = (doc.data().serial) ? doc.data().serial : null
        pm.status = 'Open'
        pm.subject = (doc.data().tag && Array.isArray(doc.data().tag) && doc.data().tag.length > 0) ? doc.data().tag[0] : 'No Tag'
        pm.tag = (doc.data().tag) ? doc.data().tag : ['No Tag']
        pm.user = 'Admin'
        pm.workOrderType = 'PM'
        promises
          .push(() => sortPM(pm))
      }
    }
    // Promise chain queue
    pmQueue
      .addAll(promises)
      .then((result) => resolve(result))
      .catch((error) => resolve(error))
  })
}

// Iterate through PMs and create object for work order then send object to sortPM function
const searchPM = (documentSnapshots) => {
  return new Promise((resolve, reject) => {
    const promises = []
    for (let i = 0; i < documentSnapshots.docs.length; i++) {
      if (documentSnapshots.docs[i].data().pms && Array.isArray(documentSnapshots.docs[i].data().pms) && documentSnapshots.docs[i].data().pms.length > 0) {
        promises
          .push(() => constructPM(documentSnapshots.docs[i]))
      }
    }
    cronQueue
      .addAll(promises)
      .then((result) => resolve(result))
      .catch((error) => reject(error))
  })
}

// Checks message to ensure it is correct and then triggers function based on
// message from value
const acceptCron = (req) => {
  return new Promise((resolve, reject) => {
    const message = JSON.parse(Buffer.from(req.body, 'base64').toString())
    if (message.from !== 'PM-Scheduler') {
      reject(new Error({ code: 'Service not found.' }))
    } else {
      admin
        .firestore()
        .collection('assets')
        .where('active', '==', true)
        .get()
        .then((documentSnapshots) => searchPM(documentSnapshots))
        .then((result) => resolve(result))
        .catch((error) => reject(error))
    }
  })
}

// Check if user is an admin
const isAdmin = (userRecord) => {
  return new Promise((resolve, reject) => {
    if (userRecord && userRecord.customClaims && userRecord.customClaims.admin) {
      resolve(true)
    } else {
      reject(new Error({ code: 'not-admin' }))
    }
  })
}

// Set up express config
app
  .use(bodyParser.urlencoded({ extended: false }))
app
  .use(bodyParser.json())
app
  .use(cors(corsOptions))
app
  .engine('.hbs', exphbs({
    extname: '.hbs',
    partialsDir: path.join(__dirname, 'views/partials'),
    layoutsDir: path.join(__dirname, 'views/layouts'),
    defaultLayout: 'main.hbs'
  }))

// Set express view engine to handlebars so nodemailer can use
app
  .set('view engine', '.hbs')
app
  .set('views', path.join(__dirname, 'views'))

// Request to get user claims
app
  .get('/api/claims', (req, res) => {
    getUserClaims(req)
      .then((response) => res.status(200).send(response))
      .catch((error) => {
        errorReport(error)
        return res.status(500).send(error)
      })
  })

// Request to set user claims
app
  .post('/api/claims', (req, res) => {
    setUserClaims(req)
      .then((response) => res.status(200).send(response))
      .catch((error) => {
        errorReport(error)
        return res.status(500).send(error)
      })
  })

// Request for Cron Jobs from Cloud Scheduler, awaits promise from functions
// then returns status to Scheduler.
// Runs every morning at 5, can be configed through GCP
app
  .post('/api/cron', (req, res) => {
    acceptCron(req)
      .then((result) => res.status(200).send(result))
      .catch((error) => {
        console
          .error(error)
        return res.status(500).send(error)
      })
  })

// Request to get server date and time
app
  .get('/api/dateTime', (req, res) => {
    getDateAndTime()
      .then((response) => res.status(200).send(response))
      .catch((error) => {
        errorReport(error)
        return res.status(500).send(error)
      })
  })

// Request for login
app
  .post('/api/login', (req, res) => {
    (async () => {
      try {
        let err = null
        let token = null
        const setToken = (tok) => {
          token = tok
        }
        const setError = (error) => {
          err = error
        }
        // Create a custom token based off of their office365 login
        await createToken(req)
          .then((customToken) => setToken(customToken))
          .catch((error) => { throw error })
        // See if user exists
        await getUser(req)
          .then((userRecord) => res.status(200).send(token))
          .catch((error) => setError(error))
        if (err && err.code === 'auth/user-not-found') {
          // Create user if they do not exist
          await newUserRetry(req)
            // Set custom claims for user after creation
            .then((response) => customClaim(req))
            .then((response) => res.status(200).send(token))
            .catch((error) => { throw error })
        } else if (err && err.code === 'no-custom-claims') {
          await newUser(req)
            // Set custom claims for user after creation
            .then((userRecord) => customClaim(req))
            .then((response) => res.status(200).send(token))
            .catch((error) => { throw error })
        } else if (err) {
          throw err
        }
      } catch (error) {
        errorReport(error)
        res.status(500).send(error)
      }
    })()
  })

// Request to delete user
app
  .post('/api/user/delete', (req, res) => {
    deleteUser(req)
      .then((response) => res.status(200).send(response))
      .catch((error) => {
        if (error.code === 'not-admin') {
          return res.status(403).send('Forbidden')
        } else {
          errorReport(error)
          return res.status(500).send(error)
        }
      })
  })

// Check if requesting user is admin, if so, proceed with creating the new user
app
  .post('/api/user/create', (req, res) => {
    admin
      .auth()
      .getUser(req.body.reqId)
      .then((userRecord) => isAdmin(userRecord))
      .then((response) => admin
        .auth()
        .createUser({
          uid: req.body.userId,
          email: req.body.email,
          emailVerified: true,
          displayName: req.body.displayName
        })
      )
      .then((response) => res.status(200).send(response))
      .catch((error) => res.status(500).send(error))
  })

// Request to update a user's info in firebase, requestor must be admin
app
  .post('/api/user/update', (req, res) => {
    admin
      .auth()
      .updateUser(req.body.uid, {
        displayName: req.body.displayName,
        email: req.body.email,
        emailVerified: true
      })
      .then((userRecord) => getUserData(req.body))
      .then((result) => res.status(200).send(result))
      .catch((error) => {
        errorReport(error)
        return res.status(500).send(error)
      })
  })

// Request to send a reopen work order mail
app
  .post('/api/workorder/open', (req, res) => {
    reopenMailer(req.body)
      .then((response) => res.status(200).send(response))
      .catch((error) => {
        errorReport(error)
        return res.status(500).send(error)
      })
  })

// Export app function
exports.app = functions.https.onRequest(app)

/*
******* End App Function *******
*/

/*
******* Begin New User Function *******
Used to create a user index store in the database to reduce reads when querying
for all users.
*/

// If doc does not exist, add it, if not, update it
const sendToUsersDb = (documentSnapshots, data) => {
  return new Promise((resolve, reject) => {
    if (documentSnapshots.size === 0) {
      admin
        .firestore()
        .collection('usersIndex')
        .add({
          store: data.store,
          users: data.users
        })
        .then((response) => resolve(response))
        .catch((error) => reject(error))
    } else {
      documentSnapshots
        .forEach((doc) => {
          admin
            .firestore()
            .collection('usersIndex')
            .doc(doc.id)
            .update({ users: data.users })
            .then((response) => resolve(response))
            .catch((error) => reject(error))
        })
    }
  })
}

// Get doc based on store number
const getUsersStore = (data) => {
  return new Promise((resolve, reject) => {
    admin
      .firestore()
      .collection('usersIndex')
      .where('store', '==', data.store)
      .get()
      .then((documentSnapshots) => sendToUsersDb(documentSnapshots, data))
      .then((response) => resolve(response))
      .catch((error) => reject(error))
  })
}

// Create users arrays, if the length is greater than 500 create a new "store"
// which goes into a separate doc. The getUsersStore will attempt to grab the store
// if the store does not exist, a new one will be added with the new store number
const updateUsersIndex = (data) => {
  return new Promise((resolve, reject) => {
    const size = data.length
    const errors = []
    // If store has hit it's size limit
    if (size > 500) {
      let tmp = []
      let str = 1
      for (let i = 0; i < size; i++) {
        // Loop through until size is too big, if too big, update store in database
        if (tmp.length >= 500) {
          const as = async (num, arr) => {
            await getUsersStore({ store: num, users: arr })
              .catch((error) => errors.push(error))
          }
          as(str, tmp)
          // Create new store number
          str++
          // Empty array
          tmp = []
        } else {
          // Array is still small enough, push item in to it
          tmp.push(data[i])
        }
      }
      // Send remaining array to store
      getUsersStore({ store: str, users: tmp })
        .then((response) => {
          if (errors.length > 0) {
            return reject(errors)
          } else {
            return resolve(response)
          }
        })
        .catch((error) => reject(error))
    } else {
      // Array is small enough to only have 1 store
      getUsersStore({ store: 1, users: data })
        .then((result) => resolve(result))
        .catch((error) => reject(error))
    }
  })
}

// Put all users' relevant data into an array, sort by name, then update the stores
const compileUserData = (documentSnapshots) => {
  return new Promise((resolve, reject) => {
    const all = []
    documentSnapshots
      .forEach((doc) => {
        all
          .push({
            userId: doc.id,
            displayName: doc.data().displayName
          })
      })
    const sorted = quickSort(all, 'displayName')
    updateUsersIndex(sorted)
      .then((result) => resolve(result))
      .catch((error) => reject(error))
  })
}

// Get the new user, update the info, then get all the users
const getUserData = (user) => {
  return new Promise((resolve, reject) => {
    admin
      .firestore()
      .collection('users')
      .doc(user.uid)
      .set({
        email: user.email,
        displayName: user.displayName
      }, {
        merge: true
      })
      .then(() => admin
        .firestore()
        .collection('users')
        .orderBy('displayName')
        .get()
      )
      .then((documentSnapshots) => compileUserData(documentSnapshots))
      .then((result) => resolve(result))
      .catch((error) => reject(error))
  })
}

// Set a retry loop to add the user, and update the stores
const newUsr = (user) => {
  return new Promise((resolve, reject) => {
    (async () => {
      const errors = []
      const result = []
      for (let i = 0; i <= retry; i++) {
        await getUserData(user)
          .then((response) => result.push(response))
          .catch((error) => errors.push(error))
        if (errors.length === 0) {
          resolve(result)
          break
        } else if (i === retry) {
          reject(errors)
        } else {
          errors.length = 0
        }
      }
    })()
  })
}

// Create DB entry automatically for new users then get last user store doc in
// usersIndex collection, check the size, if too big (set a default of 500 items), sort all
// users, split up array into correct sizes,
// create another doc, if not insert user object and then update
exports.createNewUserDB = functions.auth.user().onCreate((user) => {
  return new Promise((resolve, reject) => {
    newUsr(user)
      .then((response) => resolve(response))
      .catch((error) => {
        errorReport(error)
        return reject(error)
      })
  })
})

/*
******* End New User Function *******

******* Begin Work Order Count Function *******
*/

// Get user's email
const getEmail = (data) => {
  return new Promise((resolve, reject) => {
    admin
      .auth()
      .getUser(data)
      .then((userRecord) => resolve(userRecord.email))
      .catch((error) => reject(error))
  })
}

// Mail WO
const mailOrder = (data) => {
  return new Promise((resolve, reject) => {
    // Email both assigned to worker and user who put the wo in, create links with their usernames
    if (data.data.assignedTo && data.data.assignedTo.workerId && data.data.userId) {
      // Link for worker that ticket is assigned to
      const lnkOne = `https://.org/${data.data.assignedTo.displayName.replace(/\s+/g, '')}/workorder/${data.id}`
      // Link for user that created ticket
      const lnkTwo = `https://.org/${data.data.user.replace(/\s+/g, '')}/workorder/${data.id}`
      // Get the user's email and then mail
      getEmail(data.data.assignedTo.workerId)
        .then((response) => workerMail({
          to: response,
          subject: `DEMO Work Order Assigned - ${data.data.subject} #${data.data.ticketNumber}`,
          body: '<p><b>Work Order Ticket Assigned.</b><br>Click the link below to view your ticket.</p>',
          link: lnkOne
        }))
        // Get the other user's email and then mail
        .then((response) => getEmail(data.data.userId))
        .then((response) => hbsMail({
          to: response,
          subject: `DEMO Work Order - ${data.data.subject} #${data.data.ticketNumber}`,
          body: '<p><b>Work Order Ticket Created.</b><br>Click the link below to view your ticket.</p>',
          link: lnkTwo
        }))
        .then((response) => resolve(response))
        .catch((error) => reject(error))
    } else if (data.data.userId) {
      const lnk = `https://.org/${data.data.user.replace(/\s+/g, '')}/workorder/${data.id}`
      // Get the user's email and then mail
      getEmail(data.data.userId)
        .then((response) => hbsMail({
          to: response,
          subject: `DEMO Work Order - ${data.data.subject} #${data.data.ticketNumber}`,
          body: '<p><b>Work Order Ticket Created.</b><br>Click the link below to view your ticket.</p>',
          link: lnk
        }))
        .then((response) => resolve(response))
        .catch((error) => reject(error))
    } else {
      resolve('No UID')
    }
  })
}

// Keep assignment history by creating an array with dates, who it was assigned to, and who reassigned it
const constructReassign = (doc, data) => {
  return new Promise((resolve, reject) => {
    try {
      const arr = []
      if (doc.data().reassigned) {
        for (let i = 0; i < doc.data().reassigned.length; i++) {
          arr[i] = doc.data().reassigned[i]
        }
      }
      arr
        .push({
          date: moment().tz('America/New_York').format('MM/DD/YYYY hh:mm:ss A'),
          new: data.after.data().assignedTo,
          old: data.before.data().assignedTo,
          reAssignedBy: (data.after.data().reAssignedBy) ? data.after.data().reAssignedBy : null
        })
      resolve(arr)
    } catch (error) {
      reject(error)
    }
  })
}

// Add to reassigned field in work order
const setReassigned = (data) => {
  return new Promise((resolve, reject) => {
    admin
      .firestore()
      .collection('workOrders')
      .doc(data.after.id)
      .get()
      .then((doc) => constructReassign(doc, data))
      .then((arr) => admin
        .firestore()
        .collection('workOrders')
        .doc(data.after.id)
        .update({ reassigned: arr })
      )
      .then((response) => resolve(response))
      .catch((error) => reject(error))
  })
}

exports.workOrderCount = functions.firestore.document('workOrders/{orderId}').onWrite((change, context) => {
  return new Promise((resolve, reject) => {
    if (!change.before.exists && change.after.data().workOrderType !== 'PM') {
      // Mail new work order, no other functions needed
      mailOrder({ data: change.after.data(), id: context.params.orderId })
        .then((response) => resolve(response))
        .catch((error) => {
          errorReport(error)
          return reject(error)
        })
    } else if (change.before.exists && change.after.exists && change.before.data().assignedTo && change.before.data().assignedTo.workerId && change.before.data().assignedTo.workerId !== change.after.data().assignedTo.workerId && change.after.data().workOrderType === 'PM') {
      // PM has changed hands, set reassigned
      setReassigned({ after: change.after, before: change.before })
        .then((response) => resolve(response))
        .catch((error) => {
          errorReport(error)
          return reject(error)
        })
    } else if (change.before.exists && change.after.exists && change.before.data().assignedTo && change.before.data().assignedTo.workerId && change.before.data().assignedTo.workerId !== change.after.data().assignedTo.workerId) {
      // Work order has changed hands, set reassigned
      const lnk = `https://.org/${change.after.data().assignedTo.displayName.replace(/\s+/g, '')}/workorder/${context.params.orderId}`
      setReassigned({ after: change.after, before: change.before })
        .then((response) => getEmail(change.after.data().assignedTo.workerId))
        .then((response) => workerMail({
          to: response,
          subject: `DEMO Work Order Assigned - ${change.after.data().subject} #${change.after.data().ticketNumber}`,
          body: '<p><b>Work Order Ticket Assigned.</b><br>Click the link below to view your ticket.</p>',
          link: lnk
        }))
        .then((response) => resolve(response))
        .catch((error) => {
          errorReport(error)
          return reject(error)
        })
    } else if (change.before.exists && change.after.exists && change.before.data().status === 'Open' && change.after.data().status === 'Open' && !change.before.data().assignedTo && change.after.data().assignedTo && change.after.data().assignedTo.workerId) {
      // Work order was not assigned before, but now is assigned
      const lnk = `https://.org/${change.after.data().assignedTo.displayName.replace(/\s+/g, '')}/workorder/${context.params.orderId}`
      getEmail(change.after.data().assignedTo.workerId)
        .then((response) => workerMail({
          to: response,
          subject: `DEMO Work Order Assigned - ${change.after.data().subject} #${change.after.data().ticketNumber}`,
          body: '<p><b>Work Order Ticket Assigned.</b><br>Click the link below to view your ticket.</p>',
          link: lnk
        }))
        .then((response) => resolve(response))
        .catch((error) => {
          errorReport(error)
          return reject(error)
        })
    } else {
      resolve('Nothing to do.')
    }
  })
})

/*
******* End Work Order Count Function *******

******* Begin Comment Mail Function ********
*/

// Send mail
const commentMail = (data) => {
  return new Promise((resolve, reject) => {
    const mail = {
      from: 'postmaster@.org',
      to: data.to,
      subject: data.subject,
      template: 'comment',
      text: data.text,
      context: {
        body: data.body,
        link: data.link
      }
    }
    hbsPromise(mail)
      .then((response) => resolve(response))
      .catch((error) => reject(error))
  })
}

// Get user's email
const getWorkerEmail = (data) => {
  return new Promise((resolve, reject) => {
    try {
      if (data.assignedTo && data.assignedTo.workerId) {
        admin
          .auth()
          .getUser(data.assignedTo.workerId)
          .then((userRecord) => resolve({ email: userRecord.email, displayName: userRecord.displayName }))
          .catch((error) => reject(error))
      } else {
        resolve({ email: false })
      }
    } catch (error) {
      reject(error)
    }
  })
}

exports.commentsMailer = functions.firestore.document('comments/{commentId}').onWrite((change, context) => {
  return new Promise((resolve, reject) => {
    if (change.after.exists) {
      const emails = []
      // Keep comments sorted by date
      const comments = change.after.data().comments.sort((a, b) => {
        return new Date(a.time) - new Date(b.time)
      })
      // Last comment in array
      const last = comments[comments.length - 1]
      // Check if the email is already in the array so it does not send mulitple times
      const isThere = (email) => {
        let yes = false
        for (let i = 0; i < emails.length; i++) {
          if (email === emails[i].email) {
            yes = true
          }
        }
        return yes
      }
      // Add assigned to to the email list
      admin
        .firestore()
        .collection('workOrders')
        .doc(change.after.data().orderId)
        .update({
          lastUpdated: admin.firestore.Timestamp.now()
        })
        .then(() => admin
          .firestore()
          .collection('workOrders')
          .doc(change.after.data().orderId)
          .get()
        )
        .then((doc) => getWorkerEmail(doc.data()))
        .then((response) => {
          if (response.email) {
            emails
              .push({
                displayName: response.displayName,
                email: response.email
              })
          }
          if (change.after.data().ownerEmail) {
            emails
              .push({
                displayName: change.after.data().ownerName,
                email: change.after.data().ownerEmail
              })
          }
          for (let i = 0; i < comments.length; i++) {
            if (comments[i].email && !isThere(comments[i].email)) {
              emails
                .push({
                  displayName: comments[i].displayName,
                  email: comments[i].email
                })
            }
          }
          // Remove email if its tagged as ignore
          if (change.after.data().ignoreEmail) {
            for (let i = 0; i < emails.length; i++) {
              if (emails[i].email === change.after.data().ignoreEmail) {
                emails
                  .splice(i, 1)
              }
            }
          }
          for (let i = 0; i < emails.length; i++) {
            // Send mails
            commentMail({
              to: emails[i].email,
              subject: 'DEMO Work Order - New Comment',
              text: last.text,
              body: '<p><b>New Work Order Comment.</b><br>Click the link below to view your ticket.</p>',
              link: `https://.org/${emails[i].displayName.replace(/\s+/g, '')}/workorder/${change.after.data().orderId}`
            })
          }
          return true
        })
        .catch((error) => errorReport(error))
    }
    resolve(true)
  })
})

/*
******* End Comment Mail Function ********
*/
