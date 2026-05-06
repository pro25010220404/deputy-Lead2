import { ok } from '../../utils/apiEnvelope'
import { mockDelay } from './delay'
import { campusMerchState } from './state'

export async function mockGetAdminOrders() {
  await mockDelay()
  return ok(campusMerchState.orders)
}

export async function mockReviewOrder(orderId, payload) {
  await mockDelay()
  const order = campusMerchState.orders.find((item) => item.id === orderId)
  if (!order) throw new Error('订单不存在')
  if (order.status !== 'design_pending') throw new Error('仅 design_pending 可审核')
  const nextStatus = payload.action === 'approve' ? 'ready' : 'rejected'
  order.status = nextStatus
  campusMerchState.auditLogs.unshift({
    id: `${Date.now()}`,
    orderId,
    action: payload.action,
    remark: payload.remark || '',
    createdAt: new Date().toISOString(),
  })
  return ok(order, `审核${payload.action === 'approve' ? '通过' : '驳回'}成功`)
}

export async function mockGetAdminStats() {
  await mockDelay()
  return ok({
    todayOrders: campusMerchState.orders.length,
    pendingReview: campusMerchState.orders.filter((item) => item.status === 'design_pending').length,
    lowStockProducts: campusMerchState.products.filter((item) => item.stock - item.reservedQty <= 20),
  })
}
