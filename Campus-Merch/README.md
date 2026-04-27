# 校园文创与活动物料预订管理系统（前端）

基于 `Vue 3 + Vite + Vue Router + Pinia` 的前端基础工程，已包含登录页复刻、系统主框架与核心业务页面骨架。

## 已完成内容

- 登录页：按参考图实现三角几何视觉样式，组件化封装于 `src/components/login/TriangleLoginPanel.vue`
- 权限流程：基于 `Pinia` 的模拟登录与路由守卫（未登录自动跳转登录页）
- 业务壳层：左侧导航 + 内容区域的系统布局
- 页面骨架：总览、商品大厅、我的订单、订单审核、数据看板、404

## 快速启动

```bash
npm install
npm run dev
```

## 构建验证

```bash
npm run build
```

## 目录结构

```text
src
├─components
│  ├─common
│  └─login
├─layouts
├─router
├─stores
└─views
   ├─admin
   ├─auth
   ├─dashboard
   ├─orders
   ├─products
   └─shared
```

## 下一步建议

- 对接后端 11 个核心接口并替换当前页面 mock 数据
- 把登录页字体、阴影和细节继续微调到设计图 1:1
- 增加 API 封装层（axios 拦截器、错误处理、Token 刷新）
