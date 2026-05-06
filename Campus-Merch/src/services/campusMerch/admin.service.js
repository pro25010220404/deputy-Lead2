import * as adminApi from '../../api/modules/admin.api'
import { shouldUseMock } from '../../api/http'
import * as adminMock from '../../mocks/campusMerch/admin.mock'

export async function getAdminOrders() {
  if (!shouldUseMock()) return adminApi.fetchAdminOrders()
  return adminMock.mockGetAdminOrders()
}

export async function reviewOrder(orderId, payload) {
  if (!shouldUseMock()) return adminApi.putAdminOrderReview(orderId, payload)
  return adminMock.mockReviewOrder(orderId, payload)
}

export async function getAdminStats() {
  if (!shouldUseMock()) return adminApi.fetchAdminStats()
  return adminMock.mockGetAdminStats()
}
