<!-- AwarenessPanel.vue -->
<template>
  <!--
    Layout shell
    - fluid + no-gutters keeps content edge-to-edge on mobile while preserving the grid.
    - One column: simple and responsive (we handle typography via classes below).
  -->
  <v-container class="pa-0" fluid>
    <v-row no-gutters>
      <v-col cols="12">
        <!--
          Card presentation strategy:
          - Elevation only on Desktop to suggest "panel" without adding mobile shadow noise.
          - Classes are chosen at runtime based on deviceType (from the composable) instead of media queries,
            which keeps behavior consistent with SSR/Edge (no flash across hydration).
          - Max width constrains readability on large screens.
        -->
        <v-card
          :elevation="deviceType === 'Desktop' ? 12 : 0"
          :class="[
            'w-100',
            deviceType === 'Desktop' ? 'pa-6 mx-auto mt-10 desktop-card' : 'pa-6 rounded-0',
            deviceType === 'Tablet' ? 'tablet-card' : '',
            deviceType === 'Mobile' ? 'mobile-card' : ''
          ]"
          :max-width="deviceType === 'Desktop' ? 720 : undefined"
        >
          <!--
            Title sizing:
            - We bump size on Mobile to keep it readable at arm’s length.
          -->
          <v-card-title
            class="text-center"
            :class="deviceType === 'Mobile' ? 'text-h4' : 'text-h5'"
          >
            🧼 Awareness-Driven Frontend
          </v-card-title>

          <v-card-text>
            <!--
              Smoke test alert:
              - Confirms Vuetify is wired and components render.
              - Good for first-run diagnostics.
            -->
            <v-alert type="success" title="✅ Vuetify OK" class="mb-6">
              Vuetify components are functional.
            </v-alert>

            <!--
              Backend handshake:
              - aria-live="polite" announces loading status to screen readers without being intrusive.
              - We keep the skeleton simple to avoid extra component registrations here.
            -->
            <div v-if="loading" class="text-center text-subtitle-1 mb-6" aria-live="polite">
              🤖 Handshaking with backend...
            </div>

            <!--
              When the ping resolves, we show env/version for quick ops visibility.
              - This leverages strict VITE_API_BASE handling inside the composable.
            -->
            <div v-else>
              <p><strong>Message:</strong> {{ apiData.message }}</p>
              <p><strong>Version:</strong> {{ apiData.version }}</p>
              <p><strong>Env:</strong> {{ apiData.env }}</p>
              <p><strong>Port:</strong> {{ apiData.port }}</p>
            </div>

            <v-divider class="my-6" />

            <!--
              Device Awareness:
              - All values come from the composable, which is SSR/Edge-safe (no window/navigator at module top).
              - We prefer runtime detection over CSS-only to keep logic in one place.
            -->
            <h4 class="text-h6 mb-2">📱 Device Awareness</h4>
            <p><strong>Device Type:</strong> {{ deviceType }}</p>
            <p><strong>Screen Width:</strong> {{ screenWidth }}px</p>
            <p><strong>Touch Support:</strong> {{ hasTouch ? 'Yes' : 'No' }}</p>
            <p><strong>Inactive for:</strong> {{ inactivitySeconds }} seconds</p>

            <v-divider class="my-6" />

            <!--
              System Awareness:
              - These are user/system preferences and signals that often guide UI decisions (animations, theme, etc.).
              - The composable listens to media queries + online/offline events and cleans up on unmount.
            -->
            <h4 class="text-h6 mb-2">🧐 System Awareness</h4>
            <p><strong>System Prefers:</strong> {{ systemPrefers }}</p>
            <p><strong>Reduced Motion:</strong> {{ prefersReducedMotion }}</p>
            <p><strong>Language:</strong> {{ language }}</p>
            <p><strong>Timezone:</strong> {{ timezone }}</p>
            <p><strong>Do Not Track:</strong> {{ dnt }}</p>
            <p><strong>Online:</strong> {{ isOnline ? 'Yes' : 'No' }}</p>

            <v-divider class="my-6" />

            <!--
              System Info:
              - `platform` prefers UA-CH (Chromium) with a safe fallback, so Safari/Firefox may show "Unknown".
              - `memory` and heap metrics degrade gracefully on non-Chromium; UI remains functional.
            -->
            <h4 class="text-h6 mb-2">📊 System Info</h4>
            <p><strong>User Agent:</strong> {{ userAgent }}</p>
            <p><strong>Platform:</strong> {{ platform }}</p>
            <p><strong>Device Memory:</strong> {{ memory }} GB</p>
            <p><strong>CPU Cores:</strong> {{ cpuCores }}</p>

            <v-divider class="my-6" />

            <!--
              LocalStorage:
              - Exposes a coarse theme and a local anonymous ID (for demos/labs).
              - The "Clear LocalStorage" helper also reloads the page to reflect a clean state.
            -->
            <h4 class="text-h6 mb-2">📦 LocalStorage</h4>
            <p><strong>Theme:</strong> {{ localStorageTheme }}</p>
            <p><strong>Anon ID:</strong> {{ anonId }}</p>
            <v-btn color="error" size="x-large" class="mt-4" @click="clearLocalStorage">
              🧹 Clear LocalStorage
            </v-btn>

            <v-divider class="my-6" />

            <!--
              Browser Performance:
              - `fps` is a lightweight rAF-based estimate; we pause it when the tab is hidden.
              - Heap numbers only show on Chromium; elsewhere they read "Unknown" by design.
            -->
            <h4 class="text-h6 mb-2">📊 Browser Performance</h4>
            <p><strong>Estimated FPS:</strong> {{ fps }}</p>
            <p><strong>Heap Used:</strong> {{ heapUsed }} MB</p>
            <p><strong>Heap Limit:</strong> {{ heapLimit }} MB</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// Component logic stays minimal: we consume a single composable.
