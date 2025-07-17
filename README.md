# 🧬 vue3-jod

[![Vue 3](https://img.shields.io/badge/vue-3.x-green?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/vite-ready-purple?logo=vite)](https://vitejs.dev/)
[![Vuetify](https://img.shields.io/badge/ui-vuetify%203-blueviolet?logo=vuetify)](https://vuetifyjs.com/)
[![Backend](https://img.shields.io/badge/API-node--jod-blue?logo=node.js)](https://github.com/manokimbr/node-jod)
[![Self-aware](https://img.shields.io/badge/self--awareness-brain🧠-lightblue)](./jod/Brain.md)

> A sleek Vue 3 frontend powered by Vite + Vuetify to interact with the blazing-fast native Node.js 22 backend [node-jod](https://github.com/manokimbr/node-jod)

---

## ⚙️ Features

- ⚡ Vue 3 + Vite
- 🎨 Vuetify 3 styling
- 🔗 Fetches `/api/ping` from the backend
- 🌐 Uses `.env` to configure backend URL
- 🧬 Custom favicon included
- 🛡️ CORS ready on the backend

---

## 🚀 Getting Started

```bash
git clone https://github.com/manokimbr/vue3-jod.git
cd vue3-jod
npm install
npm run dev
````

> Make sure your backend ([node-jod](https://github.com/manokimbr/node-jod)) is running at the defined `VITE_API_BASE`.

---

## 🔌 API Integration

Set your environment variables in `.env` or `.env.dev`:

```env
VITE_API_BASE=http://localhost:3001
```

Or use the deployed backend while it's open:

```env
VITE_API_BASE=https://node-jod.onrender.com
```

---

## 🧪 Example Output

The app fetches:

```http
GET /api/ping
```

Response:

```json
{
  "message": "pong from Node Jod 🧬",
  "version": "v22.16.0"
}
```

---

## 📁 Project Structure

```txt
.
├── public/
│   └── favicon.ico
├── src/
│   ├── App.vue
│   ├── main.js
│   └── plugins/
│       └── vuetify.js
├── .env / .env.dev
└── vite.config.js
```

---

## 🧠 Self-awareness

vue3-jod includes a lightweight brain that understands itself.

```bash
npm run brain
```

Generates:

* `structure.json` → folder & file tree
* `frontendMemory.json` → components, plugins, env, Vuetify stats
* `structure.txt` → ASCII-readable folder map

Perfect for devs, docs, and AI agents. 🤖

---

## 🌐 Related Projects

* 🔌 [node-jod (backend)](https://github.com/manokimbr/node-jod) — Native Node.js 22 API server
* 🧬 [Live API](https://node-jod.onrender.com/api/ping) — `/api/ping` endpoint (JSON response)

---

## 👤 Author

Made by [@manokimbr](https://github.com/manokimbr)

[![GitHub followers](https://img.shields.io/github/followers/manokimbr?label=Follow\&style=social)](https://github.com/manokimbr)
[![Twitter](https://img.shields.io/badge/X-@manokimbr-black?logo=x)](https://twitter.com/manokimbr)

---

## 📄 License

This project is open-source under the [MIT License](./.LICENSE)
