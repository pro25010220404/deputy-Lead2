import { createRouter, createWebHistory } from 'vue-router'
import AuthLayout from '../layouts/AuthLayout.vue'
import MainLayout from '../layouts/MainLayout.vue'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import ProductHallView from '../views/products/ProductHallView.vue'
import MyOrdersView from '../views/orders/MyOrdersView.vue'
import OrderReviewView from '../views/admin/OrderReviewView.vue'
import StatsView from '../views/admin/StatsView.vue'
import AdminProductManageView from '../views/admin/AdminProductManageView.vue'
import AdminReportView from '../views/admin/AdminReportView.vue'
import StudentHomeView from '../views/student/StudentHomeView.vue'
import NotFoundView from '../views/shared/NotFoundView.vue'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    component: AuthLayout,
    children: [{ path: '', name: 'login', component: LoginView }],
  },
  {
    path: '/register',
    component: AuthLayout,
    children: [{ path: '', name: 'register', component: RegisterView }],
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/admin/stats' },
      { path: 'student', name: 'student-home', component: StudentHomeView },
      { path: 'products', name: 'products', component: ProductHallView },
      { path: 'orders', name: 'orders', component: MyOrdersView },
      { path: 'admin/products', name: 'admin-products', component: AdminProductManageView, meta: { role: 'admin' } },
      { path: 'admin/review', name: 'admin-review', component: OrderReviewView, meta: { role: 'admin' } },
      { path: 'admin/stats', name: 'admin-stats', component: StatsView, meta: { role: 'admin' } },
      { path: 'admin/reports', name: 'admin-reports', component: AdminReportView, meta: { role: 'admin' } },
    ],
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.role === 'admin' && !auth.isAdmin) {
    return { name: 'student-home' }
  }

  if ((to.name === 'login' || to.name === 'register') && auth.isAuthenticated) {
    return { name: auth.isAdmin ? 'admin-stats' : 'student-home' }
  }

  return true
})

export default router
