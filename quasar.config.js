import { defineConfig } from '#q-app'

export default defineConfig(ctx => {
  return {
    boot: [],

    css: ['app.scss'],

    extras: ['roboto-font', 'material-icons'],

    build: {
      target: {},
      vueRouterMode: 'history',
      env: {
        API_URL: ctx.dev
          ? 'http://localhost:9091/api/v1'
          : 'https://api.wdpcare.com/api/v1'
      }
    },

    devServer: {
      open: true,
      proxy: {
        '/api': {
          target: 'https://api.wdpcare.com',
          changeOrigin: true,
          secure: false
        }
      }
    },

    framework: {
      config: {},
      plugins: ['Dialog', 'Notify']
    },

    animations: [],

    ssr: {
      prodPort: 3000,
      middlewares: ['render']
    },

    ssg: {},

    pwa: {
      workboxMode: 'GenerateSW'
    },

    cordova: {},

    capacitor: {
      hideSplashscreen: true
    },

    electron: {
      preloadScripts: ['electron-preload'],
      inspectPort: 5858,
      bundler: 'packager',
      packager: {},
      builder: {
        appId: 'admin'
      }
    },

    bex: {
      extraScripts: []
    }
  }
})
