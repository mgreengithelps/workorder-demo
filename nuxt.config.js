import colors from 'vuetify/es5/util/colors'

module.exports = {
  mode: 'spa',

  /*
  ** Headers of the page
  */
  head: {
    title: 'Work Order & Asset MGMT',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Work Order, Asset Management, and PM System DEMO.' },
      { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto+Condensed&display=swap' }
    ]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },

  /*
  ** Global CSS
  */
  css: [
  ],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '@/plugins/firebase',
    '@/plugins/msal',
    '@/plugins/bus',
    '@/plugins/moment'
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    '@nuxtjs/eslint-module'
  ],

  buildModules: [
    '@nuxtjs/vuetify'
  ],

  /*
  ** Axios module configuration
  */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
    baseURL: (process.env.NODE_ENV !== 'production') ? 'http://localhost:5000/api' : 'https://DEMO.DEMO/api'
  },

  vuetify: {
    customVariables: [
      '~/assets/style/variables.scss'
    ],
    defaultAssets: {
      font: false
    },
    theme: {
      themes: {
        light: {
          primary: '#00A4E9',
          accent: colors.grey.darken3,
          secondary: '#616365',
          info: '#00C6AA',
          warning: '#F9F871',
          error: '#D13229',
          success: '#5dab6d',
          darkBlue: '#181E21'
        },
        dark: {
          primary: '#00A4E9',
          accent: colors.grey.darken3,
          secondary: '#616365',
          info: '#00C6AA',
          warning: '#F9F871',
          error: '#D13229',
          success: '#5dab6d',
          darkBlue: '#181E21'
        }
      }
    },
    treeShake: true
  },

  workbox: {
    cachingExtensions: '@/plugins/wb-ext.js'
    /*
    runtimeCaching: [
      {
        urlPattern: '/api/.*',
        handler: 'staleWhileRevalidate',
        method: 'GET'
      }
    ]
    */
  },

  manifest: {
    name: 'Work Order Demo',
    display: 'standalone',
    orientation: 'any',
    short_name: 'DEMO WO',
    start_url: '/',
    theme_color: '#181e21'
  },

  /*
  ** Build configuration
  */
  build: {
    // analyze: true,
    babel: {
      presets(env, [ preset, options ]) {
        return [
          [
            '@nuxt/babel-preset-app',
            {
              targets: {
                ie: 11
              }
            }
          ]
        ]
      }
    },
    transpile: [
      'vuetify'
    ],
    extend(config, ctx) {
    }
  }
}
