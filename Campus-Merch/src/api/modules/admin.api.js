import { request } from '../http'

export function fetchAdminOrders() {
  return request('admin/orders')
}

export function putAdminOrderReview(orderId, payload) {
  return request(`admin/orders/${orderId}/review`, { method: 'PUT', data: payload })
}

export function fetchAdminStats() {
  return request('admin/stats')
}
