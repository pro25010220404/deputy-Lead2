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

  const login = async ({ username, password, verificationCode, loginType = 'password' }) => {
    if (!username) throw new Error('请填写账号')
    if (loginType === 'password' && !password) throw new Error('请填写密码')
    if (loginType === 'code' && !verificationCode) throw new Error('请填写验证码')

    const existingByName = users.value.find((user) => user.username === username)
    // 保留原有 mock 兼容：非 admin 账号即使未注册也允许密码登录
    if (!existingByName && loginType === 'password' && username !== 'admin') {
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

    if (!existingByName) throw new Error('账号不存在')
    if (loginType === 'password' && existingByName.password !== password) {
      throw new Error('用户名或密码错误')
    }

    const nextToken = `mock-token-${Date.now()}`
    token.value = nextToken
    profile.value = {
      name: existingByName.role === 'admin' ? '校园文创管理员' : existingByName.name || '学生用户',
      role: existingByName.role,
      username: existingByName.username,
      email: existingByName.email || '',
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
