import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import './styles/main.scss'
import { startVersionCheck, stopVersionCheck } from './utils/cacheUpdate'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(ElementPlus)

router.afterEach((to, from) => {
  if (to.path === '/login') {
    stopVersionCheck()
  } else {
    const token = localStorage.getItem('token')
    if (token) {
      startVersionCheck()
    }
  }
})

window.addEventListener('cache-refresh-needed', () => {
  const cacheStore = useCacheStore()
  cacheStore.clearAll()
  window.location.reload()
})

import { useCacheStore } from './stores/cache'

app.mount('#app')
