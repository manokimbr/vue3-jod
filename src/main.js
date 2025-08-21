// main.js
// ----------------------------------------------------------------------------
// Icons (MDI) via NPM: load once, locally, version-locked.
// - No external CDN hop (fewer points of failure, easier CSP: style-src 'self')
// - Works great with SSR/Edge (Node 22 LTS) because assets are built & served by us
// - Deterministic builds: same icon version in every environment
import '@mdi/font/css/materialdesignicons.css'

import { createApp } from 'vue'
import App from './App.vue'

// Vuetify plugin with explicit, tree-shaken components and MDI icon set
// (see plugins/vuetify.js for the rationale + whitelist of components)
import { vuetify } from './plugins/vuetify'

// Boot the app
createApp(App)
  .use(vuetify)
  .mount('#app')
