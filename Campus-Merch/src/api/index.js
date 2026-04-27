import { mockDb, nextProductId } from './mockDb'
import { ok, request, shouldUseMock } from './http'

const wait = (ms = 160) => new Promise((resolve) => setTimeout(resolve, ms))
const toQueryString = (params = {}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value))
    }
  })
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

function filterProducts(query = {}) {
  return mockDb.products.filter((item) => {
    const hitKeyword =
      !query.keyword ||
      item.name.toLowerCase().includes(query.keyword.toLowerCase()) ||
      item.category.toLowerCase().includes(query.keyword.toLowerCase())
    const hitCategory = !query.category || item.category === query.category
    const hitStatus = !query.status || item.status === query.status
    return hitKeyword && hitCategory && hitStatus
  })
}

export async function getProducts(params = {}) {
  if (!shouldUseMock()) return request(`/products${toQueryString(params)}`)
  await wait()
  return ok({
    list: filterProducts(params),
    total: filterProducts(params).length,
  })
}

export async function getProductDetail(id) {
  if (!shouldUseMock()) return request(`/products/${id}`)
  await wait()
  return ok(mockDb.products.find((item) => Number(item.id) === Number(id)))
}

export async function createOrder(payload) {
  if (!shouldUseMock()) return request('/orders', { method: 'POST', body: JSON.stringify(payload) })
  await wait()
  const product = mockDb.products.find((p) => p.id === Number(payload.productId))
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
  mockDb.orders.unshift(order)
  return ok(order, '预订成功')
}

export async function uploadOrderDesign(orderId, file) {
  if (!shouldUseMock()) {
    const formData = new FormData()
    formData.append('file', file)
    return request(`/orders/${orderId}/design`, { method: 'POST', body: formData, headers: {} })
  }
  await wait()
  const order = mockDb.orders.find((item) => item.id === orderId)
  if (!order) throw new Error('订单不存在')
  if (order.status !== 'booked') throw new Error('仅 booked 状态支持上传设计稿')
  order.status = 'design_pending'
  order.designUrl = `mock://designs/${orderId}/${file?.name || 'design.png'}`
  return ok(order, '设计稿上传成功')
}

export async function completeOrder(orderId) {
  if (!shouldUseMock()) return request(`/orders/${orderId}/complete`, { method: 'POST' })
  await wait()
  const order = mockDb.orders.find((item) => item.id === orderId)
  if (!order) throw new Error('订单不存在')
  if (!['ready'].includes(order.status)) throw new Error('当前状态不可确认收货')
  order.status = 'completed'
  return ok(order, '确认收货成功')
}

export async function importProductsByExcel(file, onProgress) {
  if (!shouldUseMock()) {
    const formData = new FormData()
    formData.append('file', file)
    if (typeof onProgress === 'function') onProgress(15)
    const result = await request('/products/import', { method: 'POST', body: formData, headers: {} })
    if (typeof onProgress === 'function') onProgress(100)
    return result
  }
  if (typeof onProgress === 'function') {
    onProgress(8)
    await wait(120)
    onProgress(26)
    await wait(120)
    onProgress(52)
    await wait(120)
    onProgress(78)
    await wait(120)
    onProgress(95)
    await wait(80)
  } else {
    await wait(320)
  }
  const seed = [
    {
      id: nextProductId(),
      name: '活动帆布袋',
      category: '周边',
      type: 'bag',
      spec: '35x40cm',
      price: 32,
      stock: 160,
      soldQty: 0,
      reservedQty: 0,
      customRule: '支持丝印图案',
      coverUrl: '',
      status: 'online',
      version: 1,
      updatedAt: new Date().toISOString(),
    },
    {
      id: nextProductId() + 1,
      name: '校庆钥匙扣',
      category: '周边',
      type: 'keychain',
      spec: '金属 4cm',
      price: 16,
      stock: 220,
      soldQty: 0,
      reservedQty: 0,
      customRule: '支持单色激光刻字',
      coverUrl: '',
      status: 'online',
      version: 1,
      updatedAt: new Date().toISOString(),
    },
  ]
  mockDb.products.push(...seed)
  return ok(
    {
      success: seed.length,
      failed: [
        { row: 3, field: 'price', reason: '必须为正数' },
        { row: 6, field: 'category', reason: '分类不在允许枚举内' },
      ],
    },
    '导入完成（部分成功）'
  )
}

export async function downloadProductImportTemplate() {
  if (!shouldUseMock()) {
    const response = await fetch('/api/products/import/template')
    if (!response.ok) {
      throw new Error('模板下载失败')
    }
    const blob = await response.blob()
    const disposition = response.headers.get('content-disposition') || ''
    const matchedName = disposition.match(/filename="?([^"]+)"?/)
    return {
      data: {
        blob,
        filename: matchedName?.[1] || 'products_import_template.xlsx',
      },
    }
  }

  await wait(120)
  const header = 'name,category,type,spec,price,stock,cover_url,custom_rule\n'
  const row = '校园徽章,周边,badge,5cm,12,100,,支持图案定制\n'
  return ok({
    blob: new Blob([header + row], { type: 'application/vnd.ms-excel' }),
    filename: 'products_import_template.xlsx',
  })
}

export async function exportOrders(params = {}) {
  if (!shouldUseMock()) return request(`/orders/export${toQueryString(params)}`)
  await wait(280)
  return ok({ downloadUrl: `mock://exports/orders-${Date.now()}.xlsx`, filters: params }, '导出任务已生成')
}

export async function getAdminOrders() {
  if (!shouldUseMock()) return request('/admin/orders')
  await wait()
  return ok(mockDb.orders)
}

export async function reviewOrder(orderId, payload) {
  if (!shouldUseMock()) {
    return request(`/admin/orders/${orderId}/review`, { method: 'PUT', body: JSON.stringify(payload) })
  }
  await wait()
  const order = mockDb.orders.find((item) => item.id === orderId)
  if (!order) throw new Error('订单不存在')
  if (order.status !== 'design_pending') throw new Error('仅 design_pending 可审核')
  const nextStatus = payload.action === 'approve' ? 'ready' : 'rejected'
  order.status = nextStatus
  mockDb.auditLogs.unshift({
    id: `${Date.now()}`,
    orderId,
    action: payload.action,
    remark: payload.remark || '',
    createdAt: new Date().toISOString(),
  })
  return ok(order, `审核${payload.action === 'approve' ? '通过' : '驳回'}成功`)
}

export async function getMyOrders() {
  if (!shouldUseMock()) return request('/my-orders')
  await wait()
  return ok(mockDb.orders.filter((item) => item.userId === 'u1001'))
}

export async function updateProduct(productId, payload) {
  if (!shouldUseMock()) {
    return request(`/products/${productId}`, { method: 'PUT', body: JSON.stringify(payload) })
  }
  await wait()
  const target = mockDb.products.find((item) => item.id === Number(productId))
  if (!target) throw new Error('商品不存在')
  Object.assign(target, payload, { version: target.version + 1, updatedAt: new Date().toISOString() })
  return ok(target, '商品维护成功')
}

export async function getAdminStats() {
  if (!shouldUseMock()) return request('/admin/stats')
  await wait()
  return ok({
    todayOrders: mockDb.orders.length,
    pendingReview: mockDb.orders.filter((item) => item.status === 'design_pending').length,
    lowStockProducts: mockDb.products.filter((item) => item.stock - item.reservedQty <= 20),
  })
}
