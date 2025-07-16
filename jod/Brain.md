# 🧠 frontendAwarenessBrain.js

This script is part of the self-awareness system for the `vue3-jod` project.  
Its goal is to give the frontend **cognitive awareness** of its own structure, dependencies, and active components.

---

## 🧩 What it does

When you run:

```bash
npm run brain
````

This script will:

1. **Scan all `.vue` and `.js` files** inside the `src/` folder.
2. **Extract:**

   * Tags used in Vue templates
   * Common script APIs (`ref`, `onMounted`, etc.)
   * Vuetify components used
   * Vuetify components actually registered
   * `.env` and `.env.dev` variables
3. **Detect inconsistencies** like:

   * Vuetify components used in templates but not registered
4. **Save results to:**

   * `jod/memory/frontendMemory.json` (full awareness snapshot)
   * `jod/memory/structure.json` (raw data)
   * `jod/memory/structure.txt` (human-readable folder map)

---

## 🎨 Why manual Vuetify component registration?

We are **manually registering only the Vuetify components we actually use** in `src/plugins/vuetify.js`:

```js
import {
  VApp,
  VMain,
  VContainer,
  VCard,
  VCardTitle,
  VCardText,
  VAlert, // ← Only if really used!
} from 'vuetify/components'

export const vuetify = createVuetify({
  components: {
    VApp,
    VMain,
    VContainer,
    VCard,
    VCardTitle,
    VCardText,
    VAlert,
  },
  ...
})
```

### ⚡ Benefits of this approach:

* **Performance boost**: Only used components are bundled
* **Smaller bundle size**: Speeds up load time
* **Self-validating**: We verify this setup with the brain script

---

## ✅ Status messages

The brain prints messages like:

```
🎨 Vuetify Registered: 6
⚠️  Missing Vuetify Components: VAlert
```

Or, if everything is clean:

```
✅ All Vuetify components used in templates are registered.
```

---

## 📁 Output files

* `frontendMemory.json` – Full metadata (tags, APIs, plugins, Vuetify, env)
* `structure.json` – Hierarchical object of folders and files
* `structure.txt` – Pretty, visual map (like `tree`) for humans

---

## 🧠 Philosophy

The `vue3-jod` project aims to become **autoconscious**.

This script is an early step toward that — allowing external agents (humans or AIs) to:

* Understand how the frontend is built
* Modify or extend it safely
* Prevent regressions or bloat

---

> Contribute responsibly.
> Teach the code about itself.
> Build systems that can evolve.

—
🧬 *vue3-jod team*
