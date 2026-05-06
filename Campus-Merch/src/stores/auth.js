import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { authLogin, authLogout, authRegister } from '../api/modules/auth'
import { PROFILE_STORAGE_KEY, shouldUseMock, TOKEN_STORAGE_KEY } from '../api/http'

export const useAuthStore = defineStore('auth', () => {
  const defaultUsers = [{ username: 'admin', password: 'Admin@123456', role: 'admin' }]
  const token = ref(localStorage.getItem(TOKEN_STORAGE_KEY) || '')
  const profile = ref(JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || 'null'))
  const storedUsers = JSON.parse(localStorage.getItem('campus_merch_users') || 'null')
  const users = ref(
    (Array.isArray(storedUsers) ? storedUsers : defaultUsers).map((user) => ({
      ...user,
      role: user.role === 'admin' ? 'admin' : 'student',
    }))
  )
  if (shouldUseMock()) {
    localStorage.setItem('campus_merch_users', JSON.stringify(users.value))
  }

  const isAuthenticated = computed(() => Boolean(token.value))
  const isAdmin = computed(() => profile.value?.role === 'admin')

  const persistSession = (nextToken, nextProfile) => {
    token.value = nextToken
    profile.value = nextProfile
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken)
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfile))
  }

  /** 解析真实登录接口返回的 data */
  const applyRemoteLogin = (envelope) => {
    const raw = envelope?.data ?? envelope
    const nextToken =
      raw?.token || raw?.accessToken || raw?.access_token || raw?.jwt || ''
    const user = raw?.user || raw?.profile || raw
    const nextProfile = {
      username: user?.username ?? user?.account ?? '',
      name: user?.name ?? user?.nickname ?? user?.username ?? '用户',
      role: user?.role === 'admin' || user?.role === 'ADMIN' ? 'admin' : 'student',
      email: user?.email ?? '',
    }
    if (!nextToken) throw new Error('登录响应缺少 token')
    persistSession(nextToken, nextProfile)
  }

  const login = async ({ username, password, verificationCode, loginType = 'password' }) => {
    if (!username) throw new Error('请填写账号')
    if (loginType === 'password' && !password) throw new Error('请填写密码')
    if (loginType === 'code' && !verificationCode) throw new Error('请填写验证码')

    if (!shouldUseMock()) {
      const envelope = await authLogin({
        username,
        password,
        verificationCode,
        loginType,
      })
      applyRemoteLogin(envelope)
      return
    }

    const existingByName = users.value.find((user) => user.username === username)
    if (!existingByName && loginType === 'password' && username !== 'admin') {
      persistSession(`mock-token-${Date.now()}`, {
        name: '学生用户',
        role: 'student',
        username,
      })
      return
    }

    if (!existingByName) throw new Error('账号不存在')
    if (loginType === 'password' && existingByName.password !== password) {
      throw new Error('用户名或密码错误')
    }

    persistSession(`mock-token-${Date.now()}`, {
      name: existingByName.role === 'admin' ? '校园文创管理员' : existingByName.name || '学生用户',
      role: existingByName.role,
      username: existingByName.username,
      email: existingByName.email || '',
    })
  }

  const register = async ({ username, name, email, verificationCode, password }) => {
    if (!username || !name || !email || !verificationCode || !password) {
      throw new Error('请完整填写注册信息')
    }

    if (!shouldUseMock()) {
      await authRegister({ username, name, email, verificationCode, password })
      return
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

  const logout = async () => {
    if (!shouldUseMock()) {
      try {
        await authLogout()
      } catch {
        /* 已在 http 层提示 */
      }
    }
    token.value = ''
    profile.value = null
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(PROFILE_STORAGE_KEY)
  }

  return { token, profile, isAuthenticated, isAdmin, login, logout, register }
})
