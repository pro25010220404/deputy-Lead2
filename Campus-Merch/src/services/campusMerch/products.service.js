import * as productsApi from '../../api/modules/products.api'
import { shouldUseMock } from '../../api/http'
import * as productsMock from '../../mocks/campusMerch/products.mock'

export async function getProducts(params = {}) {
  if (!shouldUseMock()) return productsApi.fetchProducts(params)
  return productsMock.mockGetProducts(params)
}

export async function getProductDetail(id) {
  if (!shouldUseMock()) return productsApi.fetchProductDetail(id)
  return productsMock.mockGetProductDetail(id)
}

export async function updateProduct(productId, payload) {
  if (!shouldUseMock()) return productsApi.putProduct(productId, payload)
  return productsMock.mockUpdateProduct(productId, payload)
}

export async function importProductsByExcel(file, onProgress) {
  if (!shouldUseMock()) {
    const formData = new FormData()
    formData.append('file', file)
    if (typeof onProgress === 'function') onProgress(15)
    const result = await productsApi.postProductsImport(formData)
    if (typeof onProgress === 'function') onProgress(100)
    return result
  }
  return productsMock.mockImportProductsByExcel(file, onProgress)
}

export async function downloadProductImportTemplate() {
  if (!shouldUseMock()) return productsApi.fetchProductImportTemplateBlob()
  return productsMock.mockDownloadProductImportTemplate()
}
