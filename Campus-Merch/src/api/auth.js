import { request } from './http'

export function authLogin(body) {
  return request('auth/login', { method: 'POST', data: body })
}

export function authRegister(body) {
  return request('auth/register', { method: 'POST', data: body })
}

export function authLogout() {
  return request('auth/logout', { method: 'POST' }).catch(() => ({ code: 0, message: 'ok', data: null }))
}
