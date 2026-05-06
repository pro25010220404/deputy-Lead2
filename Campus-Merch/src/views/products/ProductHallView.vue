<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  createOrder,
  getProductDetail,
  getProducts,
} from '../../services/campusMerch'

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
    if (!selectedProductId.value) {
      if (products.value.length > 0) {
        await handleViewDetail(products.value[0].id)
      } else {
        detail.value = null
      }
      return
    }
    const stillExists = products.value.some(
      (item) => String(item.id) === String(selectedProductId.value)
    )
    if (stillExists) {
      await handleViewDetail(selectedProductId.value)
    } else {
      selectedProductId.value = ''
      detail.value = null
      orderForm.productId = ''
    }
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
  if (!detail.value) {
    ElMessage.warning('请先选择商品')
    return
  }
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

const getRowClassName = ({ row }) =>
  String(row.id) === String(selectedProductId.value) ? 'is-selected-product' : ''





onMounted(fetchProducts)
</script>

<template>
  <section class="page-wrap">
    <el-card class="hero" shadow="never">
      <h1>商品大厅</h1>
      <p>按分类/关键词筛选商品，支持提交预订。</p>
    </el-card>
    <el-alert v-if="message" class="message" :title="message" type="info" :closable="false" />

    <div class="content-grid">
      <el-card class="card" shadow="never">
        <el-form class="toolbar" inline @submit.prevent>
          <el-form-item label="关键词：">
            <el-input v-model="filters.keyword" placeholder="输入关键词搜索" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="分类：">
            <el-select v-model="filters.category" placeholder="请选择分类" clearable style="width: 150px">
              <el-option label="服饰" value="服饰" />
              <el-option label="周边" value="周边" />
              <el-option label="文具" value="文具" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchProducts">查询商品</el-button>
          </el-form-item>
        </el-form>

        <el-table
          :data="products"
          stripe
          v-loading="loading"
          :row-class-name="getRowClassName"
          @row-click="(row) => handleViewDetail(row.id)"
        >
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
              <el-button link type="primary" @click.stop="handleViewDetail(row.id)">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card class="panel detail-panel" shadow="never">
        <h3>商品详情</h3>
        <div v-if="detail" class="detail-content">
          <div class="product-image">
            <img v-if="detail.coverUrl" :src="detail.coverUrl" :alt="detail.name" />
            <div v-else class="no-image">暂无图片</div>
          </div>
          <div class="detail-info">
            <p>{{ detail.name }} / {{ detail.spec }}</p>
            <p>定制说明：{{ detail.customRule }}</p>
            <p>库存：{{ detail.stock - detail.reservedQty }}</p>
            <p>已售量：{{ detail.soldQty || 0 }}</p>
            <p class="api">GET /api/products/{id}</p>
          </div>
        </div>
        <p v-else class="empty-tip">请先在左侧商品列表中选择一个商品</p>

        <div class="booking-block">
          <h3>提交预订</h3>
          <el-input-number v-model="orderForm.quantity" :min="1" :disabled="!detail" />
          <el-input v-model="orderForm.preference" placeholder="尺寸/颜色偏好" :disabled="!detail" />
          <el-input v-model="orderForm.remark" placeholder="备注" :disabled="!detail" />
          <el-button type="primary" :disabled="!detail" @click="handleCreateOrder">提交预订</el-button>
        </div>
      </el-card>
    </div>
  </section>
</template>

<style scoped>
.page-wrap { display: grid; gap: 14px; }
.hero { border: 2px solid #2f322e; background: #f4f0e6; }
h1 { margin: 0 0 8px; color: #2d322d; font-size: 36px; font-family: Georgia, 'Times New Roman', serif; }
.hero p { margin: 0; color: #3e413d; }
.content-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 10px; align-items: stretch; }
.card { border: 2px solid #2f322e; background: #f8f4ea; }
.message { margin: 0; }
.toolbar { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
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

.detail-panel :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content-grid > .card,
.content-grid > .panel {
  height: 100%;
}

.detail-content {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 14px;
  align-items: start;
}

.detail-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-image {
  width: 100%;
  height: 260px;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #efe8d8;
  border-radius: 4px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  color: #7f7b71;
  font-size: 14px;
}

.empty-tip {
  margin: 0;
  color: #596155;
}

.booking-block {
  display: grid;
  gap: 10px;
  padding-top: 4px;
}

:deep(.card .el-table .is-selected-product td.el-table__cell) {
  background: #efe8d8 !important;
}

@media (max-width: 1000px) { 
  .content-grid { grid-template-columns: 1fr; }
  .detail-content {
    grid-template-columns: 1fr;
  }
  .product-image {
    width: 100%;
    height: 200px;
  }
}
</style>
