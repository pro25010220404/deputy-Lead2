<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
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
            <strong>{{ item.id }}</strong>
            <el-tag class="status" :type="item.status === 'ready' ? 'success' : item.status === 'rejected' ? 'danger' : item.status === 'design_pending' ? 'warning' : 'info'">
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
            <el-button v-if="item.status === 'ready'" type="primary" plain @click="handleComplete(item.id)">确认收货</el-button>
          </div>
        </el-card>
      </div>
    </el-card>
  </section>
</template>

<style scoped>
.page-wrap { display: grid; gap: 14px; }
.hero { border: 2px solid #2f322e; background: #f4f0e6; }
h1 { margin: 0 0 8px; color: #2d322d; font-size: 36px; font-family: Georgia, 'Times New Roman', serif; }
.hero p { margin: 0; color: #3e413d; }
.card { border: 2px solid #2f322e; background: #f8f4ea; }
.message { margin-bottom: 10px; }
.list { display: grid; gap: 10px; }
.order-item { border: 2px solid #2f322e; background: #fbf7ec; display: grid; gap: 8px; }
.top-line { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.actions { display: flex; gap: 8px; flex-wrap: wrap; }
.file-upload { position: relative; width: fit-content; border: 1px solid #2f322e; padding: 8px 10px; cursor: pointer; overflow: hidden; color: #2f322e; background: #f4ede0; }
.file-upload input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
:deep(.hero .el-card__body) { padding: 20px; }
:deep(.card .el-card__body) { padding: 16px; }
:deep(.order-item .el-card__body) { padding: 12px; }
</style>
