import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { createNotificationChannel } from './composables/useNotifications'
import './assets/main.css'

// Crea il canale notifiche Android all'avvio
createNotificationChannel()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
