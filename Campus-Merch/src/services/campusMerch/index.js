/**
 * 校园文创业务入口：根据 VITE_USE_MOCK 走 mock 或真实 HTTP（api/modules）。
 * 页面与 Store 应从此处引用，不要直接引用 api/modules。
 */
export * from './products.service'
export * from './orders.service'
export * from './admin.service'
