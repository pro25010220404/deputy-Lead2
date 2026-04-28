<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { completeOrder, getMyOrders, uploadOrderDesign } from '../../api'

const route = useRoute()

const orders = ref([])
const message = ref('')
const loading = ref(false)
const statusLabelMap = {
  booked: '已预订',
  design_pending: '定制待审',
  ready: '待发货',
  completed: '已完成',
  rejected: '已驳回',
}

const loadOrders = async () => {
  loading.value = true
  try {
    const { data } = await getMyOrders()
    orders.value = data
  } catch (error) {
    message.value = error.message
  } finally {
    loading.value = false
  }
}

const handleUploadDesign = async (orderId, event) => {
  const file = event.target.files?.[0]
  if (!file) return
  try {
    await uploadOrderDesign(orderId, file)
    message.value = '设计稿上传成功（POST /api/orders/{id}/design）'
    await loadOrders()
  } catch (error) {
    message.value = error.message
  }
}

const handleComplete = async (orderId) => {
  try {
    await completeOrder(orderId)
    message.value = '确认收货成功（POST /api/orders/{id}/complete）'
    await loadOrders()
  } catch (error) {
    message.value = error.message
  }
}



onMounted(() => {
  if (route.query.success === '1') {
    alert('预订成功！')
  }
  loadOrders()
})
</script>

<template>
  <section class="page-wrap">
    <header class="hero">
      <h1>我的订单</h1>
      <p>查看个人预订记录，上传定制稿、确认收货。</p>
    </header>

    <article class="card">
      <p v-if="message" class="message">{{ message }}</p>
      <p v-if="loading" class="loading">加载中...</p>
      <div class="list">
        <article v-for="item in orders" :key="item.id" class="order-item">
          <div class="top-line">
            <strong>{{ item.id }}</strong>
            <em class="status" :class="`status-${item.status}`">{{ statusLabelMap[item.status] || item.status }}</em>
          </div>
          <p>{{ item.productName }}</p>
          <span>数量：{{ item.quantity }}</span>

          <div class="actions">
            <label v-if="item.status === 'booked'" class="file-upload">
              上传设计稿
              <input type="file" accept=".jpg,.jpeg,.png,.pdf,.ai,.psd" @change="handleUploadDesign(item.id, $event)" />
            </label>
            <button v-if="item.status === 'ready'" class="btn-ghost" @click="handleComplete(item.id)">确认收货</button>
          </div>
        </article>
      </div>
    </article>
  </section>
</template>

<style scoped>
.page-wrap { display: grid; gap: 14px; }
.hero { background: #f4f0e6; border: 2px solid #2f322e; padding: 20px; }
h1 { margin: 0 0 8px; color: #2d322d; font-size: 36px; font-family: Georgia, 'Times New Roman', serif; }
.hero p { margin: 0; color: #3e413d; }
.card { background: #f8f4ea; border: 2px solid #2f322e; padding: 16px; }
.message { color: #245c58; margin-bottom: 10px; }
.btn-primary { border: 1px solid #2f322e; background: #245c58; color: #fff; padding: 8px 12px; cursor: pointer; margin-bottom: 10px; }
.btn-ghost { border: 1px solid #2f322e; background: #f4ede0; color: #2f322e; padding: 8px 12px; cursor: pointer; }
.loading { color: #4f5e5a; margin: 6px 0 10px; }
.list { display: grid; gap: 10px; }
.order-item { border: 2px solid #2f322e; background: #fbf7ec; padding: 12px; display: grid; gap: 8px; }
.top-line { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.status { padding: 4px 8px; border: 1px solid; font-size: 12px; }
.status-booked { color: #2f322e; border-color: #2f322e; background: #efe8d8; }
.status-design_pending { color: #7a5e2a; border-color: #b59558; background: #f8ecd0; }
.status-ready { color: #245c58; border-color: #245c58; background: #e6f0ef; }
.status-completed { color: #3f4f67; border-color: #7c8797; background: #eceff3; }
.status-rejected { color: #8f3c46; border-color: #b97b83; background: #f5e4e7; }
.actions { display: flex; gap: 8px; flex-wrap: wrap; }
.file-upload { position: relative; width: fit-content; border: 1px solid #2f322e; padding: 8px 10px; cursor: pointer; overflow: hidden; color: #2f322e; background: #f4ede0; }
.file-upload input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
</style>
