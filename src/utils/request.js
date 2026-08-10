import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'
import { useCacheStore } from '../stores/cache'
import { checkRateLimit, incrementRequestCount, isRateLimitExceeded } from './rateLimit'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000
})

const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000

const cacheableEndpoints = [
  '/banks',
  '/roles',
  '/policies',
  '/products',
  '/cases',
  '/users'
]

function shouldCache(url, method) {
  if (method !== 'get') return false
  const path = url.split('?')[0].replace(/\/$/, '')
  return cacheableEndpoints.some(endpoint => path === endpoint || path.startsWith(endpoint + '/'))
}

function getCacheKey(config) {
  const params = config.params ? new URLSearchParams(config.params).toString() : ''
  return `${config.method}:${config.url}${params ? '?' + params : ''}`
}

function getCached(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.time > CACHE_TTL) {
    cache.delete(key)
    return null
  }
  return entry.data
}

function setCache(key, data) {
  cache.set(key, { data, time: Date.now() })
}

export function clearCache() {
  cache.clear()
}

export function invalidateCache(url) {
  const path = url.split('?')[0].replace(/\/$/, '')
  for (const key of cache.keys()) {
    if (key.includes(path)) {
      cache.delete(key)
    }
  }
}

function getPreviewToken() {
  const params = new URLSearchParams(window.location.search)
  return params.get('eo_token') || params.get('token') || ''
}

request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    const previewToken = getPreviewToken()
    if (previewToken) {
      config.params = config.params || {}
      config.params.eo_token = previewToken
    }
    
    const { allowed, stats } = checkRateLimit()
    
    if (!allowed) {
      ElMessage.warning('本月/今日请求次数已达上限，正在使用缓存数据')
      
      if (shouldCache(config.url, config.method)) {
        const cached = getCached(getCacheKey(config))
        if (cached) {
          config.adapter = () =>
            Promise.resolve({
              data: cached,
              status: 200,
              statusText: 'OK (from cache)',
              headers: { 'X-Cache': 'true' },
              config
            })
          return config
        }
        
        const cacheStore = useCacheStore()
        const data = getDataFromStore(config.url)
        if (data) {
          config.adapter = () =>
            Promise.resolve({
              data,
              status: 200,
              statusText: 'OK (from store)',
              headers: { 'X-Cache-Store': 'true' },
              config
            })
          return config
        }
      }
      
      config.adapter = () =>
        Promise.resolve({
          data: { error: 'RATE_LIMITED', message: '请求次数已达上限，请下月再试' },
          status: 429,
          statusText: 'Too Many Requests',
          config
        })
      return config
    }
    
    incrementRequestCount()
    
    if (shouldCache(config.url, config.method)) {
      const cached = getCached(getCacheKey(config))
      if (cached) {
        config.adapter = () =>
          Promise.resolve({
            data: cached,
            status: 200,
            statusText: 'OK (from cache)',
            headers: { 'X-Cache': 'true' },
            config
          })
      }
    }
    return config
  },
  error => Promise.reject(error)
)

function getDataFromStore(url) {
  try {
    const cacheStore = useCacheStore()
    const path = url.split('?')[0].replace(/\/$/, '')
    
    if (path.includes('/banks/') && !path.split('/').pop().match(/^\d+$/)) {
      return cacheStore.banks
    }
    if (path.endsWith('/banks')) {
      return cacheStore.banks
    }
    if (path.endsWith('/roles')) {
      return cacheStore.roles
    }
    if (path.endsWith('/policies')) {
      return cacheStore.policies
    }
    if (path.endsWith('/products')) {
      return cacheStore.products
    }
    if (path.endsWith('/cases')) {
      return cacheStore.cases
    }
    if (path.endsWith('/users')) {
      return cacheStore.users
    }
    
    return null
  } catch (e) {
    return null
  }
}

request.interceptors.response.use(
  response => {
    if (response.headers['X-Cache'] === 'true' || response.headers['X-Cache-Store'] === 'true') {
      return response.data
    }
    
    if (response.status === 429) {
      ElMessage.warning('本月/今日请求次数已达上限')
      return response.data
    }
    
    if (shouldCache(response.config.url, response.config.method)) {
      setCache(getCacheKey(response.config), response.data)
      
      const cacheStore = useCacheStore()
      const path = response.config.url.split('?')[0].replace(/\/$/, '')
      
      if (path.endsWith('/banks')) {
        cacheStore.setBanks(response.data)
      } else if (path.endsWith('/roles')) {
        cacheStore.setRoles(response.data)
      } else if (path.endsWith('/policies')) {
        cacheStore.setPolicies(response.data)
      } else if (path.endsWith('/products')) {
        cacheStore.setProducts(response.data)
      } else if (path.endsWith('/cases')) {
        cacheStore.setCases(response.data)
      } else if (path.endsWith('/users')) {
        cacheStore.setUsers(response.data)
      }
    }
    
    if (['post', 'put', 'delete'].includes(response.config.method)) {
      const url = response.config.url
      invalidateCache(url)
      
      const path = url.split('?')[0].replace(/\/$/, '')
      const cacheStore = useCacheStore()
      
      if (path.endsWith('/banks') || path.includes('/banks/')) {
        cacheStore.setBanks([])
      } else if (path.endsWith('/roles')) {
        cacheStore.setRoles([])
      } else if (path.endsWith('/policies') || path.includes('/policies/')) {
        cacheStore.setPolicies([])
      } else if (path.endsWith('/products') || path.includes('/products/')) {
        cacheStore.setProducts([])
      } else if (path.endsWith('/cases') || path.includes('/cases/')) {
        cacheStore.setCases([])
      }
    }
    
    return response.data
  },
  error => {
    if (error.response?.status === 429) {
      ElMessage.warning('本月/今日请求次数已达上限，正在使用缓存数据')
      return { error: 'RATE_LIMITED', message: '请求次数已达上限' }
    }
    
    const msg = error.response?.data?.detail
    if (error.response?.status === 401 && msg !== 'Not found' && !error.response?.data?.code) {
      localStorage.removeItem('token')
      router.push('/login')
      ElMessage.error('登录已过期，请重新登录')
    } else if (error.response?.data?.detail) {
      ElMessage.error(error.response.data.detail)
    } else {
      ElMessage.error('请求失败')
    }
    return Promise.reject(error)
  }
)

export default request
