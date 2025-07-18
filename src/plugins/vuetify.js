import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { themes } from '../themes'
import {
  VApp,
  VMain,
  VContainer,
  VCard,
  VCardTitle,
  VCardText,
  VAlert,
  VAppBar,
  VBtn,
  VIcon,
  VSpacer,
  VToolbarTitle,
  VDivider
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
    VAppBar,
    VBtn,
    VIcon,
    VSpacer,
    VToolbarTitle,
    VDivider
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: 'dark',
    themes
  },
})
