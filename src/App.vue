<template>
  <v-app>
    <v-main>
      <v-container class="fill-height d-flex flex-column align-center justify-center">
        <v-card class="pa-6" elevation="12" max-width="500">
          <v-card-title class="text-h5 text-center">
            🧬 Vue3-JOD Interface
          </v-card-title>
          <v-card-text>
            <v-alert type="error" title="⚠️ Test Alert">
              This is an unregistered Vuetify component!
            </v-alert>
            <div v-if="loading">Loading backend status...</div>
            <div v-else>
              <p><strong>Message:</strong> {{ apiData.message }}</p>
              <p><strong>Version:</strong> {{ apiData.version }}</p>
              <p><strong>Env:</strong> {{ apiData.env }}</p>
              <p><strong>Port:</strong> {{ apiData.port }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const apiData = ref({})
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/ping`)
    apiData.value = await response.json()
  } catch (err) {
    apiData.value = { message: 'Failed to reach backend 💥' }
  } finally {
    loading.value = false
  }
})
</script>
