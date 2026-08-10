const STORAGE_KEY = 'credit_platform_stats'
const MONTHLY_LIMIT = 30000
const DAILY_LIMIT = 1000

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function getCurrentDay() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function getRateLimitStats() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  const currentMonth = getCurrentMonth()
  const currentDay = getCurrentDay()
  
  if (data.month !== currentMonth) {
    data.month = currentMonth
    data.monthlyCount = 0
  }
  if (data.day !== currentDay) {
    data.day = currentDay
    data.dailyCount = 0
  }
  
  return {
    monthly: {
      count: data.monthlyCount || 0,
      limit: MONTHLY_LIMIT,
      remaining: MONTHLY_LIMIT - (data.monthlyCount || 0),
      exceeded: (data.monthlyCount || 0) >= MONTHLY_LIMIT
    },
    daily: {
      count: data.dailyCount || 0,
      limit: DAILY_LIMIT,
      remaining: DAILY_LIMIT - (data.dailyCount || 0),
      exceeded: (data.dailyCount || 0) >= DAILY_LIMIT
    }
  }
}

export function checkRateLimit() {
  const stats = getRateLimitStats()
  return {
    allowed: !stats.monthly.exceeded && !stats.daily.exceeded,
    stats
  }
}

export function incrementRequestCount() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  const currentMonth = getCurrentMonth()
  const currentDay = getCurrentDay()
  
  if (data.month !== currentMonth) {
    data.month = currentMonth
    data.monthlyCount = 0
  }
  if (data.day !== currentDay) {
    data.day = currentDay
    data.dailyCount = 0
  }
  
  data.monthlyCount = (data.monthlyCount || 0) + 1
  data.dailyCount = (data.dailyCount || 0) + 1
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  return getRateLimitStats()
}

export function isRateLimitExceeded() {
  const { stats } = checkRateLimit()
  return stats.monthly.exceeded || stats.daily.exceeded
}

export function resetRateLimit() {
  localStorage.removeItem(STORAGE_KEY)
}
