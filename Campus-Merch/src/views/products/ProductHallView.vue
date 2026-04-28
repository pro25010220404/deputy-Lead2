<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
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
    alert('预订失败: ' + error.message)
  }
}





onMounted(fetchProducts)
</script>

<template>
  <section class="page-wrap">
    <header class="hero">
      <h1>商品大厅</h1>
      <p>按分类/关键词筛选商品，支持提交预订。</p>
    </header>

    <article class="card">
      <p v-if="message" class="message">{{ message }}</p>
      <div class="toolbar">
        <input v-model="filters.keyword" placeholder="关键词搜索" />
        <select v-model="filters.category">
          <option value="">全部分类</option>
          <option value="服饰">服饰</option>
          <option value="周边">周边</option>
          <option value="文具">文具</option>
        </select>
        <button class="btn-primary" @click="fetchProducts">查询商品</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>商品名</th>
            <th>分类</th>
            <th>库存</th>
            <th>价格</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in products" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.category }}</td>
            <td>{{ item.stock - item.reservedQty }}</td>
            <td>{{ item.price }}元</td>
            <td><button class="btn-ghost" @click="handleViewDetail(item.id)">查看详情</button></td>
          </tr>
        </tbody>
      </table>

      <p v-if="loading" class="loading">加载中...</p>
    </article>

    <div v-if="detail" class="grid">
      <article class="panel">
        <h3>商品详情</h3>
        <p>{{ detail.name }} / {{ detail.spec }}</p>
        <p>定制说明：{{ detail.customRule }}</p>
        <p>库存：{{ detail.stock - detail.reservedQty }}</p>
        <p>已售量：{{ detail.soldQty || 0 }}</p>
        <p class="api">GET /api/products/{id}</p>
      </article>

      <article class="panel">
        <h3>提交预订</h3>
        <input v-model="orderForm.quantity" type="number" min="1" placeholder="数量" />
        <input v-model="orderForm.preference" placeholder="尺寸/颜色偏好" />
        <input v-model="orderForm.remark" placeholder="备注" />
        <button class="btn-primary" @click="handleCreateOrder">提交预订</button>
      </article>


    </div>
  </section>
</template>

<style scoped>
.page-wrap { display: grid; gap: 14px; }
.hero { background: #f4f0e6; border: 2px solid #2f322e; padding: 20px; }
h1 { margin: 0 0 8px; color: #2d322d; font-size: 36px; font-family: Georgia, 'Times New Roman', serif; }
.hero p { margin: 0; color: #3e413d; }
.card { background: #f8f4ea; border: 2px solid #2f322e; padding: 16px; }
.message { color: #245c58; margin: 0 0 10px; }
.toolbar { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
input, select { border: 1px solid #2f322e; padding: 8px; background: #fcfbf6; color: #30342f; }
table { width: 100%; border-collapse: collapse; background: #fbf7ec; border: 2px solid #2f322e; }
th, td { padding: 10px; border-bottom: 1px solid #9f9a8d; text-align: left; }
th { color: #2d322d; background: #efe8d8; }
.import-btn { position: relative; overflow: hidden; border: 1px solid #2f322e; padding: 8px; background: #f3ebda; cursor: pointer; color: #2f322e; }
.import-btn input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.panel { border: 2px solid #2f322e; background: #f8f4ea; padding: 14px; display: grid; gap: 8px; }
h3 { margin: 0; color: #2d322d; font-family: Georgia, 'Times New Roman', serif; }
.loading { color: #4f5e5a; margin-top: 10px; }
.api { font-family: Consolas, monospace; color: #245c58; font-size: 12px; }
.btn-primary { border: 1px solid #2f322e; background: #245c58; color: #fff; padding: 8px 12px; cursor: pointer; }
.btn-ghost { border: 1px solid #2f322e; background: #f4ede0; color: #2f322e; padding: 6px 10px; cursor: pointer; }
@media (max-width: 1000px) { .grid { grid-template-columns: 1fr; } }
</style>
