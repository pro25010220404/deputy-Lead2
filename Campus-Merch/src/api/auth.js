import { request } from './http'

export function authLogin({ email, password }) {
  return request('login', { method: 'POST', data: { email, password } })
}

export function authRegister({ name, email, password, verificationCode }) {
  return request('register', {
    method: 'POST',
    data: { name, email, password, verify_code: verificationCode },
  })
}

export function authSendVerifyCode(email, scene = 'register') {
  return request('send-verify-code', {
    method: 'POST',
    data: { email, scene },
  })
}

export function authLogout() {
  return request('logout', { method: 'POST' }).catch(() => ({ code: 0, message: 'ok', data: null }))
}
