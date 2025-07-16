// jod/frontendAwarenessBrain.js
import fs from 'node:fs'
import path from 'node:path'

const SRC_DIR = path.resolve('./src')
const PLUGIN_DIR = path.join(SRC_DIR, 'plugins')
const VUETIFY_PLUGIN = path.join(PLUGIN_DIR, 'vuetify.js')
const MEMORY_DIR = path.resolve('./jod/memory')
const MEMORY_FILE = path.join(MEMORY_DIR, 'frontendMemory.json')

// Extracts template and script info from a .vue file
function scanVueFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const templateTags = Array.from(content.matchAll(/<([\w-]+)[\s>]/g)).map(m => m[1])
  const scriptFunctions = Array.from(
    content.matchAll(/\b(ref|reactive|onMounted|computed|fetch|watch|defineComponent|defineProps|defineExpose|defineEmits)\b/g)
  ).map(m => m[1])

  return {
    file: path.relative('.', filePath),
    templateTags: [...new Set(templateTags)],
    scriptAPIs: [...new Set(scriptFunctions)],
    description: 'Vue component'
  }
}

// Extracts exported functions from a .js file
function scanJSFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const exports = Array.from(content.matchAll(/export function (\w+)/g)).map(m => m[1])

  return {
    file: path.relative('.', filePath),
    exports,
    description: 'JS utility or plugin'
  }
}

// Recursively scans all .vue and .js files
function scanDirRecursively(dir, results = []) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const fullPath = path.join(dir, file)
    if (fs.statSync(fullPath).isDirectory()) {
      scanDirRecursively(fullPath, results)
    } else if (file.endsWith('.vue')) {
      results.push(scanVueFile(fullPath))
    } else if (file.endsWith('.js')) {
      results.push(scanJSFile(fullPath))
    }
  }
  return results
}

// Reads env vars from .env and .env.dev
function getEnvVars() {
  const envPaths = ['.env', '.env.dev']
  const envVars = new Set()

  envPaths.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8')
      const matches = content.matchAll(/^([A-Z_]+)=/gm)
      for (const match of matches) {
        envVars.add(match[1])
      }
    }
  })

  return Array.from(envVars)
}

// Reads the registered Vuetify components from vuetify.js
function getRegisteredVuetifyComponents() {
  if (!fs.existsSync(VUETIFY_PLUGIN)) return []

  const content = fs.readFileSync(VUETIFY_PLUGIN, 'utf-8')
  const matches = Array.from(content.matchAll(/\b(V\w+)\b/g)).map(m => m[1])
  const unique = [...new Set(matches)].filter(name => name.startsWith('V'))
  return unique.sort()
}

// 🚨 Detects used but unregistered Vuetify components
function detectUnregisteredVuetifyTags(components, registered) {
    const usedTags = new Set()
  
    for (const comp of components) {
      if (comp.templateTags) {
        for (const tag of comp.templateTags) {
          if (tag.startsWith('v-')) {
            const pascal = 'V' + tag
              .slice(2)
              .replace(/(?:^|-)(\w)/g, (_, c) => c.toUpperCase())
            usedTags.add(pascal)
          }
        }
      }
    }
  
    const missing = [...usedTags].filter(tag => !registered.includes(tag)).sort()
    return missing
  }
  

// Builds and saves the frontend memory
function buildMemory() {
  const components = scanDirRecursively(SRC_DIR)
  const plugins = fs.existsSync(PLUGIN_DIR)
    ? fs.readdirSync(PLUGIN_DIR).filter(f => f.endsWith('.js'))
    : []

  const vuetifyRegistered = getRegisteredVuetifyComponents()
  const envVars = getEnvVars()
  const missingVuetify = detectUnregisteredVuetifyTags(components, vuetifyRegistered)

  const memory = {
    scannedAt: new Date().toISOString(),
    components,
    plugins,
    envVars,
    vuetifyRegistered,
    vuetifyMissing: missingVuetify
  }

  // Console summary
  console.log('🧠 Frontend Awareness Memory Map:\n')
  console.dir(memory, { depth: null, colors: true })

  if (missingVuetify.length > 0) {
    console.warn(`\n⚠️ Missing Vuetify registrations: ${missingVuetify.join(', ')}`)
  }

  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true })
  }

  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2))
  console.log(`\n💾 Memory saved to ${MEMORY_FILE}`)
}

buildMemory()
