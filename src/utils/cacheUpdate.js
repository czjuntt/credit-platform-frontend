const VERSION_ENDPOINT = '/api/version'
const POLL_INTERVAL = 5 * 60 * 1000

let versionCheckTimer = null
let isChecking = false

export function startVersionCheck() {
  if (versionCheckTimer) return
  
  checkVersion()
  
  versionCheckTimer = setInterval(checkVersion, POLL_INTERVAL)
}

export function stopVersionCheck() {
  if (versionCheckTimer) {
    clearInterval(versionCheckTimer)
    versionCheckTimer = null
  }
}

async function checkVersion() {
  if (isChecking) return
  isChecking = true
  
  try {
    const response = await fetch(VERSION_ENDPOINT, {
      headers: { 'Cache-Control': 'no-cache' }
    })
    
    if (!response.ok) throw new Error('Network response was not ok')
    
    const data = await response.json()
    const { version } = data
    
    const lastVersion = localStorage.getItem('cache_version')
    if (version !== lastVersion) {
      localStorage.setItem('cache_version', version)
      window.dispatchEvent(new CustomEvent('cache-refresh-needed', {
        detail: { version }
      }))
    }
  } catch (e) {
    // ignore network errors, will retry next interval
  } finally {
    isChecking = false
  }
}

export function getLastVersion() {
  return localStorage.getItem('cache_version')
}

export function setLastVersion(version) {
  localStorage.setItem('cache_version', version)
}

export { POLL_INTERVAL }
