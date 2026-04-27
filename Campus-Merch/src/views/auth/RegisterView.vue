<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TriangleLoginPanel from '../../components/login/TriangleLoginPanel.vue'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

const handleRegister = async (payload) => {
  if (payload.password !== payload.confirmPassword) {
    alert('两次密码不一致')
    return
  }
  try {
    loading.value = true
    await authStore.register(payload)
    alert('注册成功，请登录')
    router.push('/login')
  } catch (error) {
    alert(error.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <TriangleLoginPanel mode="register" :submitting="loading" @submit="handleRegister" />
</template>
