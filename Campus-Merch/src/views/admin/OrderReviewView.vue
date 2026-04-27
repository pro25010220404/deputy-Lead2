<script setup>
import { onMounted, ref } from 'vue'
import { getAdminOrders, reviewOrder } from '../../api'

const orders = ref([])
const remark = ref('')
const selectedId = ref('')
const message = ref('')

const loadPendingOrders = async () => {
  try {
    const { data } = await getAdminOrders()
    orders.value = data.filter((item) => item.status === 'design_pending')
    if (!selectedId.value && orders.value.length) {
      selectedId.value = orders.value[0].id
    }
  } catch (error) {
    message.value = error.message
  }
}

const submitReview = async (action) => {
  if (!selectedId.value) {
    message.value = '请先选择待审核订单'
    return
  }
  try {
    await reviewOrder(selectedId.value, { action, remark: remark.value })
    message.value = action === 'approve' ? '审核通过' : '审核驳回'
    remark.value = ''
    await loadPendingOrders()
  } catch (error) {
    message.value = error.message
  }
}

onMounted(loadPendingOrders)
</script>

<template>
  <section class="page-wrap">
    <header class="hero">
      <h1>订单审核</h1>
      <p>处理状态为 `design_pending` 的订单，执行通过/驳回并记录审核意见。</p>
    </header>
    <article class="card">
      <p class="api">PUT /api/admin/orders/{id}/review</p>
      <p v-if="message" class="message">{{ message }}</p>

      <div class="panel">
        <label>待审核订单</label>
        <select v-model="selectedId">
          <option value="">请选择</option>
          <option v-for="item in orders" :key="item.id" :value="item.id">
            {{ item.id }} - {{ item.productName }} - {{ item.userName }}
          </option>
        </select>
        <label>审核意见</label>
        <textarea v-model="remark" rows="5" placeholder="请输入通过/驳回原因"></textarea>
        <div class="btns">
          <button class="pass" @click="submitReview('approve')">通过</button>
          <button class="reject" @click="submitReview('reject')">驳回</button>
        </div>
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
.api { margin: 0 0 10px; font-family: Consolas, monospace; color: #245c58; font-size: 12px; }
.panel { display: grid; gap: 10px; max-width: 560px; }
textarea, select { border: 1px solid #2f322e; padding: 10px; background: #fcfbf6; color: #30342f; }
.btns { display: flex; gap: 10px; }
button { border: none; padding: 9px 16px; cursor: pointer; }
.pass { background: #245c58; color: #fff; }
.reject { background: #a64b57; color: #fff; }
.message { color: #245c58; margin: 0 0 10px; }
</style>
