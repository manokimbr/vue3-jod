<template>
    <div class="app">
      <h1>🧬 Vue3-JOD Interface</h1>
      <p>Frontend is live and connected to Node-JOD backend.</p>
  
      <div v-if="pingData" class="result">
        <h2>🔗 API Response:</h2>
        <pre>{{ pingData }}</pre>
      </div>
  
      <div v-else-if="error">
        <p class="error">⚠️ Error: {{ error }}</p>
      </div>
  
      <div v-else>
        <p>Loading backend ping...</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  
  const pingData = ref(null)
  const error = ref(null)
  const apiBase = import.meta.env.VITE_API_BASE
  
  onMounted(async () => {
    try {
      const res = await fetch(`${apiBase}/api/ping`)
      if (!res.ok) throw new Error('API error')
      pingData.value = await res.json()
    } catch (err) {
      error.value = err.message
    }
  })
  </script>
  
  <style>
  body {
    font-family: 'Inter', sans-serif;
    margin: 0;
    padding: 2rem;
    background: #111;
    color: #eee;
  }
  h1 {
    color: #5ef1a1;
  }
  .result {
    margin-top: 2rem;
    background: #1a1a1a;
    padding: 1rem;
    border-radius: 8px;
  }
  pre {
    background: #222;
    padding: 1rem;
    overflow: auto;
  }
  .error {
    color: #ff6565;
    font-weight: bold;
  }
  </style>
  