<script setup>
import { onMounted, reactive, ref } from 'vue'
import {
  downloadProductImportTemplate,
  getProducts,
  importProductsByExcel,
  updateProduct,
} from '../../services/campusMerch'

const loading = ref(false)
const message = ref('')
const products = ref([])
const selected = ref(null)
const importing = ref(false)
const uploadProgress = ref(0)
const importResult = ref(null)
let keywordTimer = null

const filters = reactive({
  keyword: '',
  category: '',
  status: '',
})

const editForm = reactive({
  stock: 0,
  price: 0,
  category: '',
  status: 'online',
})

const loadProducts = async () => {
  loading.value = true
  try {
    const { data } = await getProducts(filters)
    products.value = data.list
  } catch (error) {
    message.value = error.message
  } finally {
    loading.value = false
  }
}

const handleKeywordInput = () => {
  if (keywordTimer) clearTimeout(keywordTimer)
  keywordTimer = setTimeout(() => {
    loadProducts()
  }, 250)
}

const selectProduct = (item) => {
  selected.value = item
  editForm.stock = item.stock
  editForm.price = item.price
  editForm.category = item.category
  editForm.status = item.status
}

const saveProduct = async () => {
  if (!selected.value) {
    message.value = '请先在列表中选择一个商品再维护'
    return
  }
  try {
    await updateProduct(selected.value.id, {
      stock: Number(editForm.stock),
      price: Number(editForm.price),
      category: editForm.category,
      status: editForm.status,
    })
    message.value = '商品维护成功'
    await loadProducts()
  } catch (error) {
    message.value = error.message
  }
}

const downloadTemplate = () => {
  downloadProductImportTemplate()
    .then(({ data }) => {
      const link = document.createElement('a')
      const url = URL.createObjectURL(data.blob)
      link.href = url
      link.download = data.filename || 'products_import_template.xlsx'
      link.click()
      URL.revokeObjectURL(url)
    })
    .catch((error) => {
      message.value = error.message
    })
}

const handleImport = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  const lowerName = file.name.toLowerCase()
  if (!lowerName.endsWith('.xlsx') && !lowerName.endsWith('.xls')) {
    message.value = '仅支持 .xlsx / .xls 文件'
    event.target.value = ''
    return
  }

  importing.value = true
  uploadProgress.value = 0
  try {
    const { data } = await importProductsByExcel(file, (progress) => {
      uploadProgress.value = progress
    })
    importResult.value = data
    uploadProgress.value = 100
    message.value = `导入完成：成功 ${data.success} 行，失败 ${data.failed.length} 行`
    await loadProducts()
  } catch (error) {
    message.value = error.message
  } finally {
    importing.value = false
    event.target.value = ''
  }
}

const copyFailedRows = async () => {
  if (!importResult.value?.failed?.length) return
  const text = importResult.value.failed
    .map((item) => `第${item.row}行 | ${item.field} | ${item.reason}`)
    .join('\n')
  try {
    await navigator.clipboard.writeText(text)
    message.value = '失败明细已复制'
  } catch (error) {
    message.value = '复制失败，请手动复制'
  }
}