//
// Why this approach?
// - The heavy lifting (feature detection, listeners, timers, cleanup) lives in
//   utils/devMetrics.js, which is SSR/Edge-safe and cleans up after itself.
// - This keeps the SFC presentation-first and easy to reason about.

import { useDevMetrics } from './utils/devMetrics.js'

// Destructure only what we render here; this helps tree-shaking and readability.
// The composable handles: strict env for backend ping, UA-CH fallbacks, reduced-motion,
// passive listeners, rAF cleanup, and visibility-based pausing.
const {
  apiData,
  loading,
  screenWidth,
  hasTouch,
  deviceType,
  systemPrefers,
  prefersReducedMotion,
  userAgent,
  platform,
  language,
  timezone,
  dnt,
  isOnline,
  memory,
  cpuCores,
  anonId,
  clearLocalStorage,
  localStorageTheme,
  fps,
  heapUsed,
  heapLimit,
  inactivitySeconds
} = useDevMetrics()

// Tip (optional):
// If you later add network stats from the composable (effectiveType/saveData/downlink),
// just extend the destructuring and render another section—no extra wiring needed.
</script>

<style scoped>
/*
  Responsive typography strategy:
  - We size content by "device class" (Mobile/Tablet/Desktop) at runtime,
    keeping the visual rhythm consistent with the composable’s detection.
  - Using rem ensures better readability across zoom levels and DPIs.
  - Scoped styles prevent leakage to other components.
*/

.mobile-card {
  font-size: 1.9rem;
  line-height: 2.5;
}

.tablet-card {
  font-size: 1.5rem;
  line-height: 2.2;
}

.desktop-card {
  font-size: 1rem;
  line-height: 1.6;
}

/* 🔠 Mobile emphasis:
   - Larger tappable targets and stronger heading weight for small screens.
   - These overrides are specific to the mobile-card class applied at runtime.
*/
.mobile-card p,
.mobile-card h4,
.mobile-card .v-card-title,
.mobile-card .v-alert,
.mobile-card .v-btn {
  font-size: 1.8rem !important;
}

.mobile-card .v-card-title {
  font-weight: 800;
  letter-spacing: 0.02em;
}

.mobile-card .v-btn {
  font-size: 1.6rem !important;
  padding: 18px 28px !important;
  border-radius: 12px;
}

.mobile-card .v-alert {
  padding: 24px;
}
</style>
