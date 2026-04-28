import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const defaultUsers = [{ username: 'admin', password: 'Admin@123456', role: 'admin' }]
  const token = ref(localStorage.getItem('campus_merch_token') || '')
  const profile = ref(
    JSON.parse(localStorage.getItem('campus_merch_profile') || 'null')
  )
  const storedUsers = JSON.parse(localStorage.getItem('campus_merch_users') || 'null')
  const users = ref(
    (Array.isArray(storedUsers) ? storedUsers : defaultUsers).map((user) => ({
      ...user,
      role: user.role === 'admin' ? 'admin' : 'student',
    }))
  )
  localStorage.setItem('campus_merch_users', JSON.stringify(users.value))

  const isAuthenticated = computed(() => Boolean(token.value))
  const isAdmin = computed(() => profile.value?.role === 'admin')

  const login = async ({ username, password }) => {
    // 约定：admin 账号走管理员校验；其余任意输入默认作为学生登录
    if (username !== 'admin') {
      if (!username || !password) {
        throw new Error('请填写用户名和密码')
      }
      const nextToken = `mock-token-${Date.now()}`
      token.value = nextToken
      profile.value = {
        name: '学生用户',
        role: 'student',
        username,
      }
      localStorage.setItem('campus_merch_token', nextToken)
      localStorage.setItem('campus_merch_profile', JSON.stringify(profile.value))
      return
    }

    const existing = users.value.find(
      (user) => user.username === username && user.password === password
    )
    if (!existing) {
      throw new Error('用户名或密码错误')
    }
    const nextToken = `mock-token-${Date.now()}`
    token.value = nextToken
    profile.value = {
      name: existing.role === 'admin' ? '校园文创管理员' : '学生用户',
      role: existing.role,
      username: existing.username,
    }
    localStorage.setItem('campus_merch_token', nextToken)
    localStorage.setItem('campus_merch_profile', JSON.stringify(profile.value))
  }

  const register = async ({ username, name, email, verificationCode, password }) => {
    if (!username || !name || !email || !verificationCode || !password) {
      throw new Error('请完整填写注册信息')
    }
    const duplicated = users.value.some((user) => user.username === username)
    if (duplicated) throw new Error('用户名已存在')

    users.value.push({
      username,
      name,
      email,
      password,
      role: 'student',
    })
    localStorage.setItem('campus_merch_users', JSON.stringify(users.value))
  }

  const logout = () => {
    token.value = ''
    profile.value = null
    localStorage.removeItem('campus_merch_token')
    localStorage.removeItem('campus_merch_profile')
  }

  return { token, profile, isAuthenticated, isAdmin, login, logout, register }
})
