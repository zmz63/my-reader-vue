import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App'
import router from './router'
import './main.scss'

console.log('env', import.meta.env)

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
