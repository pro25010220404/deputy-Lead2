<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import TriangleLoginPanel from '../../components/login/TriangleLoginPanel.vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const loading = ref(false)

const handleRegister = async (payload) => {
  if (payload.password !== payload.confirmPassword) {
    ElMessage.error('两次密码不一致')
    return
  }
  try {
    loading.value = true
    await authStore.register(payload)
    ElMessage.success('注册成功，请点击返回登录')
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <TriangleLoginPanel mode="register" :submitting="loading" @submit="handleRegister" />
</template>
