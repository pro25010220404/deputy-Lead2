<script setup>
import { ref } from 'vue'
import { exportOrders } from '../../api'

const loading = ref(false)
const message = ref('')
const filters = ref({
  status: '',
  category: '',
  from: 'admin-panel',
})

const handleExport = async () => {
  loading.value = true
  try {
    const { data } = await exportOrders(filters.value)
    if (data.downloadUrl?.startsWith('http')) {
      window.open(data.downloadUrl, '_blank')
      message.value = '报表导出成功，已打开下载链接'
    } else {
      message.value = `报表导出任务已生成：${data.downloadUrl}`
    }
  } catch (error) {
    message.value = error.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="page-wrap">
    <header class="hero">
      <h1>报表导出</h1>
      <p>按筛选条件导出订单报表（含定制稿链接与发货清单字段）。</p>
    </header>

    <article class="card">
      <p class="api">GET /api/orders/export</p>
      <p v-if="message" class="message">{{ message }}</p>
      <div class="filters">
        <label>
          订单状态
          <select v-model="filters.status">
            <option value="">全部</option>
            <option value="booked">booked</option>
            <option value="design_pending">design_pending</option>
            <option value="ready">ready</option>
            <option value="completed">completed</option>
            <option value="rejected">rejected</option>
          </select>
        </label>
        <label>
          商品分类
          <select v-model="filters.category">
            <option value="">全部</option>
            <option value="服饰">服饰</option>
            <option value="周边">周边</option>
            <option value="文具">文具</option>
          </select>
        </label>
      </div>
      <button class="btn-primary" :disabled="loading" @click="handleExport">
        {{ loading ? '导出中...' : '导出 Excel 报表' }}
      </button>
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
.filters { display: flex; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
label { display: grid; gap: 6px; color: #2f322e; }
select { border: 1px solid #2f322e; padding: 8px; background: #fcfbf6; color: #30342f; min-width: 220px; }
.btn-primary { border: 1px solid #2f322e; background: #245c58; color: #fff; padding: 8px 12px; cursor: pointer; }
.message { color: #245c58; margin: 0 0 10px; }
</style>
