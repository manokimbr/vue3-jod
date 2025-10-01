// utils/devMetrics.js
// ============================================================================
// 🔰 What is this?
// ----------------------------------------------------------------------------
// This is a Vue Composition API *composable*: `useDevMetrics()`.
// It centralizes “awareness” for our frontend — device, system, network,
// and lightweight performance telemetry — and exposes reactive values
// to any component. UI stays clean; logic is reusable and testable.
//
// 🧭 Why this design (defending our stack)?
// - **SSR/Edge safety** (Node 22 LTS): no `window`/`navigator` at module top.
//   All Web API access happens inside `onMounted`, so the same code can be
//   imported by a server renderer (Node 22) without blowing up.
// - **Evergreen-first, graceful degradation**: on Chromium (Chrome/Edge/Brave)
//   we expose richer metrics (heap, device memory, UA-CH, Network Info).
//   On Firefox/Safari, those simply read “Unknown” — the UI still works.
// - **Battery/CPU considerate**: pauses loops when the tab is hidden,
//   uses passive listeners for scroll/touch, and respects reduced-motion.
// - **Operational realism**: abortable backend ping (timeout), debounced resize,
//   cross-tab theme sync via `storage` events + local setter.
//
// 🎯 What it exposes (high level):
// - Device: type, viewport width, touch support
// - System: dark/light, reduced-motion, language, timezone, DNT, online/offline
// - Hardware estimate: deviceMemory (Chromium), hardwareConcurrency
// - Network (when supported): effectiveType, saveData, downlink
// - Perf: FPS; JS heap (Chromium only)
// - UX: user inactivity seconds
// - Backend ping (strict `VITE_API_BASE`)
// - Theme persistence: `localStorageTheme` + `setTheme(next)`
//
// 🛠 Targeting the edge of the stack
// - **Frontend**: device- & browser-friendly with progressive enhancement.
// - **Backend/runtime**: **Node 22 LTS** gives native Web APIs (fetch/streams/crypto)
//   for SSR/Edge routes; this composable stays import-safe in that environment.
// ============================================================================

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useDisplay } from 'vuetify'

