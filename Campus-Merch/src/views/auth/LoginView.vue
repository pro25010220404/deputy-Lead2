<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import TriangleLoginPanel from '../../components/login/TriangleLoginPanel.vue'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const loading = ref(false)

const handleLogin = async (payload) => {
  try {
    loading.value = true
    await authStore.login(payload)
    const target = route.query.redirect || (authStore.isAdmin ? '/admin/stats' : '/student')
    router.push(target)
  } catch (error) {
    ElMessage.error(error?.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <TriangleLoginPanel mode="login" :submitting="loading" @submit="handleLogin" />
</template>
