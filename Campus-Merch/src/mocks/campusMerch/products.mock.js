import { ok } from '../../utils/apiEnvelope'
import { mockDelay } from './delay'
import { campusMerchState, nextCampusProductId } from './state'

function filterProducts(query = {}) {
  return campusMerchState.products.filter((item) => {
    const hitKeyword =
      !query.keyword ||
      item.name.toLowerCase().includes(query.keyword.toLowerCase()) ||
      item.category.toLowerCase().includes(query.keyword.toLowerCase())
    const hitCategory = !query.category || item.category === query.category
    const hitStatus = !query.status || item.status === query.status
    return hitKeyword && hitCategory && hitStatus
  })
}

export async function mockGetProducts(params = {}) {
  await mockDelay()
  const list = filterProducts(params)
  return ok({ list, total: list.length })
}

export async function mockGetProductDetail(id) {
  await mockDelay()
  return ok(campusMerchState.products.find((item) => Number(item.id) === Number(id)))
}

export async function mockUpdateProduct(productId, payload) {
  await mockDelay()
  const target = campusMerchState.products.find((item) => item.id === Number(productId))
  if (!target) throw new Error('商品不存在')
  Object.assign(target, payload, {
    version: target.version + 1,
    updatedAt: new Date().toISOString(),
  })
  return ok(target, '商品维护成功')
}

export async function mockImportProductsByExcel(file, onProgress) {
  if (typeof onProgress === 'function') {
    onProgress(8)
    await mockDelay(120)
    onProgress(26)
    await mockDelay(120)
    onProgress(52)
    await mockDelay(120)
    onProgress(78)
    await mockDelay(120)
    onProgress(95)
    await mockDelay(80)
  } else {
    await mockDelay(320)
  }
  const baseId = nextCampusProductId()
  const seed = [
    {
      id: baseId,
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
      id: baseId + 1,
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
  campusMerchState.products.push(...seed)
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

export async function mockDownloadProductImportTemplate() {
  await mockDelay(120)
  const header = 'name,category,type,spec,price,stock,cover_url,custom_rule\n'
  const row = '校园徽章,周边,badge,5cm,12,100,,支持图案定制\n'
  return ok({
    blob: new Blob([header + row], { type: 'application/vnd.ms-excel' }),
    filename: 'products_import_template.xlsx',
  })
}
