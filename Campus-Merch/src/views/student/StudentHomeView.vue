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
    <el-card class="hero" shadow="never">
      <p class="tag">STUDENT PORTAL</p>
      <h1>校园文创预订中心</h1>
      <p></p>
    </el-card>

    <div class="stats-grid">
      <el-card v-for="item in quickStats" :key="item.label" class="stat-card" shadow="hover">
        <p class="stat-label">{{ item.label }}</p>
        <el-statistic class="stat-value" :value="item.value" />
        <p class="stat-tip">{{ item.tip }}</p>
      </el-card>
    </div>

    <el-card class="user-info-card" shadow="never">
      <h2>个人信息</h2>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户名">{{ userInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ userInfo.userId }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ userInfo.role }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ userInfo.email }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
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
}

.user-info-card {
  border: 2px solid #2f322e;
  background: #f8f4ea;
  margin-top: 12px;
}

:deep(.hero .el-card__body) {
  padding: 20px;
}

:deep(.stat-card .el-card__body) {
  padding: 14px;
}

:deep(.user-info-card .el-card__body) {
  padding: 20px;
}

:deep(.user-info-card .el-descriptions__body),
:deep(.user-info-card .el-descriptions__table),
:deep(.user-info-card .el-descriptions__cell),
:deep(.user-info-card .el-descriptions__label),
:deep(.user-info-card .el-descriptions__content) {
  background: #f8f4ea !important;
  color: #2d322d;
  border-color: #9f9a8d !important;
}

.user-info-card h2 {
  margin: 0 0 16px;
  color: #2b332b;
  font-size: 22px;
  font-family: Georgia, 'Times New Roman', serif;
}

.stat-label {
  margin: 0;
  color: #596155;
  font-size: 13px;
}

:deep(.stat-value .el-statistic__content) {
  margin: 8px 0;
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
}
</style>
