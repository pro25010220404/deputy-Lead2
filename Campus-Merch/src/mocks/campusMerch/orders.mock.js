import { ok } from '../../utils/apiEnvelope'
import { mockDelay } from './delay'
import { campusMerchState } from './state'

export async function mockCreateOrder(payload) {
  await mockDelay()
  const product = campusMerchState.products.find((p) => p.id === Number(payload.productId))
  if (!product) throw new Error('商品不存在')
  if (product.stock - product.reservedQty < Number(payload.quantity)) {
    throw new Error('库存不足，无法预订')
  }
  product.reservedQty += Number(payload.quantity)
  const order = {
    id: `ORD-${Date.now()}`,
    productId: product.id,
    productName: product.name,
    quantity: Number(payload.quantity),
    preference: payload.preference || '',
    remark: payload.remark || '',
    status: 'booked',
    designUrl: '',
    userId: 'u1001',
    userName: 'demo',
    createdAt: new Date().toISOString(),
  }
  campusMerchState.orders.unshift(order)
  return ok(order, '预订成功')
}

export async function mockUploadOrderDesign(orderId, file) {
  await mockDelay()
  const order = campusMerchState.orders.find((item) => item.id === orderId)
  if (!order) throw new Error('订单不存在')
  if (order.status !== 'booked') throw new Error('仅 booked 状态支持上传设计稿')
  order.status = 'design_pending'
  order.designUrl = `mock://designs/${orderId}/${file?.name || 'design.png'}`
  return ok(order, '设计稿上传成功')
}

export async function mockCompleteOrder(orderId) {
  await mockDelay()
  const order = campusMerchState.orders.find((item) => item.id === orderId)
  if (!order) throw new Error('订单不存在')
  if (!['delivered'].includes(order.status)) throw new Error('仅已送达订单可确认收货')
  order.status = 'completed'
  return ok(order, '确认收货成功')
}

export async function mockExportOrders(params = {}) {
  await mockDelay(280)
  return ok(
    { downloadUrl: `mock://exports/orders-${Date.now()}.xlsx`, filters: params },
    '导出任务已生成'
  )
}

export async function mockGetMyOrders() {
  await mockDelay()
  return ok(campusMerchState.orders.filter((item) => item.userId === 'u1001'))
}
