import { request } from '../http'

/** Laravel：POST /api/login，body: { email, password } */
export function authLogin({ email, password }) {
  return request('login', { method: 'POST', data: { email, password } })
}

/** Laravel：POST /api/register，body: { name, email, password, verify_code } */
export function authRegister({ name, email, password, verificationCode }) {
  return request('register', {
    method: 'POST',
    data: {
      name,
      email,
      password,
      verify_code: verificationCode,
    },
  })
}

/** Laravel：POST /api/send-verify-code */
export function authSendVerifyCode(email, scene = 'register') {
  return request('send-verify-code', {
    method: 'POST',
    data: { email, scene },
  })
}

export function authLogout() {
  return request('logout', { method: 'POST' }).catch(() => ({ code: 0, message: 'ok', data: null }))
}
