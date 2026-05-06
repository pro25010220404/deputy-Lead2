import * as ordersApi from '../../api/modules/orders.api'
import { shouldUseMock } from '../../api/http'
import * as ordersMock from '../../mocks/campusMerch/orders.mock'

export async function createOrder(payload) {
  if (!shouldUseMock()) return ordersApi.postOrder(payload)
  return ordersMock.mockCreateOrder(payload)
}

export async function uploadOrderDesign(orderId, file) {
  if (!shouldUseMock()) {
    const formData = new FormData()
    formData.append('file', file)
    return ordersApi.postOrderDesign(orderId, formData)
  }
  return ordersMock.mockUploadOrderDesign(orderId, file)
}

export async function completeOrder(orderId) {
  if (!shouldUseMock()) return ordersApi.postOrderComplete(orderId)
  return ordersMock.mockCompleteOrder(orderId)
}

export async function exportOrders(params = {}) {
  if (!shouldUseMock()) return ordersApi.fetchOrdersExport(params)
  return ordersMock.mockExportOrders(params)
}

export async function getMyOrders() {
  if (!shouldUseMock()) return ordersApi.fetchMyOrders()
  return ordersMock.mockGetMyOrders()
}
