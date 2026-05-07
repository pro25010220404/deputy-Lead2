<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const profileLabel = computed(() => authStore.profile?.name || '未登录用户')

const navPrimary = computed(() => [
  { label: '商品大厅', to: '/products' },
  { label: '我的订单', to: '/orders' },
  {
    label: '个人中心',
    to: authStore.isAdmin ? '/admin/stats' : '/student',
  },
])

const navSecondary = computed(() =>
  authStore.isAdmin
    ? [
        { label: '商品维护', to: '/admin/products' },
        { label: '订单审核', to: '/admin/review' },
        { label: '报表导出', to: '/admin/reports' },
      ]
    : []
)

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="main-shell">
    <header class="site-header">
      <div class="header-brand">
        <div class="brand">CampusMerch v2.0</div>
        <p class="profile">{{ profileLabel }}</p>
      </div>
      <nav class="header-nav" aria-label="主导航">
        <div class="nav-group nav-group--primary">
          <RouterLink
            v-for="item in navPrimary"
            :key="item.to"
            :to="item.to"
            class="nav-link"
            :class="{ active: route.path === item.to }"
          >
            {{ item.label }}
          </RouterLink>
        </div>
        <div v-if="navSecondary.length" class="nav-group nav-group--secondary">
          <RouterLink
            v-for="item in navSecondary"
            :key="item.to"
            :to="item.to"
            class="nav-link"
            :class="{ active: route.path === item.to }"
          >
            {{ item.label }}
          </RouterLink>
        </div>
      </nav>
      <div class="header-actions">
        <button class="logout-btn" type="button" @click="handleLogout">退出登录</button>
      </div>
    </header>

    <section class="content-panel">
      <router-view />
    </section>
  </div>
</template>

<style scoped>
.main-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #e9e6dc;
  color: #2f322e;
}

.site-header {
  background: #245c58;
  color: #f2efe5;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 28px;
  padding: 14px 22px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.25);
}

.header-brand {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.brand {
  font-size: 27px;
  font-weight: 700;
  font-family: Georgia, 'Times New Roman', serif;
  line-height: 1.15;
}

.profile {
  margin: 0;
  color: #c8dfdb;
  font-size: 14px;
}

.header-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 18px 72px;
  flex: 1 1 200px;
  min-width: 0;
}

.nav-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.nav-group--primary {
  gap: 56px;
}

.nav-group--secondary {
  gap: 36px;
}

@media (min-width: 900px) {
  .header-nav {
    justify-content: center;
  }
}

.nav-link {
  text-decoration: none;
  color: #ecf3ef;
  border: none;
  padding: 10px 4px;
  font-size: 17px;
  white-space: nowrap;
  background: transparent;
}

.nav-link.active {
  color: #f7f4ea;
  font-weight: 600;
  box-shadow: inset 0 -3px 0 0 rgba(247, 244, 234, 0.95);
}

.header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.logout-btn {
  padding: 10px 18px;
  border: none;
  color: #eff5fd;
  background: rgba(255, 255, 255, 0.12);
  cursor: pointer;
  font-size: 16px;
  border-radius: 6px;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.18);
}

.content-panel {
  flex: 1;
  padding: 22px;
  min-height: 0;
}

@media (max-width: 640px) {
  .site-header {
    padding: 10px 14px;
  }

  .header-actions {
    width: 100%;
    margin-left: 0;
    justify-content: flex-end;
  }
}
</style>
