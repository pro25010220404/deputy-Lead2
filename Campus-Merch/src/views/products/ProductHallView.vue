<script setup>
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  createOrder,
  getProductDetail,
  getProducts,
} from '../../services/campusMerch'
import carousel1 from '../../assets/CarouselScreen1.jpg'
import carousel2 from '../../assets/CarouselScreen2.jpg'
import carousel3 from '../../assets/CarouselScreen3.jpg'
import carousel4 from '../../assets/CarouselScreen4.jpg'

const router = useRouter()

const heroSlides = [carousel1, carousel2, carousel3, carousel4]

const catalogRef = ref(null)
const HEADER_RESERVE_PX = 88
const heroCarouselHeight = ref('560px')

const updateHeroHeight = () => {
  heroCarouselHeight.value = `${Math.max(400, window.innerHeight - HEADER_RESERVE_PX)}px`
}

const scrollToCatalog = () => {
  catalogRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const loading = ref(false)
const products = ref([])
const message = ref('')
const detail = ref(null)
const selectedProductId = ref('')

const filters = reactive({
  keyword: '',
  category: '',
  /** 不传 status，避免后端对 status=0 语义与前端不一致时返回空列表；需筛上架态可改为 'online' */
  status: '',
})

const orderForm = reactive({
  productId: '',
  quantity: 1,
  preference: '',
  remark: '',
})

const detailVisible = ref(false)
const detailLoading = ref(false)

const fetchProducts = async () => {
  loading.value = true
  try {
    const { data } = await getProducts(filters)
    products.value = Array.isArray(data?.list) ? data.list : []
    if (detailVisible.value && selectedProductId.value) {
      const stillExists = products.value.some(
        (item) => String(item.id) === String(selectedProductId.value)
      )
      if (stillExists) {
        await handleViewDetail(selectedProductId.value)
      } else {
        detailVisible.value = false
        selectedProductId.value = ''
        detail.value = null
        orderForm.productId = ''
      }
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
    await createOrder(orderForm)
    detailVisible.value = false
    router.push({ path: '/orders', query: { success: '1' } })
  } catch (error) {
    console.error('订单创建失败:', error)
    message.value = error.message
    ElMessage.error('预订失败: ' + error.message) 
  }
}

const openProduct = async (id) => {
  orderForm.quantity = 1
  orderForm.preference = ''
  orderForm.remark = ''
  detailVisible.value = true
  detailLoading.value = true
  detail.value = null
  try {
    await handleViewDetail(id)
  } catch (error) {
    message.value = error.message
    detailVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

const formatPrice = (n) => {
  const v = Number(n)
  return Number.isFinite(v) ? v.toFixed(2) : String(n ?? '')
}





onMounted(() => {
  updateHeroHeight()
  window.addEventListener('resize', updateHeroHeight, { passive: true })
  fetchProducts()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateHeroHeight)
})
</script>

<template>
  <div class="product-hall">
    <section class="hero-screen" aria-label="首屏轮播">
      <el-carousel
        class="hero-carousel"
        :height="heroCarouselHeight"
        :interval="5200"
        arrow="hover"
        :motion-blur="false"
      >
        <el-carousel-item v-for="(src, index) in heroSlides" :key="index">
          <div class="hero-slide">
            <div class="hero-slide-shroud">
              <div class="hero-slide-frame">
                <img
                  :src="src"
                  :alt="`CampusMerch 轮播图 ${index + 1}`"
                  :fetchpriority="index === 0 ? 'high' : 'low'"
                  :loading="index === 0 ? 'eager' : 'lazy'"
                  decoding="async"
                  draggable="false"
                />
                <!-- 平滑罩层：中性黑半透明，无波点/纹理，不改变画面色相 -->
                <div class="hero-slide-veil" aria-hidden="true" />
              </div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
      <div class="hero-brand">
        <p class="hero-brand-tagline">To light up campus and bring joy</p>
        <h2 class="hero-brand-title">CampusMerch</h2>
      </div>
      <button type="button" class="scroll-down" @click="scrollToCatalog">
        <span>下滑浏览商品</span>
      </button>
    </section>

    <section id="product-catalog" ref="catalogRef" class="catalog">
      <div class="catalog-inner">
        <section id="about-us" class="about-us" aria-labelledby="about-us-heading">
          <h2 id="about-us-heading" class="about-us-en">About us</h2>
          <p class="about-us-zh">关于我们</p>
          <p class="about-us-body">
            CampusMerch 面向高校师生与社团组织，提供校园文创与周边商品的展示、筛选与在线预订服务。我们围绕商品策展、库存与预订协同、订单履约与售后沟通等环节，搭建覆盖「浏览—下单—跟进」的简单闭环，让活动物资与日常好物更容易触达校园场景。团队持续倾听使用反馈，希望用清晰透明的流程与可靠的服务，传递归属感与校园温度。
          </p>
        </section>

        <header class="catalog-intro">
          <h1>商品大厅</h1>
          <p>按分类/关键词筛选商品，支持提交预订。</p>
        </header>
        <el-alert v-if="message" class="message" :title="message" type="info" :closable="false" />

        <div class="hall-body">
          <div class="hall-toolbar">
            <el-form class="toolbar-form" inline @submit.prevent>
              <el-form-item label="关键词">
                <el-input v-model="filters.keyword" placeholder="搜索商品" clearable class="toolbar-input" />
              </el-form-item>
              <el-form-item label="分类">
                <el-select v-model="filters.category" placeholder="全部分类" clearable class="toolbar-select">
                  <el-option label="服饰" value="服饰" />
                  <el-option label="周边" value="周边" />
                  <el-option label="文具" value="文具" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" round @click="fetchProducts">查询</el-button>
              </el-form-item>
            </el-form>
          </div>

          <div v-loading="loading" class="product-grid-wrap">
            <p v-if="!loading && products.length === 0" class="empty-grid">暂无符合条件的商品</p>
            <div v-else class="product-grid" role="list">
              <button
                v-for="item in products"
                :key="item.id"
                type="button"
                class="product-card"
                role="listitem"
                @click="openProduct(item.id)"
              >
                <div class="product-card-media">
                  <img v-if="item.coverUrl" :src="item.coverUrl" :alt="item.name" loading="lazy" />
                  <div v-else class="product-card-placeholder">暂无图片</div>
                </div>
                <p class="product-card-name">{{ item.name }}</p>
                <p class="product-card-meta">{{ item.category }}</p>
                <p class="product-card-price">
                  <span class="product-card-currency">¥</span>{{ formatPrice(item.price) }}
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <el-dialog
      v-model="detailVisible"
      :title="detail?.name || '商品详情'"
      width="min(720px, 94vw)"
      class="product-detail-dialog"
      align-center
      destroy-on-close
    >
      <div v-loading="detailLoading" class="dialog-body">
        <template v-if="detail">
          <div class="detail-content dialog-detail">
            <div class="product-image dialog-product-image">
              <img v-if="detail.coverUrl" :src="detail.coverUrl" :alt="detail.name" />
              <div v-else class="no-image">暂无图片</div>
            </div>
            <div class="detail-info">
              <p class="detail-line"><span class="detail-k">规格</span>{{ detail.spec }}</p>
              <p class="detail-line"><span class="detail-k">定制</span>{{ detail.customRule }}</p>
              <p class="detail-line"><span class="detail-k">库存</span>{{ detail.stock - detail.reservedQty }}</p>
              <p class="detail-line"><span class="detail-k">已售</span>{{ detail.soldQty || 0 }}</p>
              <p class="api">GET /api/products/{id}</p>
            </div>
          </div>

          <div class="booking-block dialog-booking">
            <h3 class="dialog-booking-title">提交预订</h3>
            <div class="dialog-booking-row">
              <span class="detail-k">数量</span>
              <el-input-number v-model="orderForm.quantity" :min="1" />
            </div>
            <el-input v-model="orderForm.preference" placeholder="尺寸 / 颜色偏好" />
            <el-input v-model="orderForm.remark" placeholder="备注（选填）" />
            <el-button type="primary" size="large" round class="dialog-submit" @click="handleCreateOrder">
              提交预订
            </el-button>
          </div>
        </template>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.product-hall {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background: #e9e6dc;
}

.hero-screen {
  position: relative;
  width: 100%;
  flex-shrink: 0;
  background: #1a1c1a;
}

.hero-carousel {
  width: 100%;
}

.hero-carousel :deep(.el-carousel__container) {
  height: 100%;
}

.hero-carousel :deep(.el-carousel__item) {
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  /* 减轻 transform 子像素带来的发糊 */
  outline: 1px solid transparent;
}

.hero-carousel :deep(.el-carousel__arrow) {
  background: rgba(0, 0, 0, 0.35);
  color: #f2efe5;
}

.hero-carousel :deep(.el-carousel__indicators) {
  bottom: 56px;
}

.hero-carousel :deep(.el-carousel__indicator .el-carousel__button) {
  background: rgba(255, 255, 255, 0.45);
}

.hero-carousel :deep(.el-carousel__indicator.is-active .el-carousel__button) {
  background: #f2efe5;
}

.hero-slide {
  width: 100%;
  height: 100%;
  overflow: hidden;
  isolation: isolate;
}

/* 适配罩子：固定铺满区域，避免图片被多层级 transform 拉伸发糊 */
.hero-slide-shroud {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0c0d0c;
  transform: translateZ(0);
}

.hero-slide-frame {
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-slide-frame img {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  object-fit: cover;
  object-position: center;
  display: block;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transform: translateZ(0);
  image-rendering: auto;
  user-select: none;
  pointer-events: none;
}

.hero-slide-veil {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  /* 加深压暗；色相向页眉 #245c58 略偏一点（同系深青绿），无纹理 */
  background: linear-gradient(
    180deg,
    rgba(12, 48, 44, 0.58) 0%,
    rgba(22, 72, 68, 0.26) 40%,
    rgba(22, 72, 68, 0.26) 60%,
    rgba(10, 44, 40, 0.62) 100%
  );
}

/* 首屏中央品牌字（参考泡泡玛特：上副标 + 下粗体大字） */
.hero-brand {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  text-align: center;
  padding: 0 24px;
}

.hero-brand-tagline {
  margin: 0 0 14px;
  font-size: clamp(11px, 1.8vw, 14px);
  font-weight: 400;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 1px 14px rgba(0, 0, 0, 0.45);
}

.hero-brand-title {
  margin: 0;
  font-size: clamp(44px, 11vw, 96px);
  font-weight: 900;
  line-height: 1.02;
  letter-spacing: 0.02em;
  color: #fafaf8;
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    'Segoe UI',
    'PingFang SC',
    'Microsoft YaHei',
    sans-serif;
  text-shadow:
    0 2px 32px rgba(0, 0, 0, 0.55),
    0 0 1px rgba(0, 0, 0, 0.8);
}

.scroll-down {
  position: absolute;
  left: 50%;
  bottom: 22px;
  transform: translateX(-50%);
  z-index: 3;
  border: none;
  border-radius: 999px;
  padding: 10px 22px;
  font-size: 15px;
  cursor: pointer;
  color: #253126;
  background: rgba(242, 239, 228, 0.92);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.22);
}

.scroll-down:hover {
  background: #f7f4ea;
}

.catalog {
  flex: 1;
  padding: 22px;
}

.catalog-inner {
  display: grid;
  gap: 14px;
}

/* 下滑后 About us（参考泡泡玛特：白底、居中、英主标 + 中文副标 + 正文） */
.about-us {
  width: calc(100% + 44px);
  margin-left: -22px;
  margin-right: -22px;
  box-sizing: border-box;
  padding: clamp(40px, 7vw, 72px) clamp(20px, 5vw, 48px) clamp(48px, 8vw, 80px);
  /* 与整页 / 商品区底色一致（见 .product-hall） */
  background: #e9e6dc;
  text-align: center;
  color: #2f322e;
}

.about-us-en {
  margin: 0 0 10px;
  font-size: clamp(28px, 5vw, 40px);
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    'Segoe UI',
    'PingFang SC',
    'Microsoft YaHei',
    sans-serif;
  color: #2d322d;
}

.about-us-zh {
  margin: 0 0 28px;
  font-size: clamp(16px, 2.4vw, 20px);
  font-weight: 400;
  font-family:
    'PingFang SC',
    'Microsoft YaHei',
    ui-sans-serif,
    system-ui,
    sans-serif;
  color: #2d322d;
}

.about-us-body {
  margin: 0 auto;
  max-width: 720px;
  font-size: 15px;
  line-height: 1.85;
  font-weight: 400;
  text-align: center;
  color: #3e413d;
  font-family:
    'PingFang SC',
    'Microsoft YaHei',
    ui-sans-serif,
    system-ui,
    sans-serif;
}

.catalog-intro h1 {
  margin: 0 0 8px;
  color: #2d322d;
  font-size: 36px;
  font-family: Georgia, 'Times New Roman', serif;
}

.catalog-intro p {
  margin: 0;
  color: #3e413d;
}

.message {
  margin: 0;
}

.hall-body {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.hall-toolbar {
  padding: 0;
  background: transparent;
}

.toolbar-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 20px;
}

.toolbar-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 0;
}

.toolbar-input {
  width: min(240px, 70vw);
}

.toolbar-select {
  width: min(160px, 50vw);
}

.toolbar-form :deep(.el-input__wrapper),
.toolbar-form :deep(.el-select__wrapper) {
  box-shadow: none;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 999px;
}

.product-grid-wrap {
  min-height: 120px;
}

.empty-grid {
  margin: 0;
  padding: 48px 16px;
  text-align: center;
  color: #6b6e6a;
  font-size: 15px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 28px 22px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.product-card {
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: center;
  border-radius: 14px;
  font: inherit;
  color: inherit;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-card:focus-visible {
  outline: 2px solid #245c58;
  outline-offset: 4px;
}

.product-card-media {
  aspect-ratio: 3 / 4;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: #dedad0;
  margin-bottom: 14px;
}

.product-card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.product-card-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #8a8680;
}

.product-card-name {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
  color: #1f221f;
  line-height: 1.35;
  font-family:
    'PingFang SC',
    'Microsoft YaHei',
    ui-sans-serif,
    system-ui,
    sans-serif;
}

.product-card-meta {
  margin: 0 0 8px;
  font-size: 13px;
  color: #5c605b;
}

.product-card-price {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #8c2f3f;
  letter-spacing: 0.02em;
}

.product-card-currency {
  margin-right: 4px;
  font-weight: 500;
  font-size: 0.95em;
}

.api {
  font-family: Consolas, monospace;
  color: #245c58;
  font-size: 12px;
}

.detail-content {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 18px;
  align-items: start;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-line {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: #2d322d;
}

.detail-k {
  display: inline-block;
  min-width: 2.5em;
  margin-right: 8px;
  color: #6b6f6a;
  font-size: 13px;
}

.product-image {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8e4da;
  border-radius: 10px;
  overflow: hidden;
}

.dialog-product-image {
  height: 260px;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  color: #7f7b71;
  font-size: 14px;
  padding: 24px;
}

.booking-block {
  display: grid;
  gap: 12px;
  padding-top: 8px;
}

.dialog-booking-title {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #2d322d;
  font-family: Georgia, 'Times New Roman', serif;
}

.dialog-booking-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dialog-submit {
  margin-top: 4px;
  justify-self: start;
}

.dialog-body {
  min-height: 120px;
}

.product-detail-dialog :deep(.el-dialog__header) {
  padding-bottom: 8px;
  margin-right: 0;
  border-bottom: none;
}

.product-detail-dialog :deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #2d322d;
}

.product-detail-dialog :deep(.el-dialog__headerbtn) {
  top: 4px;
}

.product-detail-dialog :deep(.el-dialog__body) {
  padding-top: 0;
}

.product-detail-dialog :deep(.el-input__wrapper),
.product-detail-dialog :deep(.el-input-number__wrapper) {
  box-shadow: none;
  background: #f5f2ea;
  border-radius: 8px;
}

@media (max-width: 1180px) {
  .product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 22px 16px;
  }
}

@media (max-width: 1000px) {
  .detail-content {
    grid-template-columns: 1fr;
  }

  .dialog-product-image {
    height: 220px;
  }
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: 1fr;
    max-width: 360px;
    margin: 0 auto;
  }
}
</style>
