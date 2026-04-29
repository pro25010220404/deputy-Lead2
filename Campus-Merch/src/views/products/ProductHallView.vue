<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  createOrder,
  getProductDetail,
  getProducts,
} from '../../api'

const router = useRouter()

const loading = ref(false)
const products = ref([])
const message = ref('')
const detail = ref(null)
const selectedProductId = ref('')

const filters = reactive({
  keyword: '',
  category: '',
  status: 'online',
})

const orderForm = reactive({
  productId: '',
  quantity: 1,
  preference: '',
  remark: '',
})



const fetchProducts = async () => {
  loading.value = true
  try {
    const { data } = await getProducts(filters)
    products.value = data.list
    if (selectedProductId.value) await handleViewDetail(selectedProductId.value)
  } catch (error) {
    message.value = error.message
  } finally {
    loading.value = false
  }
}

const handleViewDetail = async (id) => {
  selectedProductId.value = String(id)
  const { data } = await getProductDetail(id)
  detail.value = data
  orderForm.productId = String(data.id)
}

const handleCreateOrder = async () => {
  try {
    console.log('提交订单:', orderForm)
    const result = await createOrder(orderForm)
    console.log('订单创建成功:', result)
    router.push({ path: '/orders', query: { success: '1' } })
  } catch (error) {
    console.error('订单创建失败:', error)
    message.value = error.message
    ElMessage.error('预订失败: ' + error.message)
  }
}





onMounted(fetchProducts)
</script>

<template>
  <section class="page-wrap">
    <el-card class="hero" shadow="never">
      <h1>商品大厅</h1>
      <p>按分类/关键词筛选商品，支持提交预订。</p>
    </el-card>

    <el-card class="card" shadow="never">
      <el-alert v-if="message" class="message" :title="message" type="info" :closable="false" />
      <el-form class="toolbar" inline @submit.prevent>
        <el-form-item>
          <el-input v-model="filters.keyword" placeholder="关键词搜索" clearable />
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.category" placeholder="全部分类" clearable>
            <el-option label="全部分类" value="" />
            <el-option label="服饰" value="服饰" />
            <el-option label="周边" value="周边" />
            <el-option label="文具" value="文具" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchProducts">查询商品</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="products" stripe v-loading="loading">
        <el-table-column prop="name" label="商品名" min-width="180" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column label="库存" width="100">
          <template #default="{ row }">{{ row.stock - row.reservedQty }}</template>
        </el-table-column>
        <el-table-column label="价格" width="120">
          <template #default="{ row }">{{ row.price }}元</template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row.id)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <div v-if="detail" class="grid">
      <el-card class="panel" shadow="never">
        <h3>商品详情</h3>
        <p>{{ detail.name }} / {{ detail.spec }}</p>
        <p>定制说明：{{ detail.customRule }}</p>
        <p>库存：{{ detail.stock - detail.reservedQty }}</p>
        <p>已售量：{{ detail.soldQty || 0 }}</p>
        <p class="api">GET /api/products/{id}</p>
      </el-card>

      <el-card class="panel" shadow="never">
        <h3>提交预订</h3>
        <el-input-number v-model="orderForm.quantity" :min="1" />
        <el-input v-model="orderForm.preference" placeholder="尺寸/颜色偏好" />
        <el-input v-model="orderForm.remark" placeholder="备注" />
        <el-button type="primary" @click="handleCreateOrder">提交预订</el-button>
      </el-card>
    </div>
  </section>
</template>

<style scoped>
.page-wrap { display: grid; gap: 14px; }
.hero { border: 2px solid #2f322e; background: #f4f0e6; }
h1 { margin: 0 0 8px; color: #2d322d; font-size: 36px; font-family: Georgia, 'Times New Roman', serif; }
.hero p { margin: 0; color: #3e413d; }
.card { border: 2px solid #2f322e; background: #f8f4ea; }
.message { margin: 0 0 10px; }
.toolbar { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.panel { border: 2px solid #2f322e; background: #f8f4ea; display: grid; gap: 10px; }
h3 { margin: 0; color: #2d322d; font-family: Georgia, 'Times New Roman', serif; }
.api { font-family: Consolas, monospace; color: #245c58; font-size: 12px; }
:deep(.hero .el-card__body) { padding: 20px; }
:deep(.card .el-card__body) { padding: 16px; }
:deep(.panel .el-card__body) { padding: 14px; }
:deep(.card .el-table),
:deep(.card .el-table__inner-wrapper),
:deep(.card .el-table tr),
:deep(.card .el-table th.el-table__cell),
:deep(.card .el-table td.el-table__cell) {
  background: #fbf7ec !important;
  color: #2d322d;
}

:deep(.card .el-table th.el-table__cell) {
  background: #efe8d8 !important;
}

:deep(.card .el-input__wrapper),
:deep(.card .el-select__wrapper),
:deep(.panel .el-input__wrapper),
:deep(.panel .el-input-number__wrapper) {
  background: #fcfbf6 !important;
}
@media (max-width: 1000px) { .grid { grid-template-columns: 1fr; } }
</style>
