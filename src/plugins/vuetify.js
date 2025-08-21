// plugins/vuetify.js
// ============================================================================
// Why manual component registration?
// ----------------------------------------------------------------------------
// 1) Smaller bundles, better tree-shaking:
//    - Vuetify can register everything globally, but that often pulls in
//      components you don’t use. Explicit imports let bundlers tree-shake
//      unused code, keeping your app snappy on low-end/mobile devices.
//
// 2) Deterministic, reviewable surface:
//    - A single whitelist of allowed components (below) makes code reviews
//      and security audits straightforward. If a page needs a new widget,
//      you import it explicitly and reviewers see the change.
//
// 3) SSR/Edge friendliness (Node 22 LTS):
//    - When rendering on the server/edge, deterministic registration avoids
//      “it worked locally but not in SSR” surprises. Explicitness = fewer
//      hydration mismatches and easier debugging.
//
// 4) Performance & DX:
//    - Faster cold starts on mobile networks (less JS to parse).
//    - Clear auto-completion/typing in IDEs because imports are explicit.
//    - You can later code-split very heavy components on demand.
//
// Icons & themes:
// - We lock the icon set to MDI for consistency and offline-friendly behavior.
// - Centralized themes make light/dark switching and brand updates predictable.
//
// NOTE: Ensure you import the MDI font CSS once in your app entry (e.g. main.js):
//   import '@mdi/font/css/materialdesignicons.css'
// ============================================================================

import 'vuetify/styles'               // Base Vuetify styles (required once)
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { themes } from '../themes'     // Your centralized theme tokens (dark/light, brand)

// We import ONLY the components we actually use.
// Add/remove items here to control your surface area and bundle size.
import {
  VApp,
  VMain,
  VContainer,
  VCard,
  VCardTitle,
  VCardText,
  VAlert,
  VAppBar,
  VBtn,
  VIcon,
  VSpacer,
  VToolbarTitle,
  VDivider,
  VCol,
  VRow,
} from 'vuetify/components'

export const vuetify = createVuetify({
  // Explicit, whitelist-style component registration:
  // - Keeps the global registry lean
  // - Enables better tree-shaking in modern bundlers
  components: {
    VApp,
    VMain,
    VContainer,
    VCard,
    VCardTitle,
    VCardText,
    VAlert,
    VAppBar,
    VBtn,
    VIcon,
    VSpacer,
    VToolbarTitle,
    VDivider,
    VCol,
    VRow,
  },

  // Icon strategy:
  // - Force the Material Design Icons set to avoid accidental fallbacks
  // - `aliases` gives you friendly names; `sets` binds to the MDI pack
  // - Works great with '@mdi/font' (remember to import its CSS in main.js)
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },

  // Theme strategy:
  // - A single source of truth in ../themes for tokens (colors, elevations, etc.)
  // - Defaulting to 'dark' here is deliberate for modern UIs; can be toggled at runtime
  theme: {
    defaultTheme: 'dark',
    themes,
  },
})
