import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, logout as logoutApi, getUsers } from '../api'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)

  async function login(credentials) {
    const data = await loginApi(credentials)
    token.value = data.token
    localStorage.setItem('token', data.token)
    return data
  }

  async function logout() {
    await logoutApi()
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  function getToken() {
    return token.value
  }

  return { token, userInfo, login, logout, getToken }
})