const exportFailedRows = () => {
  if (!importResult.value?.failed?.length) return
  const header = 'row,field,reason\n'
  const body = importResult.value.failed
    .map((item) => `${item.row},${item.field},"${String(item.reason).replace(/"/g, '""')}"`)
    .join('\n')
  const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.href = url
  link.download = `import_failed_rows_${Date.now()}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

onMounted(loadProducts)
</script>

<template>
  <section class="page-wrap">
    <header class="hero">
      <h1>商品维护与批量上架</h1>
      <p>管理员可维护商品基础信息，并通过 Excel 批量导入新增商品。</p>
    </header>

    <article class="card">
      <p v-if="message" class="message">{{ message }}</p>
      <div class="toolbar">
        <input
          v-model="filters.keyword"
          placeholder="关键词（名称/分类）"
          @input="handleKeywordInput"
          @keyup.enter="loadProducts"
        />
        <select v-model="filters.category" @change="loadProducts">
          <option value="">全部分类</option>
          <option value="服饰">服饰</option>
          <option value="周边">周边</option>
          <option value="文具">文具</option>
        </select>
        <select v-model="filters.status" @change="loadProducts">
          <option value="">全部状态</option>
          <option value="online">online</option>
          <option value="offline">offline</option>
        </select>
        <button class="btn-primary" @click="loadProducts">查询</button>
      </div>

      <div class="toolbar">
        <button class="btn-ghost" @click="downloadTemplate">下载导入模板</button>
        <label class="import-btn">
          {{ importing ? '导入中...' : 'Excel 批量导入' }}
          <input type="file" accept=".xlsx,.xls" :disabled="importing" @change="handleImport" />
        </label>
      </div>
      <div v-if="importing" class="progress-wrap">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: `${uploadProgress}%` }"></div>
        </div>
        <p class="progress-text">上传进度：{{ uploadProgress }}%</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>商品</th>
            <th>分类</th>
            <th>价格</th>
            <th>可用库存</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in products" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.category }}</td>
            <td>¥{{ item.price }}</td>
            <td>{{ item.stock - item.reservedQty }}</td>
            <td>{{ item.status }}</td>
            <td><button class="btn-ghost" @click="selectProduct(item)">维护</button></td>
          </tr>
        </tbody>
      </table>
      <p v-if="loading" class="loading">加载中...</p>
    </article>

    <article v-if="selected" class="card">
      <h3>维护：{{ selected.name }}</h3>
      <div class="form-grid">
        <label>库存<input v-model="editForm.stock" type="number" min="0" /></label>
        <label>价格<input v-model="editForm.price" type="number" min="1" /></label>
        <label>分类<input v-model="editForm.category" /></label>
        <label>
          状态
          <select v-model="editForm.status">
            <option value="online">online</option>
            <option value="offline">offline</option>
          </select>
        </label>
      </div>
      <button class="btn-primary" :disabled="!selected" @click="saveProduct">保存</button>
    </article>

    <article v-if="importResult" class="card">
      <h3>导入结果</h3>
      <p>成功行数：{{ importResult.success }}</p>
      <p v-if="!importResult.failed.length">失败行：0</p>
      <template v-else>
        <div class="toolbar">
          <button class="btn-ghost" @click="copyFailedRows">复制失败明细</button>
          <button class="btn-ghost" @click="exportFailedRows">导出失败明细</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>行号</th>
              <th>字段</th>
              <th>失败原因</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in importResult.failed" :key="`${item.row}-${item.field}`">
              <td>{{ item.row }}</td>
              <td>{{ item.field }}</td>
              <td>{{ item.reason }}</td>
            </tr>
          </tbody>
        </table>
      </template>
    </article>
  </section>
</template>

<style scoped>
.page-wrap { display: grid; gap: 14px; }
.hero { background: #f4f0e6; border: 2px solid #2f322e; padding: 20px; }
h1 { margin: 0 0 8px; color: #2d322d; font-size: 34px; font-family: Georgia, 'Times New Roman', serif; }
.hero p { margin: 0; color: #3e413d; }
.card { background: #f8f4ea; border: 2px solid #2f322e; padding: 16px; }
.toolbar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
input, select { border: 1px solid #2f322e; padding: 8px; background: #fcfbf6; color: #30342f; }
table { width: 100%; border-collapse: collapse; background: #fbf7ec; border: 2px solid #2f322e; }
th, td { padding: 10px; border-bottom: 1px solid #9f9a8d; text-align: left; }
th { color: #2d322d; background: #efe8d8; }
.btn-primary { border: 1px solid #2f322e; background: #245c58; color: #fff; padding: 8px 12px; cursor: pointer; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-ghost { border: 1px solid #2f322e; background: #f4ede0; color: #2f322e; padding: 8px 12px; cursor: pointer; }
.import-btn { position: relative; overflow: hidden; border: 1px solid #2f322e; padding: 8px 12px; background: #efe8d8; cursor: pointer; }
.import-btn input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.message { color: #245c58; margin: 0 0 10px; }
.loading { color: #4f5e5a; margin-top: 8px; }
.progress-wrap { margin: 2px 0 12px; }
.progress-track { width: 100%; height: 12px; border: 1px solid #2f322e; background: #f2ede1; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #2f8a7f 0%, #245c58 100%); transition: width 0.2s ease; }
.progress-text { margin: 6px 0 0; color: #46514b; font-size: 12px; }
h3 { margin: 0 0 10px; color: #2d322d; font-family: Georgia, 'Times New Roman', serif; }
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 10px; }
label { display: grid; gap: 6px; color: #2f322e; }
@media (max-width: 980px) { .form-grid { grid-template-columns: 1fr; } }
</style>
