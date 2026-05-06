import { request } from '../http'
import { toQueryString } from '../../utils/toQueryString'

export function postOrder(payload) {
  return request('orders', { method: 'POST', data: payload })
}

export function postOrderDesign(orderId, formData) {
  return request(`orders/${orderId}/design`, { method: 'POST', data: formData, headers: {} })
}

export function postOrderComplete(orderId) {
  return request(`orders/${orderId}/complete`, { method: 'POST' })
}

export function fetchOrdersExport(params = {}) {
  return request(`orders/export${toQueryString(params)}`)
}

export function fetchMyOrders() {
  return request('my-orders')
}
