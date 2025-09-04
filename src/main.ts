import { createApp } from 'vue'
import App from './App.vue'
import { NConfigProvider } from 'naive-ui'

const app = createApp(App)
app.use(NConfigProvider)
app.mount('#app')
app.use(router)

app.mount('#app')
