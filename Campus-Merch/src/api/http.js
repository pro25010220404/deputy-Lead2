const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

const jsonHeaders = {
  'Content-Type': 'application/json',
}

export const shouldUseMock = () => USE_MOCK

export async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : jsonHeaders),
      ...(options.headers || {}),
    },
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload?.message || '请求失败')
  }
  return payload
}

export const ok = (data, message = 'ok') => ({ code: 0, message, data })
