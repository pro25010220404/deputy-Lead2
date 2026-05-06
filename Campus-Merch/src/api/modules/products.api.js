import { ok } from '../../utils/apiEnvelope'
import { http, request } from '../http'
import { toQueryString } from '../../utils/toQueryString'

export function fetchProducts(params = {}) {
  return request(`products${toQueryString(params)}`)
}

export function fetchProductDetail(id) {
  return request(`products/${id}`)
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
