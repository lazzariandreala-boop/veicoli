import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { createNotificationChannel } from './composables/useNotifications'
import './assets/main.css'

// Canale notifiche Android (no-op su web)
createNotificationChannel()

// Registra Service Worker per PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js', { scope: './' })
      .then(reg => console.log('[SW] registrato:', reg.scope))
      .catch(err => console.warn('[SW] registrazione fallita:', err))
  })
}

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
