<script setup>
import { onMounted, ref } from 'vue'
import { getAdminStats } from '../../api'

const stats = ref({
  todayOrders: 0,
  pendingReview: 0,
  lowStockProducts: [],
})

onMounted(async () => {
  const { data } = await getAdminStats()
  stats.value = data
})
</script>

<template>
  <section class="page-wrap">
    <header class="hero">
      <h1>数据看板</h1>
      <p>聚合显示今日预订量、待审核数与库存预警，支持管理员快速决策。</p>
    </header>

    <article class="card">
      <p class="api">GET /api/admin/stats</p>
      <div class="metrics">
        <article>
          <span>今日预订量</span>
          <strong>{{ stats.todayOrders }}</strong>
        </article>
        <article>
          <span>待审核订单</span>
          <strong>{{ stats.pendingReview }}</strong>
        </article>
        <article>
          <span>库存预警商品</span>
          <strong>{{ stats.lowStockProducts.length }}</strong>
        </article>
      </div>

      <section class="warn-list">
        <h3>库存预警清单</h3>
        <p v-if="!stats.lowStockProducts.length" class="empty">暂无预警商品</p>
        <ul v-else>
          <li v-for="item in stats.lowStockProducts" :key="item.id">
            {{ item.name }}（可用库存：{{ item.stock - item.reservedQty }}）
          </li>
        </ul>
      </section>
    </article>
  </section>
</template>

<style scoped>
.page-wrap { display: grid; gap: 14px; }
.hero { background: #f4f0e6; border: 2px solid #2f322e; padding: 20px; }
h1 { margin: 0 0 8px; color: #2d322d; font-size: 36px; font-family: Georgia, 'Times New Roman', serif; }
.hero p { margin: 0; color: #3e413d; }
.card { background: #f8f4ea; border: 2px solid #2f322e; padding: 16px; }
.api { margin: 0 0 10px; font-family: Consolas, monospace; color: #245c58; font-size: 12px; }
.metrics { display: grid; gap: 10px; grid-template-columns: repeat(3, 1fr); }
.metrics article { background: #fbf7ec; border: 2px solid #2f322e; padding: 16px; }
strong { display: block; margin-top: 8px; font-size: 34px; color: #2f322e; font-family: Georgia, 'Times New Roman', serif; }
.warn-list { margin-top: 14px; border: 2px solid #2f322e; padding: 12px; background: #fbf7ec; }
h3 { margin: 0 0 8px; color: #2d322d; font-family: Georgia, 'Times New Roman', serif; }
ul { margin: 0; padding-left: 18px; color: #3e413d; display: grid; gap: 6px; }
.empty { margin: 0; color: #5f635e; }
@media (max-width: 880px) { .metrics { grid-template-columns: 1fr; } }
</style>
