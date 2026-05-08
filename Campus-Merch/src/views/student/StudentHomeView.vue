<script setup>
import { ref, computed, onMounted, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '../../stores/auth'
import { getMyOrders, getProducts } from '../../services/campusMerch'

const authStore = useAuthStore()
const router = useRouter()

const avatarInput = ref(null)
const activeTab = ref('favorites')
const loading = ref(false)
const productsData = ref([])
const ordersData = ref([])
const designData = ref([])
const favoritesData = ref([])
const showToast = ref(false)
const toastMessage = ref('')

const favoriteMap = ref(new Map())

const quickStats = reactive([
  { key: 'favorites', label: '我的收藏', value: 0, tip: '查看已收藏的商品' },
  { key: 'orders', label: '待收货', value: 0, tip: '已通过审核，等待发放' },
  { key: 'design', label: '待上传', value: 0, tip: 'booked 状态可继续上传设计稿' },
])

/** 中间文字页眉 */
const mainNavTabs = [
  { key: 'favorites', label: '我的收藏', tip: '查看已收藏的商品' },
  { key: 'orders', label: '待收货', tip: '已通过审核，等待发放' },
  { key: 'design', label: '待上传', tip: 'booked 状态可继续上传' },
  { key: 'settings', label: '设置', tip: '账号、头像与安全' },
]

const userInfo = computed(() => {
  const profile = authStore.profile || {}
  return {
    name: profile.name || profile.username || '未登录',
    userId: profile.userId ?? profile.user_id ?? '-',
    role: profile.role === 'admin' ? '管理员' : '学生',
    email: profile.email || '-',
    avatar: profile.avatar || '',
  }
})

const loadStats = async () => {
  loading.value = true
  try {
    const [{ data: orders }, { data: products }] = await Promise.all([
      getMyOrders(),
      getProducts({ status: 'online' }),
    ])
    quickStats[1].value = orders.list?.filter((o) => o.status === 'ready').length || 0
    quickStats[2].value = orders.list?.filter((o) => o.status === 'booked').length || 0

    productsData.value = products.list || []
    ordersData.value = orders.list?.filter((o) => o.status === 'ready') || []
    designData.value = orders.list?.filter((o) => o.status === 'booked') || []

    loadFavorites()
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const loadFavorites = () => {
  const stored = localStorage.getItem('campus_merch_favorites')
  if (stored) {
    try {
      favoritesData.value = JSON.parse(stored)
      favoritesData.value.forEach((item) => {
        favoriteMap.value.set(item.id, true)
      })
    } catch (e) {
      console.error('解析收藏数据失败:', e)
    }
  }
  quickStats[0].value = favoritesData.value.length
}

const saveFavorites = () => {
  localStorage.setItem('campus_merch_favorites', JSON.stringify(favoritesData.value))
}

const toggleFavorite = (product) => {
  const isFavorite = favoriteMap.value.has(product.id)

  if (isFavorite) {
    favoriteMap.value.delete(product.id)
    favoritesData.value = favoritesData.value.filter((item) => item.id !== product.id)
    toastMessage.value = '已取消收藏'
  } else {
    favoriteMap.value.set(product.id, true)
    favoritesData.value.push(product)
    toastMessage.value = '已收藏'
  }

  quickStats[0].value = favoritesData.value.length
  saveFavorites()
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

const isFavorite = (productId) => {
  return favoriteMap.value.has(productId)
}

onMounted(loadStats)

const handleUploadAvatar = () => {
  avatarInput.value?.click()
}

const onAvatarChange = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    if (authStore.profile) {
      authStore.profile.avatar = e.target.result
      localStorage.setItem('campus_merch_profile', JSON.stringify(authStore.profile))
    }
  }
  reader.readAsDataURL(file)
}

const contentAnchor = ref(null)

const selectTab = (key) => {
  activeTab.value = key
  nextTick(() => {
    contentAnchor.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

const contentTitle = computed(() => {
  const titles = {
    favorites: '我的收藏',
    orders: '待收货',
    design: '待上传',
    settings: '设置',
  }
  return titles[activeTab.value] || '内容'
})

function goChangePassword() {
  router.push({ name: 'register' })
  ElMessage.info('请在注册页通过邮箱验证码完成密码重置')
}

async function onLogoutAccount() {
  try {
    await ElMessageBox.confirm('确定退出当前账号并返回登录页？', '注销登录', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  await authStore.logout()
  await router.push({ name: 'login' })
  ElMessage.success('已退出登录')
}
</script>

<template>
  <section class="student-page">
    <div class="profile-section">
      <div class="avatar-wrapper">
        <div class="avatar">
          <img v-if="userInfo.avatar" :src="userInfo.avatar" :alt="userInfo.name" />
          <div v-else class="avatar-placeholder">{{ userInfo.name.charAt(0) }}</div>
        </div>
        <input type="file" ref="avatarInput" accept="image/*" hidden @change="onAvatarChange" />
      </div>
      <div class="profile-info">
        <h1>{{ userInfo.name }}</h1>
        <p class="role">{{ userInfo.role }}</p>
      </div>
    </div>

    <div class="middle-panel">
      <div class="nav-sticky-shell">
        <nav class="text-tabs" aria-label="个人中心功能">
          <button
            v-for="t in mainNavTabs"
            :key="t.key"
            type="button"
            class="text-tab"
            :class="{ 'text-tab--active': activeTab === t.key }"
            :title="t.tip"
            @click="selectTab(t.key)"
          >
            {{ t.label }}
          </button>
        </nav>
        <div class="text-tab-rule" />
      </div>
    </div>

    <div ref="contentAnchor" class="content-sheet">
      <header class="content-sheet-head">
        <h2 class="content-sheet-title">{{ contentTitle }}</h2>
      </header>

      <div class="content-sheet-body">
        <el-card v-if="activeTab === 'favorites'" class="content-card" shadow="never">
        <div v-if="favoritesData.length === 0" class="empty-state">
          <p>暂无收藏商品</p>
          <p class="empty-hint">点击商品旁的爱心图标可添加收藏</p>
        </div>
        <div v-else class="products-list">
          <div v-for="product in favoritesData" :key="product.id" class="product-item">
            <img v-if="product.image" :src="product.image" :alt="product.name" class="product-image" />
            <div class="product-info">
              <div class="product-header">
                <h4>{{ product.name }}</h4>
                <span
                  class="favorite-icon"
                  :class="{ active: isFavorite(product.id) }"
                  @click="toggleFavorite(product)"
                >
                  <svg v-if="isFavorite(product.id)" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path
                      d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.7 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"
                    />
                  </svg>
                </span>
              </div>
              <p class="product-price">¥{{ product.price }}</p>
              <p class="product-desc">{{ product.description }}</p>
            </div>
          </div>
        </div>
        </el-card>

        <el-card v-if="activeTab === 'orders'" class="content-card" shadow="never">
        <div v-if="ordersData.length === 0" class="empty-state">
          <p>暂无待收货订单</p>
        </div>
        <div v-else class="orders-list">
          <div v-for="order in ordersData" :key="order.id" class="order-item">
            <div class="order-info">
              <p class="order-id">订单号: {{ order.order_no }}</p>
              <p class="order-product">{{ order.product_name }}</p>
              <p class="order-status">{{ order.status }}</p>
            </div>
          </div>
        </div>
        </el-card>

        <el-card v-if="activeTab === 'design'" class="content-card" shadow="never">
        <div v-if="designData.length === 0" class="empty-state">
          <p>暂无待上传设计稿</p>
        </div>
        <div v-else class="design-list">
          <div v-for="order in designData" :key="order.id" class="design-item">
            <div class="design-info">
              <p class="design-id">订单号: {{ order.order_no }}</p>
              <p class="design-product">{{ order.product_name }}</p>
              <p class="design-qty">数量: {{ order.quantity }}</p>
            </div>
          </div>
        </div>
        </el-card>

        <el-card v-if="activeTab === 'settings'" class="content-card" shadow="never">
        <div class="settings-body">
          <p class="settings-line"><span class="settings-k">邮箱</span>{{ userInfo.email }}</p>
          <p class="settings-line"><span class="settings-k">身份</span>{{ userInfo.role }}</p>
          <p class="settings-line"><span class="settings-k">用户 ID</span>{{ userInfo.userId }}</p>
          <button type="button" class="settings-row-btn" @click="handleUploadAvatar">更换头像</button>
          <button type="button" class="settings-row-btn settings-row-btn--ghost" @click="goChangePassword">
            修改密码
          </button>
          <button type="button" class="settings-row-btn settings-row-btn--danger" @click="onLogoutAccount">
            注销账号
          </button>
        </div>
        </el-card>
      </div>
    </div>

    <Transition name="toast">
      <div v-if="showToast" class="toast">
        {{ toastMessage }}
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.student-page {
  --student-page-bg: #eaeae4;
  --student-rule: rgba(45, 50, 45, 0.12);
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
  background: var(--student-page-bg);
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    'PingFang SC',
    'Microsoft YaHei',
    sans-serif;
}

.profile-section {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  padding: 20px;
  background: var(--student-page-bg);
}

.avatar-wrapper {
  position: relative;
}

.avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  overflow: hidden;
  background: #2a6f67;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 60px;
  color: #fff;
  font-weight: bold;
}

.profile-info {
  flex: 1;
}

.profile-info h1 {
  margin: 0;
  font-size: 32px;
  color: #2d322d;
  font-family: Georgia, 'Times New Roman', serif;
}

.role {
  margin: 6px 0 12px;
  color: #596155;
  font-size: 16px;
}

.middle-panel {
  padding: 4px 0 12px;
  background: var(--student-page-bg);
}

.nav-sticky-shell {
  position: sticky;
  top: 0;
  z-index: 20;
  margin: 0 -6px;
  padding: 6px 8px 12px;
  border-radius: 0 0 14px 14px;
  background: var(--student-page-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 6px 20px rgba(42, 111, 103, 0.05);
}

.text-tabs {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding: 2px 0 0;
}

.text-tab {
  border: none;
  background: none;
  padding: 0 0 12px;
  font-size: 0.95rem;
  color: #9ca3af;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  font: inherit;
}

.text-tab:hover {
  color: #6b7280;
}

.text-tab--active {
  color: #111827;
  font-weight: 700;
}

.text-tab--active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  border-radius: 999px;
  background: #ff6b35;
}

.text-tab-rule {
  height: 1px;
  background: #e5e7eb;
  margin: 10px 0 4px;
}

.settings-body {
  padding: 0;
}

.settings-line {
  margin: 0;
  padding: 14px 4px;
  font-size: 0.9rem;
  color: #374151;
  display: flex;
  gap: 12px;
  border-bottom: 1px solid var(--student-rule);
}

.settings-line:last-of-type {
  border-bottom: none;
}

.settings-body > .settings-row-btn:first-of-type {
  border-top: 1px solid var(--student-rule);
}

.settings-k {
  color: #9ca3af;
  min-width: 4.5em;
}

.settings-row-btn {
  display: block;
  width: 100%;
  margin: 0;
  padding: 14px 4px;
  border: none;
  border-bottom: 1px solid var(--student-rule);
  background: var(--student-page-bg);
  color: #2a6f67;
  font-size: 0.95rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  font: inherit;
}

.settings-row-btn:hover {
  color: #1f5c54;
  background: rgba(42, 111, 103, 0.06);
}

.settings-row-btn--ghost {
  color: #374151;
  font-weight: 500;
}

.settings-row-btn--ghost:hover {
  color: #111827;
}

.settings-row-btn--danger {
  border-bottom: none;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--student-rule);
  color: #b91c1c;
  font-weight: 600;
}

.settings-row-btn--danger:hover {
  color: #991b1b;
  background: rgba(185, 28, 28, 0.06);
}

.content-sheet {
  margin-top: 4px;
  padding: 0 0 40px;
  border-radius: 18px 18px 0 0;
  background: var(--student-page-bg);
  border: 1px solid rgba(45, 50, 45, 0.08);
  border-bottom: none;
  box-shadow: 0 -4px 20px rgba(15, 23, 42, 0.04);
  scroll-margin-top: 120px;
  flex: 1;
  min-height: 280px;
}

.content-sheet-head {
  padding: 20px 20px 14px;
  border-bottom: 1px solid var(--student-rule);
  background: var(--student-page-bg);
}

.content-sheet-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: 0.02em;
}

.content-sheet-body {
  padding: 0 12px 8px;
  background: var(--student-page-bg);
}

:deep(.content-card.el-card) {
  background: var(--student-page-bg) !important;
  border: none !important;
  box-shadow: none !important;
}

:deep(.content-card .el-card__body) {
  padding: 12px 8px 20px;
  background: var(--student-page-bg) !important;
}

.empty-state {
  text-align: center;
  padding: 36px 16px;
  color: #6b7280;
  background: var(--student-page-bg);
}

.empty-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #9ca3af;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.product-item {
  display: flex;
  gap: 16px;
  padding: 16px 8px;
  background: var(--student-page-bg);
  border-radius: 0;
  border-bottom: 1px solid var(--student-rule);
}

.product-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.product-info {
  flex: 1;
}

.product-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.product-header h4 {
  margin: 0 0 8px;
  font-size: 16px;
  color: #2d322d;
  flex: 1;
}

.favorite-icon {
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.2s ease;
  color: #9ca3af;
}

.favorite-icon:hover {
  transform: scale(1.2);
}

.favorite-icon.active {
  animation: pulse 0.3s ease;
  color: #f59e0b;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

.product-price {
  margin: 0 0 8px;
  font-size: 14px;
  color: #2a6f67;
  font-weight: bold;
}

.product-desc {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.orders-list,
.design-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.order-item,
.design-item {
  padding: 16px 8px;
  background: var(--student-page-bg);
  border-radius: 0;
  border-bottom: 1px solid var(--student-rule);
}

.order-item:last-child,
.design-item:last-child {
  border-bottom: none;
}

.order-id,
.design-id {
  margin: 0 0 8px;
  font-size: 14px;
  color: #2d322d;
}

.order-product,
.design-product {
  margin: 0 0 8px;
  font-size: 13px;
  color: #596155;
}

.order-status {
  margin: 0;
  font-size: 12px;
  color: #2a6f67;
}

.design-qty {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #2a6f67;
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@media (max-width: 980px) {
  .profile-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .text-tabs {
    gap: 12px;
    justify-content: center;
  }

  .product-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .product-header {
    flex-direction: column;
    align-items: center;
  }
}
</style>
