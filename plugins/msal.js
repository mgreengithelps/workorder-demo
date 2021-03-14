import Vue from 'vue'
import * as Msal from 'msal'
import axios from 'axios'
import fb from '@/plugins/firebase'

// Wrapping in export so we can access app's context, giving us access to store
// This way we can set errors if they occur
export default ({ app: { store } }) => {
  const firebase = fb.firebase

  // Set axios base URL for production or dev (note, @/functions/index.js runs on port 5000)
  const baseUrl = (window.location.origin === 'http://localhost:3000') ? 'http://localhost:5000' : window.location.origin

  // Register MSAL with config
  const msalInstance = new Msal.UserAgentApplication({
    auth: {
      clientId: '',
      authority: '',
      validateAuthority: false,
      navigateToLoginRequestUrl: false,
      redirectUri: window.location.origin
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false
    },
    system: {
      navigateFrameWait: 0,
      logger: {
        error: console.error,
        errorPii: console.error,
        info: console.log,
        infoPii: console.log,
        verbose: console.log,
        verbosePii: console.log,
        warning: console.warn,
        warningPii: console.warn
      }
    }
  })

  // Scope of MS request
  const tokenRequest = {
    scopes: [
      'user.read'
    ]
  }
  // Check if Error is a user interaction needed error
  const requiresInteraction = (errorCode) => {
    if (!errorCode || !errorCode.length) {
      return false
    }
    return errorCode === 'consent_required' ||
      errorCode === 'interaction_required' ||
      errorCode === 'login_required'
  }

  // Send MS UID to Backend for Custom Token creation then sign in user to firebase with token
  // so user can log in to Firebase, see @/functions/index.js for more information
  const fireBaseLogin = (data) => {
    axios
      .request({
        url: `${baseUrl}/api/login`,
        method: 'POST',
        data
      })
      .then((response) => firebase
        .auth()
        .signInWithCustomToken(response.data)
      )
      .catch((error) => {
        store
          .dispatch('updateLocalErrors', error)
      })
  }

  // Use Access Token to call MS Graph to get user information
  const callMSGraph = (accessToken) => {
    axios
      .get('https://graph.microsoft.com/v1.0/me', {
        headers: { 'Authorization': 'Bearer ' + accessToken }
      })
      .then((response) => { fireBaseLogin(response.data) })
      .catch((error) => {
        store
          .dispatch('updateLocalErrors', error)
      })
  }

  // Try to obtain token silent at first, if the error returned requires user interaction
  // have token obtained via redirect
  const acquireTokenRedirectAndCallMSGraph = () => {
    msalInstance
      .acquireTokenSilent(tokenRequest)
      .then((response) => { callMSGraph(response.accessToken) })
      .catch((error) => {
        // If MSAL cannot get Token Silent it requires a redirect
        if (requiresInteraction(error.errorCode)) {
          msalInstance
            .acquireTokenRedirect(tokenRequest)
        } else {
          store
            .dispatch('updateLocalErrors', error)
        }
      })
  }

  // Function to handle redirect callback
  const handleRedirect = (error, response) => {
    if (error) {
      store
        .dispatch('updateLocalErrors', error)
    } else if (response.tokenType === 'access_token') {
      acquireTokenRedirectAndCallMSGraph()
    }
  }

  // Register call back function for redirect
  msalInstance
    .handleRedirectCallback(handleRedirect)

  // avoid duplicate code execution on page load in case of iframe and popup window.
  if (msalInstance.getAccount() && !msalInstance.isCallback(window.location.hash)) {
    acquireTokenRedirectAndCallMSGraph()
  }

  // Register MSAL globally
  Vue.$msal = Vue.prototype.$msal = msalInstance

  // Register Scope of request Globally (used in login with redirect on index page)
  Vue.$tokenRequest = Vue.prototype.$tokenRequest = tokenRequest
  Vue.$signInLoading = Vue.prototype.$signInLoading = true
}
