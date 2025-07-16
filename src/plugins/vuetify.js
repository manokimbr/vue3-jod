import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import {
  VApp,
  VMain,
  VContainer,
  VCard,
  VCardTitle,
  VCardText,
  // VAlert,
} from 'vuetify/components'

export const vuetify = createVuetify({
  components: {
    VApp,
    VMain,
    VContainer,
    VCard,
    VCardTitle,
    VCardText,
    // VAlert,
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: 'dark',
  },
})
