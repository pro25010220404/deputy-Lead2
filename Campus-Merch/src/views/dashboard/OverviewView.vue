<script setup>
const coreApis = [
  'GET /api/products',
  'GET /api/products/{id}',
  'POST /api/orders',
  'POST /api/orders/{id}/design',
  'POST /api/orders/{id}/complete',
  'POST /api/products/import',
  'GET /api/orders/export',
  'PUT /api/admin/orders/{id}/review',
  'GET /api/my-orders',
  'PUT /api/products/{id}',
  'GET /api/admin/stats',
]
</script>

<template>
  <section class="overview-page">
    <header class="hero">
      <h1>校园文创与活动物料预订管理系统</h1>
      <p>当前前端页面结构与业务流程已按你的需求文档对齐，可用于后续接口联调。</p>
    </header>

    <div class="grid two">
      <article class="card">
        <h2>角色与权限</h2>
        <ul>
          <li>用户：浏览商品、提交预订、上传定制稿、查看我的订单、导出个人记录</li>
          <li>管理员：订单审核、商品维护、批量导入、数据看板、报表导出</li>
        </ul>
      </article>
      <article class="card">
        <h2>订单状态机</h2>
        <p class="mono">draft → booked → design_pending → ready → completed</p>
        <p class="mono">design_pending → rejected（可重新上传）</p>
      </article>
    </div>

    <article class="card">
      <h2>11 个核心业务接口</h2>
      <div class="api-list">
        <span v-for="api in coreApis" :key="api">{{ api }}</span>
      </div>
    </article>

    <div class="grid two">
      <article class="card">
        <h2>文件上传规范（OSS）</h2>
        <ul>
          <li>格式：jpg / jpeg / png / pdf / ai / psd</li>
          <li>大小：单文件 ≤ 15MB</li>
          <li>路径：merch-designs/{order_id}/{timestamp}_{uuid}.{ext}</li>
          <li>返回：临时签名链接或代理下载路径</li>
        </ul>
      </article>
      <article class="card">
        <h2>Excel 导入导出规范</h2>
        <ul>
          <li>导入模板字段：name, category, type, spec, price, stock, cover_url, custom_rule</li>
          <li>导入策略：合法入库，非法行返回失败明细</li>
          <li>导出策略：按筛选条件流式输出，避免内存峰值过高</li>
        </ul>
      </article>
    </div>
  </section>
</template>

<style scoped>
.overview-page { display: grid; gap: 14px; }
.hero { background: #f4f0e6; border: 2px solid #2f322e; padding: 20px; }
h1 { margin: 0 0 8px; font-size: 38px; color: #2d322d; font-family: Georgia, 'Times New Roman', serif; }
h2 { margin: 0 0 10px; font-size: 22px; color: #2d322d; font-family: Georgia, 'Times New Roman', serif; }
.card { background: #f8f4ea; border: 2px solid #2f322e; padding: 16px; }
.grid.two { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
ul { margin: 0; padding-left: 18px; display: grid; gap: 8px; color: #3e413d; }
.mono { font-family: Consolas, monospace; color: #2a514d; margin: 8px 0; }
.api-list { display: flex; flex-wrap: wrap; gap: 8px; }
.api-list span { border: 1px solid #2f322e; background: #efe8d8; padding: 6px 10px; font-family: Consolas, monospace; font-size: 12px; }
@media (max-width: 980px) { .grid.two { grid-template-columns: 1fr; } }
</style>
