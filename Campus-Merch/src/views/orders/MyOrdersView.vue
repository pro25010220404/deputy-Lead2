<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { completeOrder, getMyOrders, uploadOrderDesign } from '../../services/campusMerch'

const route = useRoute()

const orders = ref([])
const message = ref('')
const loading = ref(false)
const statusLabelMap = {
  booked: '已预订',
  design_pending: '定制待审',
  ready: '待发货',
  shipping: '发货中',
  delivered: '已送达',
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
    ElMessage.success('预订成功！')
  }
  loadOrders()
})
</script>

<template>
  <section class="page-wrap">
    <el-card class="hero" shadow="never">
      <h1>我的订单</h1>
      <p>查看个人预订记录，上传定制稿、确认收货。</p>
    </el-card>

    <el-card class="card" shadow="never">
      <el-alert v-if="message" class="message" :title="message" type="info" :closable="false" />
      <el-skeleton v-if="loading" :rows="4" animated />
      <div class="list">
        <el-card v-for="item in orders" :key="item.id" class="order-item" shadow="hover">
          <div class="top-line">
            <strong>{{ item.id.replace('ORD-', '') }}</strong>
            <el-tag class="status" :type="item.status === 'delivered' ? 'success' : item.status === 'rejected' ? 'danger' : item.status === 'design_pending' ? 'warning' : item.status === 'shipping' ? 'primary' : 'info'">
              {{ statusLabelMap[item.status] || item.status }}
            </el-tag>
          </div>
          <p>{{ item.productName }}</p>
          <span>数量：{{ item.quantity }}</span>

          <div class="actions">
            <label v-if="item.status === 'booked'" class="file-upload">
              上传设计稿
              <input type="file" accept=".jpg,.jpeg,.png,.pdf,.ai,.psd" @change="handleUploadDesign(item.id, $event)" />
            </label>
            <el-button v-if="item.status === 'delivered'" type="primary" plain @click="handleComplete(item.id)">确认收货</el-button>
          </div>
        </el-card>
      </div>
    </el-card>
  </section>
</template>

<style scoped>
.page-wrap { display: block; background: #ebe8e0; min-height: 100vh; }
.hero { border: none; background: #ebe8e0; box-shadow: none; margin-bottom: 0; }
h1 { margin: 0 0 4px; color: #2d322d; font-size: 28px; font-family: Georgia, 'Times New Roman', serif; }
.hero p { margin: 0; color: #3e413d; font-size: 14px; }
.card { border: none; background: #ebe8e0; box-shadow: none; margin-top: 0; }
.message { margin-bottom: 8px; background: #ebe8e0 !important; border: none !important; }
:deep(.message .el-alert__icon) { color: #2a6f67; }
:deep(.message .el-alert__title) { color: #2d322d; }
.list { display: flex; flex-direction: column; gap: 0; }
.order-item { border: none; background: #ebe8e0; display: grid; gap: 4px; padding: 10px 0; border-bottom: 1px solid #dcd9d0; }
.order-item:last-child { border-bottom: none; }
.top-line { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.actions { display: flex; gap: 8px; flex-wrap: wrap; }
.file-upload { position: relative; width: fit-content; padding: 6px 10px; cursor: pointer; overflow: hidden; color: #2a6f67; background: #dfdbd0; border-radius: 6px; font-size: 13px; }
.file-upload input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
:deep(.hero .el-card__body) { padding: 12px 16px 8px; }
:deep(.card .el-card__body) { padding: 0 16px; }
:deep(.order-item .el-card__body) { padding: 0; }
:deep(.el-card__header) { border-bottom: none; }
</style>