export function useDevMetrics() {
  // (A) Responsive hint via Vuetify (xs ~ mobile).
  const { xs } = useDisplay()
  const isMobile = computed(() => xs.value)

  // (B) SSR/Edge-safe state
  const screenWidth = ref(0)
  const hasTouch = ref(false)
  const deviceType = ref('Unknown')

    // (C) Device classification — lightweight heuristic (client-only).
  function updateDeviceType() {
    try {
      const ua = (navigator.userAgent || '').toLowerCase()
      const screenW = typeof screen !== 'undefined' ? screen.width : 0
      const touch = hasTouch.value

      if (/mobile|android|iphone|ipod/i.test(ua)) deviceType.value = 'Mobile'
      else if (/tablet|ipad|playbook|kindle/i.test(ua)) deviceType.value = 'Tablet'
      else if (touch && screenW <= 800) deviceType.value = 'Mobile (touch fallback)'
      else if (touch && screenW <= 1280) deviceType.value = 'Tablet (touch fallback)'
      else if (!touch) deviceType.value = 'Desktop'
      else deviceType.value = 'Unknown Touch Device'
    } catch {
      deviceType.value = 'Unknown'
    }
  }

  // (D) Debounced resize — updates width and reclassifies device.
  let resizeTimeout
  const onResize = () => {
    if (resizeTimeout) clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      if (typeof window !== 'undefined') {
        screenWidth.value = window.innerWidth
        updateDeviceType()
      }
    }, 100)
  }

  // (E) Backend ping — strict env. We require VITE_API_BASE (no fallback).
  const apiData = ref({})
  const loading = ref(true)
  const API_BASE = import.meta.env.VITE_API_BASE // required

  // (F) System/browser signals (populated on mount; SSR-safe defaults above).
  const systemPrefers = ref('unknown')   // 'Dark Mode' | 'Light Mode'
  const prefersReducedMotion = ref('No') // 'Yes' | 'No'
  const userAgent = ref('')
  const platform = ref('Unknown')        // via UA-CH when available
  const language = ref('')
  const timezone = ref('')
  const dnt = ref('Disabled')            // Do Not Track
  const isOnline = ref(true)
  const memory = ref('Unknown')          // navigator.deviceMemory (Chromium)
  const cpuCores = ref('Unknown')        // navigator.hardwareConcurrency

  // (G) Network Information API (Chromium/Android only). Gracefully optional.
  const connectionType = ref('Unknown')  // '4g' | '3g' | ...
  const saveData = ref('Unknown')        // 'Enabled' | 'Disabled'
  const downlink = ref('Unknown')        // Mbps
  // Hoisted refs so mount & unmount can access the same instances
  /** @type {any} */ let connRef = null
  /** @type {null | (() => void)} */ let applyConn = null

  // (H) FPS
  const fps = ref(0)
  let frameCount = 0
  let fpsStart = 0
  let rafId = 0
  function tick(now) {
    frameCount++
    const elapsed = now - fpsStart
    if (elapsed >= 1000) {
      fps.value = Math.round((frameCount * 1000) / elapsed)
      frameCount = 0
      fpsStart = now
    }
    rafId = requestAnimationFrame(tick)
  }

  // (I) JS heap (Chromium only). Firefox/Safari don’t expose performance.memory.
  const heapUsed = ref('Unknown') 
  const heapLimit = ref('Unknown')
  let memInterval = 0
  function sampleMemory() {
    const pm = /** @type {any} */ (performance).memory
    if (!pm) return
    heapUsed.value  = Math.round(pm.usedJSHeapSize / 1048576)
    heapLimit.value = Math.round(pm.jsHeapSizeLimit / 1048576)
  }

    // (J) User inactivity — seconds since last interaction. Good UX signal.
  const inactivitySeconds = ref(0)
  let inactivityTimer = 0
  function resetInactivity() { inactivitySeconds.value = 0 }
  const userEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']

  // (K) Visibility — pause/resume loops when tab visibility changes.
  function onVisibilityChange() {
    if (document.hidden) {
      if (rafId) cancelAnimationFrame(rafId)
      if (memInterval) clearInterval(memInterval)
    } else {
      fpsStart = performance.now()
      rafId = requestAnimationFrame(tick)
      if ('memory' in performance) {
        const ms = (prefersReducedMotion.value === 'Yes') ? 5000 : 2000
        memInterval = window.setInterval(sampleMemory, ms)
      }
    }
  }

  // (L) Online/offline.
  function updateOnline() { isOnline.value = navigator.onLine }

  // (M) Dark mode / reduced motion via media queries.
  /** @type {MediaQueryList | undefined} */ let darkMql
  /** @type {MediaQueryList | undefined} */ let motionMql
  function applyPrefers() {
    systemPrefers.value = darkMql?.matches ? 'Dark Mode' : 'Light Mode'
    prefersReducedMotion.value = motionMql?.matches ? 'Yes' : 'No'
  }

  // (N) Theme in localStorage
  const localStorageTheme = ref(null)
  function onStorageChange(event) {
    if (event.key === 'theme') {
      localStorageTheme.value = localStorage.getItem('theme')
    }
  }
  function setTheme(next) {
    if (next == null) {
      localStorage.removeItem('theme')
      localStorageTheme.value = null
    } else {
      localStorage.setItem('theme', String(next))
      localStorageTheme.value = String(next)
    }
  }

  // (O) Anonymous local identity
  const anonId = ref('')
  function getSafeUUID() {
    if (crypto?.randomUUID) return crypto.randomUUID()
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  // (P) All Web API reads happen here (client-only).
  onMounted(async () => {
    // 1) Basic device signals
    screenWidth.value = window.innerWidth
    hasTouch.value = ('ontouchstart' in window) || navigator.maxTouchPoints > 0
    updateDeviceType()

    // 2) Backend ping with timeout
    const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null
    const timeoutId = controller ? setTimeout(() => controller.abort(), 5000) : null
    try {
      const res = await fetch(`${API_BASE}/api/ping`, controller ? { signal: controller.signal } : undefined)
      apiData.value = await res.json()
    } catch (error) {
      apiData.value = {
        message: controller && error?.name === 'AbortError'
          ? '❌ Request timed out.'
          : '❌ Could not reach backend.'
      }
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
      loading.value = false
    }

    // 3) System/browser fields
    userAgent.value = navigator.userAgent
    language.value = navigator.language
    timezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone
    dnt.value = navigator.doNotTrack === '1' ? 'Enabled' : 'Disabled'
    memory.value = navigator.deviceMemory ?? 'Unknown'
    cpuCores.value = navigator.hardwareConcurrency ?? 'Unknown'

    // 4) Platform via UA-CH (Chromium). Fallback to deprecated platform if needed.
    try {
      const uaData = /** @type {any} */ (navigator).userAgentData
      if (uaData?.getHighEntropyValues) {
        const { platform: p } = await uaData.getHighEntropyValues(['platform'])
        platform.value = p || uaData.platform || 'Unknown'
      } else {
        // eslint-disable-next-line deprecation/deprecation
        platform.value = navigator.platform || 'Unknown'
      }
    } catch { /* ignore */ }

    // 5) Network Information API (Chromium/Android)
    connRef = /** @type {any} */ (navigator).connection
    if (connRef) {
      applyConn = () => {
        connectionType.value = connRef.effectiveType || 'Unknown'
        saveData.value = connRef.saveData ? 'Enabled' : 'Disabled'
        downlink.value = (typeof connRef.downlink === 'number') ? connRef.downlink : 'Unknown'
      }
      applyConn()
      connRef.addEventListener?.('change', applyConn)
    }

    // 6) Media queries: dark/motion.
    darkMql = window.matchMedia?.('(prefers-color-scheme: dark)')
    motionMql = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    applyPrefers()
    darkMql?.addEventListener?.('change', applyPrefers)
    motionMql?.addEventListener?.('change', applyPrefers)

    // 7) Global listeners
    window.addEventListener('resize', onResize)
    window.addEventListener('online', updateOnline)
    window.addEventListener('offline', updateOnline)
    document.addEventListener('visibilitychange', onVisibilityChange)
    userEvents.forEach(e => {
      const opts = (e === 'scroll' || e === 'touchstart') ? { passive: true } : false
      window.addEventListener(e, resetInactivity, opts)
    })
    window.addEventListener('storage', onStorageChange)

    // 8) Timers/loops
    inactivityTimer = window.setInterval(() => inactivitySeconds.value++, 1000)
    fpsStart = performance.now()
    rafId = requestAnimationFrame(tick)
    if ('memory' in performance) {
      sampleMemory()
      const ms = (prefersReducedMotion.value === 'Yes') ? 5000 : 2000
      memInterval = window.setInterval(sampleMemory, ms)
    }

    // 9) Anonymous ID + initial theme
    const key = 'anon-id'
    anonId.value = localStorage.getItem(key) || getSafeUUID()
    localStorage.setItem(key, anonId.value)
    localStorageTheme.value = localStorage.getItem('theme')
  })

  // (Q) Full cleanup. No leaks.
  onBeforeUnmount(() => {
    if (resizeTimeout) clearTimeout(resizeTimeout)
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('online', updateOnline)
      window.removeEventListener('offline', updateOnline)
      window.removeEventListener('storage', onStorageChange)
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
    if (connRef && applyConn) {
      connRef.removeEventListener?.('change', applyConn)
    }
    if (darkMql) darkMql.removeEventListener?.('change', applyPrefers)
    if (motionMql) motionMql.removeEventListener?.('change', applyPrefers)
    if (inactivityTimer) clearInterval(inactivityTimer)
    if (rafId) cancelAnimationFrame(rafId)
    if (memInterval) clearInterval(memInterval)
  })

  // (R) Public helpers.
  function clearLocalStorage() {
    localStorage.clear()
    localStorageTheme.value = null
    location.reload()
  }

  // (S) API returned
  return {
    // layout/device
    isMobile, screenWidth, hasTouch, deviceType,

    // backend
    apiData, loading,

    // system/browser
    systemPrefers, prefersReducedMotion, userAgent, platform,
    language, timezone, dnt, isOnline, memory, cpuCores,

    // network
    connectionType, saveData, downlink,

    // identity/theme
    anonId, localStorageTheme, setTheme, clearLocalStorage,

    // performance/UX
    fps, heapUsed, heapLimit, inactivitySeconds,
  }
}
