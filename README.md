# 🧬 vue3-jod

[![Vue 3](https://img.shields.io/badge/vue-3.x-green?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/vite-ready-purple?logo=vite)](https://vitejs.dev/)
[![Vuetify](https://img.shields.io/badge/ui-vuetify%203-blueviolet?logo=vuetify)](https://vuetifyjs.com/)
[![Backend](https://img.shields.io/badge/API-node--jod-blue?logo=node.js)](https://github.com/manokimbr/node-jod)

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

> Make sure your backend (`node-jod`) is running at the defined `VITE_API_BASE`.

---

## 🔌 API Integration

Configure `.env` or `.env.dev`:

```env
VITE_API_BASE=http://localhost:3001
```

Or use the deployed backend:

```env
VITE_API_BASE=https://node-jod.onrender.com
```

---

## 🧪 Example Output

When loaded, the app fetches from:

```
GET /api/ping
```

And displays something like:

```json
{
  "message": "pong from Node Jod 🧬",
  "version": "v22.16.0"
}
```

---

## 📁 Structure

```bash
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

---

## 🌐 Related Projects

- 🔌 [node-jod (backend)](https://github.com/manokimbr/node-jod) — Native Node.js 22 API server
- 🧬 [Live API](https://node-jod.onrender.com/api/ping) — `/api/ping` endpoint (JSON response)

---

## 👤 Author

Built with Vue 3 by [@manokimbr](https://github.com/manokimbr)

---

## 📄 License

MIT
