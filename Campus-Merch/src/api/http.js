import axios from 'axios'
import { ok } from '../utils/apiEnvelope'

export { ok }
export const TOKEN_STORAGE_KEY = 'campus_merch_token'
export const PROFILE_STORAGE_KEY = 'campus_merch_profile'

const rawBase = import.meta.env.VITE_API_BASE_URL || '/api'
/** 末尾带 /，便于与相对 path 拼接（避免 `/api` + `/products` 变成站点根 `/products`） */
export const BASE_URL = `${rawBase.replace(/\/$/, '')}/`

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const shouldUseMock = () => USE_MOCK

function parseSuccessCodes() {
  const raw = import.meta.env.VITE_API_SUCCESS_CODES || '0,200'
  return raw.split(',').map((s) => Number(String(s).trim())).filter((n) => !Number.isNaN(n))
}

function isBizSuccess(code) {
  return parseSuccessCodes().includes(Number(code))
}

/**
 * 将后端 JSON 统一成与 mock 相同的 { code, message, data }。
 * - 已有 code + data：按成功码校验
 * - 无 code：整段 body 视为 data（兼容直接返回资源的接口）
 */
export function normalizeEnvelope(body) {
  if (body === null || body === undefined) {
    throw new Error('空响应')
  }
  if (typeof body !== 'object' || body instanceof ArrayBuffer) {
    return { code: 0, message: 'ok', data: body }
  }
  if ('code' in body) {
    if (!isBizSuccess(body.code)) {
      const msg = body.message || body.msg || body.error || '请求失败'
      throw new Error(typeof msg === 'string' ? msg : '请求失败')
    }
    if ('data' in body) {
      return { code: body.code, message: body.message || 'ok', data: body.data }
    }
    const { code, message, msg, ...rest } = body
    return { code, message: message || msg || 'ok', data: rest }
  }
  return { code: 0, message: 'ok', data: body }
}

export const http = axios.create({
  baseURL: BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT || 30000),
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const d = error.response?.data
    let msg =
      (typeof d?.message === 'string' && d.message) ||
      (typeof d?.msg === 'string' && d.msg) ||
      (typeof d?.error === 'string' && d.error) ||
      error.message ||
      '网络错误'
    if (error.response?.status === 401) {
      msg = d?.message || '未登录或登录已过期'
    }
    return Promise.reject(new Error(msg))
  }
)

function normalizePath(path) {
  const p = String(path || '').replace(/^\//, '')
  return p || ''
}

/**
 * 通用 JSON 请求，返回 { code, message, data }（与 mock 的 ok() 一致）
 * @param {string} path 如 products、orders/1
 * @param {object} options axios 配置；可用 method、data、body（同 data）、headers、params、responseType 等
 */
export async function request(path, options = {}) {
  const { method = 'GET', data, body, headers, ...rest } = options
  const payload = data !== undefined ? data : body
  const isForm = payload instanceof FormData
  const url = normalizePath(path)
  const res = await http.request({
    url,
    method,
    headers: isForm
      ? { ...(headers || {}) }
      : { 'Content-Type': 'application/json', ...(headers || {}) },
    data: isForm ? payload : payload,
    ...rest,
  })
  return normalizeEnvelope(res.data)
}

export default http
