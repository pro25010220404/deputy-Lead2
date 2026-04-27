<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const profileLabel = computed(() => authStore.profile?.name || '未登录用户')
const navItems = computed(() =>
  authStore.isAdmin
    ? [
        { label: '商品维护', to: '/admin/products' },
        { label: '商品大厅', to: '/products' },
        { label: '我的订单', to: '/orders' },
        { label: '订单审核', to: '/admin/review' },
        { label: '数据看板', to: '/admin/stats' },
        { label: '报表导出', to: '/admin/reports' },
      ]
    : [
        { label: '学生主页', to: '/student' },
        { label: '商品大厅', to: '/products' },
        { label: '我的订单', to: '/orders' },
      ]
)

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="main-shell">
    <aside class="side-nav">
      <div class="brand">CampusMerch v2.0</div>
      <p class="profile">{{ profileLabel }}</p>
      <nav>
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          :class="{ active: route.path === item.to }"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </aside>

    <section class="content-panel">
      <router-view />
    </section>
  </div>
</template>

<style scoped>
.main-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 250px 1fr;
  background: #e9e6dc;
  color: #2f322e;
}

.side-nav {
  background: #245c58;
  color: #f2efe5;
  padding: 24px 14px;
  display: flex;
  flex-direction: column;
  border-right: 2px solid rgba(0, 0, 0, 0.25);
}

.brand {
  font-size: 28px;
  font-weight: 700;
  font-family: Georgia, 'Times New Roman', serif;
}

.profile {
  margin: 8px 0 18px;
  color: #c8dfdb;
  font-size: 13px;
}

nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-link {
  text-decoration: none;
  color: #ecf3ef;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 10px 12px;
  font-size: 14px;
}

.nav-link.active {
  background: #f2efe4;
  color: #253126;
  border-color: #e5e0d2;
}

.logout-btn {
  margin-top: auto;
  padding: 9px 12px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #eff5fd;
  background: transparent;
  cursor: pointer;
}

.content-panel {
  padding: 22px;
}

@media (max-width: 980px) {
  .main-shell {
    grid-template-columns: 1fr;
  }

  .side-nav {
    gap: 14px;
  }
}
</style>
