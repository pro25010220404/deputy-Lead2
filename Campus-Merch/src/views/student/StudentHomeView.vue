<script setup>
import { reactive } from 'vue'

const quickStats = reactive([
  { label: '可预订商品', value: 24, tip: '支持分类筛选与关键词检索' },
  { label: '我的待收货', value: 3, tip: '已通过审核，等待发放' },
  { label: '待补交设计稿', value: 2, tip: 'booked 状态可继续上传' },
])

const actions = [
  {
    title: '浏览商品大厅',
    desc: '查看文创/活动物料详情，按分类和价格筛选后提交预订。',
    route: '/products',
    btn: '去选商品',
  },
  {
    title: '上传定制图案',
    desc: '仅对已预订订单上传设计稿，支持 jpg/png/pdf/ai/psd。',
    route: '/orders',
    btn: '去上传',
  },
  {
    title: '查看我的订单',
    desc: '跟踪订单从 booked 到 completed 的全过程状态。',
    route: '/orders',
    btn: '查看订单',
  },
]
</script>

<template>
  <section class="student-page">
    <header class="hero">
      <p class="tag">STUDENT PORTAL</p>
      <h1>校园文创预订中心</h1>
      <p>学生登录后默认进入此页面，可完成浏览商品、提交预订、上传设计稿和跟踪订单进度。</p>
    </header>

    <div class="stats-grid">
      <article v-for="item in quickStats" :key="item.label" class="stat-card">
        <p class="stat-label">{{ item.label }}</p>
        <p class="stat-value">{{ item.value }}</p>
        <p class="stat-tip">{{ item.tip }}</p>
      </article>
    </div>

    <div class="action-grid">
      <article v-for="item in actions" :key="item.title" class="action-card">
        <h2>{{ item.title }}</h2>
        <p>{{ item.desc }}</p>
        <router-link :to="item.route" class="action-btn">{{ item.btn }}</router-link>
      </article>
    </div>
  </section>
</template>

<style scoped>
.student-page {
  display: grid;
  gap: 14px;
}

.hero {
  border: 2px solid #2f322e;
  background: #f4f0e6;
  padding: 20px;
}

.tag {
  margin: 0;
  color: #2a6f67;
  letter-spacing: 0.08em;
  font-family: Consolas, monospace;
}

h1 {
  margin: 6px 0;
  font-size: 36px;
  color: #2d322d;
  font-family: Georgia, 'Times New Roman', serif;
}

.hero p:last-child {
  margin: 0;
  color: #4a5149;
}

.stats-grid,
.action-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.stat-card,
.action-card {
  border: 2px solid #2f322e;
  background: #f8f4ea;
  padding: 14px;
}

.stat-label {
  margin: 0;
  color: #596155;
  font-size: 13px;
}

.stat-value {
  margin: 8px 0;
  font-size: 36px;
  color: #1f5c54;
  font-family: Georgia, 'Times New Roman', serif;
}

.stat-tip {
  margin: 0;
  color: #4f5752;
  font-size: 13px;
}

h2 {
  margin: 0 0 8px;
  color: #2b332b;
  font-size: 22px;
  font-family: Georgia, 'Times New Roman', serif;
}

.action-card p {
  margin: 0 0 12px;
  color: #4e5751;
  min-height: 42px;
}

.action-btn {
  text-decoration: none;
  display: inline-block;
  border: 1px solid #2f322e;
  padding: 8px 12px;
  color: #2f322e;
  background: #efe8d8;
}

@media (max-width: 980px) {
  .stats-grid,
  .action-grid {
    grid-template-columns: 1fr;
  }
}
</style>
