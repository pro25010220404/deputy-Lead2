<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { getMyOrders, getProducts, getUserOrders } from '../../services/campusMerch'
import { Star, StarFilled } from '@element-plus/icons-vue'

const authStore = useAuthStore()

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
  { key: 'orders', label: '我的待收货', value: 0, tip: '已通过审核，等待发放' },
  { key: 'design', label: '待补交设计稿', value: 0, tip: 'booked 状态可继续上传' },
])

const userInfo = computed(() => {
  const profile = authStore.profile || {}
  return {
    name: profile.name || profile.username || '未登录',
    userId: profile.user_id || '-',
    role: profile.role === 'admin' ? '管理员' : '学生',
    email: profile.email || '-',
    avatar: profile.avatar || '',
  }
})

const loadStats = async () => {
  loading.value = true
  try {
    const [{ data: orders }, { data: products }] = await Promise.all([
      getUserOrders(),
      getProducts({ status: 'online' }),
    ])
    quickStats[1].value = orders.list?.filter(o => o.status === 'ready').length || 0
    quickStats[2].value = orders.list?.filter(o => o.status === 'booked').length || 0
    
    productsData.value = products.list || []
    ordersData.value = orders.list?.filter(o => o.status === 'ready') || []
    designData.value = orders.list?.filter(o => o.status === 'booked') || []
    
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
      favoritesData.value.forEach(item => {
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
    favoritesData.value = favoritesData.value.filter(item => item.id !== product.id)
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

const selectTab = (key) => {
  activeTab.value = key
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
        <button class="upload-btn" @click="handleUploadAvatar">更换头像</button>
      </div>
    </div>

    <div class="stats-grid">
      <div
        v-for="item in quickStats"
        :key="item.key"
        class="stat-card"
        :class="{ active: activeTab === item.key }"
        @click="selectTab(item.key)"
      >
        <p class="stat-label">{{ item.label }}</p>
        <p class="stat-value">{{ item.value }}</p>
        <p class="stat-tip">{{ item.tip }}</p>
      </div>
    </div>

    <div class="content-area">
      <el-card v-if="activeTab === 'favorites'" class="content-card">
        <h3>我的收藏</h3>
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
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.7 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/>
                  </svg>
                </span>
              </div>
              <p class="product-price">¥{{ product.price }}</p>
              <p class="product-desc">{{ product.description }}</p>
            </div>
          </div>
        </div>
      </el-card>

      <el-card v-if="activeTab === 'orders'" class="content-card">
        <h3>我的待收货</h3>
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

      <el-card v-if="activeTab === 'design'" class="content-card">
        <h3>待补交设计稿</h3>
        <div v-if="designData.length === 0" class="empty-state">
          <p>暂无待补交设计稿</p>
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
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-section {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  padding: 20px;
  background: #f8f4ea;
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

.upload-btn {
  padding: 8px 16px;
  border: none;
  background: #2a6f67;
  color: #fff;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
}

.upload-btn:hover {
  background: #1f5c54;
}

.stats-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.stat-card {
  padding: 20px;
  background: #f8f4ea;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card.active {
  border-color: #2a6f67;
  background: #f0ebe0;
}

.stat-label {
  margin: 0 0 8px;
  color: #596155;
  font-size: 14px;
}

.stat-value {
  margin: 0 0 8px;
  font-size: 32px;
  font-weight: bold;
  color: #2a6f67;
  font-family: Georgia, 'Times New Roman', serif;
}

.stat-tip {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
}

.content-area {
  min-height: 300px;
}

.content-card {
  background: #f8f4ea;
}

:deep(.content-card .el-card__body) {
  padding: 20px;
  background: #f8f4ea;
}

.content-card h3 {
  margin: 0 0 16px;
  font-size: 18px;
  color: #2d322d;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.empty-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #9ca3af;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-item {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: #f8f4ea;
  border-radius: 8px;
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
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
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
  gap: 12px;
}

.order-item,
.design-item {
  padding: 12px;
  background: #fff;
  border-radius: 8px;
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
  
  .stats-grid {
    grid-template-columns: 1fr;
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
