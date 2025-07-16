import fs from 'node:fs'
import path from 'node:path'

const SRC_DIR = path.resolve('./src')
const PLUGIN_DIR = path.join(SRC_DIR, 'plugins')
const VUETIFY_PLUGIN = path.join(PLUGIN_DIR, 'vuetify.js')
const MEMORY_DIR = path.resolve('./jod/memory')
const MEMORY_FILE = path.join(MEMORY_DIR, 'frontendMemory.json')
const STRUCTURE_FILE = path.join(MEMORY_DIR, 'structure.json')

if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR, { recursive: true })

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

function scanJSFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const exports = Array.from(content.matchAll(/export function (\w+)/g)).map(m => m[1])
  return {
    file: path.relative('.', filePath),
    exports,
    description: 'JS utility or plugin'
  }
}

function scanDirRecursively(dir, results = [], tree = [], base = 'src') {
  const entries = fs.readdirSync(dir)
  for (const entry of entries) {
    const fullPath = path.join(dir, entry)
    const relPath = path.relative('.', fullPath)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      const children = []
      tree.push({ folder: path.relative(base, fullPath), children })
      scanDirRecursively(fullPath, results, children, base)
    } else if (entry.endsWith('.vue')) {
      results.push(scanVueFile(fullPath))
      tree.push({ file: path.relative(base, fullPath) })
    } else if (entry.endsWith('.js')) {
      results.push(scanJSFile(fullPath))
      tree.push({ file: path.relative(base, fullPath) })
    }
  }
  return { results, tree }
}

function renderTreeView(tree, indent = '📁 src/', depth = 0) {
  const lines = [indent]
  const prefix = (d) => '│   '.repeat(d)
  tree.forEach((entry, index) => {
    const isLast = index === tree.length - 1
    if (entry.folder) {
      const folderName = entry.folder.split(path.sep).pop()
      lines.push(`${prefix(depth)}${isLast ? '└──' : '├──'} ${folderName}`)
      lines.push(...renderTreeView(entry.children || [], '', depth + 1))
    } else {
      const fileName = entry.file.split(path.sep).pop()
      lines.push(`${prefix(depth)}${isLast ? '└──' : '├──'} ${fileName}`)
    }
  })
  return lines
}

function getEnvVars() {
  const envPaths = ['.env', '.env.dev']
  const envVars = new Set()
  envPaths.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8')
      const matches = content.matchAll(/^([A-Z_]+)=/gm)
      for (const match of matches) envVars.add(match[1])
    }
  })
  return Array.from(envVars)
}

function getRegisteredVuetifyComponents() {
  if (!fs.existsSync(VUETIFY_PLUGIN)) return []
  const rawContent = fs.readFileSync(VUETIFY_PLUGIN, 'utf-8')
  const content = rawContent
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//gm, '')
  const match = content.match(/components\s*:\s*{([^}]+)}/s)
  if (!match) return []
  const body = match[1]
  const matches = Array.from(body.matchAll(/\b(V\w+)/g)).map(m => m[1])
  return [...new Set(matches)].sort()
}

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
  return [...usedTags].filter(tag => !registered.includes(tag)).sort()
}

function buildMemory() {
  const { results: components, tree } = scanDirRecursively(SRC_DIR)
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
    ...(missingVuetify.length
      ? {
          vuetifyMissing: missingVuetify,
          vuetifyStatus: '⚠️ Some Vuetify components are used but not registered.'
        }
      : {
          vuetifyStatus: '✅ All Vuetify components used in templates are registered.'
        })
  }

  const structure = {
    hierarchy: tree,
    treeView: renderTreeView(tree).join('\n')
  }

  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2))
  fs.writeFileSync(STRUCTURE_FILE, JSON.stringify(structure, null, 2))

  // 🔔 LOG OUTPUT
  console.log('\n🧠 Frontend Awareness Brain Activated')
  console.log(`📄 Components Scanned: ${components.length}`)
  console.log(`🔧 Plugins: ${plugins.length}`)
  console.log(`🌱 ENV Vars: ${envVars.length}`)
  console.log(`🎨 Vuetify Registered: ${vuetifyRegistered.length}`)
  console.log(missingVuetify.length
    ? `⚠️  Missing Vuetify Components: ${missingVuetify.join(', ')}`
    : `✅ Vuetify Usage OK`)

  console.log(`\n💾 Memory saved to: ${MEMORY_FILE}`)
  console.log(`📁 Structure saved to: ${STRUCTURE_FILE}`)
  console.log('\n' + structure.treeView)
}

buildMemory()
