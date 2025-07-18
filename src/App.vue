<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar color="primary" dark>
      <v-toolbar-title>🧠 vue3-jod</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="toggleTheme" :title="`Switch to ${nextTheme} mode`">
        <v-icon>
          {{ currentTheme === 'dark' ? 'mdi-white-balance-sunny' : 'mdi-weather-night' }}
        </v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Main -->
    <v-main>
      <v-container class="fill-height d-flex flex-column align-center justify-center">
        <v-card class="pa-6" elevation="12" max-width="700">
          <v-card-title class="text-h5 text-center">
            🧬 Awareness-Driven Frontend
          </v-card-title>

          <v-card-text>
            <v-alert type="success" title="✅ Vuetify OK" class="mb-4">
              Vuetify components are functional.
            </v-alert>

            <div v-if="loading">🤖 Handshaking with backend...</div>
            <div v-else>
              <p><strong>Message:</strong> {{ apiData.message }}</p>
              <p><strong>Version:</strong> {{ apiData.version }}</p>
              <p><strong>Env:</strong> {{ apiData.env }}</p>
              <p><strong>Port:</strong> {{ apiData.port }}</p>
            </div>

            <v-divider class="my-4"></v-divider>
            <h4 class="text-subtitle-1 mb-2">📱 Device Awareness</h4>
            <p><strong>Device Type:</strong> {{ deviceType }}</p>
            <p><strong>Screen Width:</strong> {{ screenWidth }}px</p>
            <p><strong>Touch Support:</strong> {{ hasTouch ? 'Yes' : 'No' }}</p>
            <p><strong>Inactive for:</strong> {{ inactivitySeconds }} seconds</p>

            <v-divider class="my-4"></v-divider>
            <h4 class="text-subtitle-1 mb-2">🧠 System Awareness</h4>
            <p><strong>System Prefers:</strong> {{ systemPrefers }}</p>
            <p><strong>Reduced Motion:</strong> {{ prefersReducedMotion }}</p>
            <p><strong>Language:</strong> {{ language }}</p>
            <p><strong>Timezone:</strong> {{ timezone }}</p>
            <p><strong>Do Not Track:</strong> {{ dnt }}</p>
            <p><strong>Online:</strong> {{ isOnline ? 'Yes' : 'No' }}</p>

            <v-divider class="my-4"></v-divider>
            <h4 class="text-subtitle-1 mb-2">🧪 System Info</h4>
            <p><strong>User Agent:</strong> {{ userAgent }}</p>
            <p><strong>Platform:</strong> {{ platform }}</p>
            <p><strong>Device Memory:</strong> {{ memory }} GB</p>
            <p><strong>CPU Cores:</strong> {{ cpuCores }}</p>

            <v-divider class="my-4"></v-divider>
            <h4 class="text-subtitle-1 mb-2">📦 LocalStorage</h4>
            <p><strong>Theme:</strong> {{ localStorageTheme }}</p>
            <p><strong>Anon ID:</strong> {{ anonId }}</p>
            <v-btn color="error" size="small" class="mt-2" @click="clearLocalStorage">🧹 Clear LocalStorage</v-btn>

            <v-divider class="my-4"></v-divider>
            <h4 class="text-subtitle-1 mb-2">📊 Browser Performance</h4>
            <p><strong>Estimated FPS:</strong> {{ fps }}</p>
            <p><strong>Heap Used:</strong> {{ heapUsed }} MB</p>
            <p><strong>Heap Limit:</strong> {{ heapLimit }} MB</p>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { useTheme } from 'vuetify'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

/* === THEME AWARENESS === */
const theme = useTheme()
const currentTheme = computed(() => theme.name.value)
const nextTheme = computed(() => (currentTheme.value === 'dark' ? 'light' : 'dark'))
const localStorageTheme = ref(localStorage.getItem('theme'))

function toggleTheme() {
  const newTheme = nextTheme.value
  theme.change(newTheme)
  localStorage.setItem('theme', newTheme)
  localStorageTheme.value = newTheme
}

function detectSystemPreferredTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

if (localStorageTheme.value) {
  theme.change(localStorageTheme.value)
} else {
  const preferred = detectSystemPreferredTheme()
  theme.change(preferred)
  localStorage.setItem('theme', preferred)
  localStorageTheme.value = preferred
}

/* === BACKEND HANDSHAKE === */
const apiData = ref({})
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/ping`)
    apiData.value = await res.json()
  } catch {
    apiData.value = { message: '❌ Could not reach backend.' }
  } finally {
    loading.value = false
  }
})

/* === DEVICE + SYSTEM AWARENESS === */
const screenWidth = ref(window.innerWidth)
const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
const deviceType = computed(() => {
  if (screenWidth.value < 600) return 'Mobile'
  if (screenWidth.value < 1024) return 'Tablet'
  return 'Desktop'
})
const systemPrefers = ref('unknown')
const prefersReducedMotion = ref('No')
const userAgent = ref(navigator.userAgent)
const platform = ref(navigator.platform)
const language = ref(navigator.language)
const timezone = ref(Intl.DateTimeFormat().resolvedOptions().timeZone)
const dnt = ref(navigator.doNotTrack === '1' ? 'Enabled' : 'Disabled')
const isOnline = ref(navigator.onLine)
const memory = ref(navigator.deviceMemory || 'Unknown')
const cpuCores = ref(navigator.hardwareConcurrency || 'Unknown')

function updateScreen() {
  screenWidth.value = window.innerWidth
}
function detectPreferences() {
  systemPrefers.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark Mode' : 'Light Mode'
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'Yes' : 'No'
}

window.addEventListener('online', () => (isOnline.value = true))
window.addEventListener('offline', () => (isOnline.value = false))
onMounted(() => {
  updateScreen()
  detectPreferences()
  window.addEventListener('resize', updateScreen)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScreen)
})

/* === INACTIVITY TRACKING === */
const inactivitySeconds = ref(0)
let inactivityTimer
function resetInactivity() {
  inactivitySeconds.value = 0
}
function startInactivityTimer() {
  clearInterval(inactivityTimer)
  inactivityTimer = setInterval(() => inactivitySeconds.value++, 1000)
}
const userEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
userEvents.forEach(event => window.addEventListener(event, resetInactivity))
onMounted(() => {
  resetInactivity()
  startInactivityTimer()
})
onBeforeUnmount(() => {
  clearInterval(inactivityTimer)
  userEvents.forEach(event => window.removeEventListener(event, resetInactivity))
})

/* === LOCAL STORAGE MGMT === */
const anonIdKey = 'anon-id'
const anonId = ref(localStorage.getItem(anonIdKey) || crypto.randomUUID())
localStorage.setItem(anonIdKey, anonId.value)
function clearLocalStorage() {
  localStorage.clear()
  location.reload()
}

/* === PERFORMANCE === */
const fps = ref('Calculating...')
const heapUsed = ref('Unknown')
const heapLimit = ref('Unknown')

let frameCount = 0
let fpsStartTime = performance.now()

function estimateFPS(now) {
  frameCount++
  const elapsed = now - fpsStartTime
  if (elapsed >= 1000) {
    fps.value = Math.round((frameCount * 1000) / elapsed)
    frameCount = 0
    fpsStartTime = now
  }
  requestAnimationFrame(estimateFPS)
}

requestAnimationFrame(estimateFPS)

if (performance.memory) {
  heapUsed.value = Math.round(performance.memory.usedJSHeapSize / 1048576) // MB
  heapLimit.value = Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
}
</script>
