import { ok } from '../../utils/apiEnvelope'
import { http, request } from '../http'
import { toQueryString } from '../../utils/toQueryString'

/** 列表查询：页面用 status=online，Laravel 常见为数值上架态 */
function normalizeProductsQuery(params = {}) {
  const p = { ...params }
  if (p.status === 'online') p.status = 0
  if (p.status === 'offline') p.status = 1
  return p
}

/**
 * 封面 URL：补全前导 /；绝对地址原样返回。
 * 开发环境下对 /images、/storage 拼上静态站点源，让浏览器直连后端/NAT，
 * 避免走 localhost:5174 代理时出现 502；生产未配 VITE_IMG_ORIGIN 时仍用相对路径。
 */
function normalizeCoverUrl(raw) {
  if (raw == null || raw === '') return ''
  const s = String(raw).trim()
  if (!s) return ''
  if (/^https?:\/\//i.test(s)) return s
  const path = s.startsWith('/') ? s : `/${s}`
  const isProd = import.meta.env.PROD
  const explicit = String(import.meta.env.VITE_IMG_ORIGIN || '').replace(/\/$/, '')
  const devProxyBase = !isProd
    ? String(import.meta.env.VITE_API_PROXY_TARGET || '').replace(/\/$/, '')
    : ''
  const origin = explicit || devProxyBase
  if (origin && /^\/(images|storage)\b/i.test(path)) {
    return `${origin}${path}`
  }
  return path
}

/** Laravel 返回的 spec 可能是 JSON 对象，详情里要当字符串展示 */
function formatProductSpec(spec) {
  if (spec == null || spec === '') return ''
  if (typeof spec === 'string') return spec
  if (typeof spec !== 'object') return String(spec)
  const bits = []
  if (spec.size != null) {
    const s = Array.isArray(spec.size) ? spec.size.join(' / ') : String(spec.size)
    if (s) bits.push(`尺寸：${s}`)
  }
  if (spec.color != null) {
    const c = Array.isArray(spec.color) ? spec.color.join(' / ') : String(spec.color)
    if (c) bits.push(`颜色：${c}`)
  }
  return bits.length ? bits.join('；') : JSON.stringify(spec)
}

/** 将 Laravel snake_case 与 mock 的 camelCase 统一成页面使用的字段 */
function mapLaravelProductRow(row) {
  if (!row || typeof row !== 'object') return row
  const coverRaw = row.cover_url ?? row.coverUrl ?? ''
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    type: row.type,
    spec: formatProductSpec(row.spec),
    price: row.price,
    stock: Number(row.stock ?? 0),
    reservedQty: Number(row.reserved_qty ?? row.reservedQty ?? 0),
    soldQty: Number(row.sold_count ?? row.soldQty ?? 0),
    customRule: row.custom_rule ?? row.customRule ?? '',
    coverUrl: normalizeCoverUrl(coverRaw),
    status: row.status,
    createdAt: row.created_at ?? row.createdAt,
    updatedAt: row.updated_at ?? row.updatedAt,
  }
}

function mapProductsListPayload(data) {
  if (!data || typeof data !== 'object' || !Array.isArray(data.list)) return data
  return {
    ...data,
    list: data.list.map(mapLaravelProductRow),
  }
}

export async function fetchProducts(params = {}) {
  const res = await request(`products${toQueryString(normalizeProductsQuery(params))}`)
  return { ...res, data: mapProductsListPayload(res.data) }
}

export async function fetchProductDetail(id) {
  const res = await request(`products/${id}`)
  const d = res.data
  if (d && typeof d === 'object' && !Array.isArray(d) && 'id' in d) {
    return { ...res, data: mapLaravelProductRow(d) }
  }
  return res
}

export function putProduct(productId, payload) {
  return request(`products/${productId}`, { method: 'PUT', data: payload })
}

export function postProductsImport(formData) {
  return request('products/import', { method: 'POST', data: formData, headers: {} })
}

/** 返回与业务 mock 相同的 { code, message, data: { blob, filename } } */
export async function fetchProductImportTemplateBlob() {
  const response = await http.get('products/import/template', { responseType: 'blob' })
  const blob = response.data
  const ct = response.headers['content-type'] || ''
  if (ct.includes('application/json')) {
    const text = await blob.text()
    const json = JSON.parse(text)
    throw new Error(json.message || json.msg || '模板下载失败')
  }
  const disposition = response.headers['content-disposition'] || ''
  const matchedName = disposition.match(/filename="?([^"]+)"?/)
  return ok({
    blob,
    filename: matchedName?.[1] || 'products_import_template.xlsx',
  })
}
