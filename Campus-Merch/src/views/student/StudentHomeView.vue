<script setup>
import { onMounted, reactive, ref, computed } from 'vue'
import { getMyOrders, getProducts } from '../../api'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

const quickStats = reactive([
  { label: '可预订商品', value: 0, tip: '支持分类筛选与关键词检索' },
  { label: '我的待收货', value: 0, tip: '已通过审核，等待发放' },
  { label: '待补交设计稿', value: 0, tip: 'booked 状态可继续上传' },
])

const loading = ref(false)

const loadStats = async () => {
  loading.value = true
  try {
    const [{ data: orders }, { data: products }] = await Promise.all([
      getMyOrders(),
      getProducts({ status: 'online' }),
    ])
    quickStats[0].value = products.total || products.list.length
    quickStats[1].value = orders.filter(o => o.status === 'ready').length
    quickStats[2].value = orders.filter(o => o.status === 'booked').length
  } catch (error) {
    console.error('加载统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadStats)

const userInfo = computed(() => {
  const profile = authStore.profile || {}
  return {
    name: profile.name || profile.username || '未登录',
    userId: profile.user_id || '-',
    role: profile.role === 'admin' ? '管理员' : '学生',
    email: profile.email || '-',
  }
})
</script>

<template>
  <section class="student-page">
    <header class="hero">
      <p class="tag">STUDENT PORTAL</p>
      <h1>校园文创预订中心</h1>
      <p></p>
    </header>

    <div class="stats-grid">
      <article v-for="item in quickStats" :key="item.label" class="stat-card">
        <p class="stat-label">{{ item.label }}</p>
        <p class="stat-value">{{ item.value }}</p>
        <p class="stat-tip">{{ item.tip }}</p>
      </article>
    </div>

    <div class="user-info-card">
      <h2>个人信息</h2>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">用户名：</span>
          <span class="info-value">{{ userInfo.name }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">用户ID：</span>
          <span class="info-value">{{ userInfo.userId }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">角色：</span>
          <span class="info-value">{{ userInfo.role }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">邮箱：</span>
          <span class="info-value">{{ userInfo.email }}</span>
        </div>
      </div>
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

.stats-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.stat-card {
  border: 2px solid #2f322e;
  background: #f8f4ea;
  padding: 14px;
}

.user-info-card {
  border: 2px solid #2f322e;
  background: #f8f4ea;
  padding: 20px;
  margin-top: 12px;
}

.user-info-card h2 {
  margin: 0 0 16px;
  color: #2b332b;
  font-size: 22px;
  font-family: Georgia, 'Times New Roman', serif;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  gap: 8px;
}

.info-label {
  color: #596155;
  font-weight: bold;
}

.info-value {
  color: #2d322d;
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

@media (max-width: 980px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
