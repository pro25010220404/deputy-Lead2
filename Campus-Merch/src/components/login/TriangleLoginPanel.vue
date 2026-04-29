<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const props = defineProps({
  mode: { type: String, default: 'login' },
  submitting: { type: Boolean, default: false },
})

const emit = defineEmits(['submit'])
const router = useRouter()
const loginMethod = ref('password')

const form = reactive({
  username: '',
  name: '',
  email: '',
  verificationCode: '',
  password: '',
  confirmPassword: '',
})

const sendCode = () => {
  const receiver = form.email
  if (!receiver) {
    ElMessage.warning('请先输入邮箱')
    return
  }
  ElMessage.success('验证码已发送')
}

const onSubmit = () => {
  if ((props.mode === 'register' || loginMethod.value === 'password') && !form.username) {
    ElMessage.warning('请填写账号')
    return
  }
  if (props.mode === 'login' && loginMethod.value === 'password' && !form.password) {
    ElMessage.warning('请填写密码')
    return
  }
  if (props.mode === 'login' && loginMethod.value === 'code' && !form.verificationCode) {
    ElMessage.warning('请填写验证码')
    return
  }
  if (props.mode === 'login' && loginMethod.value === 'code' && !form.email) {
    ElMessage.warning('请填写邮箱')
    return
  }
  if (props.mode === 'register' && (!form.name || !form.email || !form.verificationCode)) {
    ElMessage.warning('请完整填写注册信息')
    return
  }
  if (props.mode === 'register' && !form.password) {
    ElMessage.warning('请填写密码')
    return
  }
  if (props.mode === 'register' && form.password !== form.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  emit('submit', {
    ...form,
    username: loginMethod.value === 'code' && props.mode === 'login' ? form.email : form.username,
    loginType: loginMethod.value,
  })
}

const goToSwitchPage = () => {
  router.push(props.mode === 'login' ? '/register' : '/login')
}
</script>

<template>
  <section class="login-scene">
    <div class="triangle-wrap">
      <div class="triangle-shadow"></div>
      <div class="triangle-frame"></div>
      <div class="triangle-panel">
        <div class="top-lines"></div>
        <div :class="['content', { 'login-content': mode === 'login' }]">
          <p class="sub">{{ mode === 'login' ? '登录' : '注册' }}</p>
          <h1>{{ mode === 'login' ? '校园商城' : '账号' }}</h1>
          <div v-if="mode === 'login'" class="method-switch">
            <el-button
              :type="loginMethod === 'password' ? 'primary' : 'default'"
              plain
              @click="loginMethod = 'password'"
            >
              密码登录
            </el-button>
            <el-button
              :type="loginMethod === 'code' ? 'primary' : 'default'"
              plain
              @click="loginMethod = 'code'"
            >
              验证码登录
            </el-button>
          </div>
          <el-form :model="form" @submit.prevent>
            <el-form-item v-if="mode === 'register' || loginMethod === 'password'">
              <el-input v-model.trim="form.username" placeholder="请输入账号" clearable />
            </el-form-item>
            <el-form-item v-if="mode === 'register'">
              <el-input v-model.trim="form.name" placeholder="请输入姓名" clearable />
            </el-form-item>
            <el-form-item v-if="mode === 'register'" class="code-row">
              <el-input v-model.trim="form.email" placeholder="请输入邮箱" clearable />
              <el-button class="code-button" @click="sendCode">发送验证码</el-button>
            </el-form-item>
            <el-form-item v-if="mode === 'register'">
              <el-input v-model.trim="form.verificationCode" placeholder="请输入验证码" clearable />
            </el-form-item>
            <el-form-item v-if="mode === 'register' || loginMethod === 'password'">
              <el-input v-model.trim="form.password" type="password" placeholder="请输入密码" show-password />
            </el-form-item>
            <el-form-item v-if="mode === 'login' && loginMethod === 'code'" class="code-row">
              <el-input v-model.trim="form.email" placeholder="请输入邮箱" clearable />
              <el-button class="code-button" @click="sendCode">获取验证码</el-button>
            </el-form-item>
            <el-form-item v-if="mode === 'login' && loginMethod === 'code'">
              <el-input v-model.trim="form.verificationCode" placeholder="请输入验证码" clearable />
            </el-form-item>
            <el-form-item v-if="mode === 'register'">
              <el-input
                v-model.trim="form.confirmPassword"
                type="password"
                placeholder="请确认密码"
                show-password
              />
            </el-form-item>
          </el-form>
          <el-link class="switch-link" :underline="false" @click="goToSwitchPage">
            {{ mode === 'login' ? '创建账号' : '返回登录' }}
          </el-link>
        </div>

        <span class="arrow">&gt;</span>
        <span :class="['left-mark', { 'left-mark-register': mode === 'register' }]"></span>
      </div>

      <el-button :class="['enter-flag', { 'enter-flag-login': mode === 'login' }]" :disabled="submitting" @click="onSubmit">
        <span class="dot">o</span>
        <span class="enter-text">{{ submitting ? '请稍候' : mode === 'login' ? '进入' : '注册' }}</span>
      </el-button>
    </div>
  </section>
</template>

<style scoped>
.login-scene {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #d7dce3;
}

.triangle-wrap {
  position: relative;
  width: min(96vw, 1020px);
  aspect-ratio: 1.25 / 1;
}

.triangle-shadow,
.triangle-frame,
.triangle-panel {
  position: absolute;
  inset: 0;
  clip-path: polygon(8% 4%, 96% 50%, 8% 96%);
}

.triangle-shadow {
  transform: translate(-13px, 12px);
  background: #d0d4dd;
  filter: drop-shadow(0 18px 16px rgba(35, 41, 61, 0.17));
}

.triangle-frame {
  transform: translate(8px, -3px);
  border: 4px solid rgba(88, 219, 253, 0.5);
}

.triangle-panel {
  background: linear-gradient(145deg, #f7f8f9 0%, #f2f3f5 100%);
  border: 1px solid #e6e8ec;
  box-shadow: 0 10px 22px rgba(57, 67, 85, 0.12);
}

.top-lines {
  position: absolute;
  top: 14px;
  left: 130px;
  width: 126px;
  height: 32px;
  border-top: 4px solid #56d3f6;
  border-left: 4px solid #56d3f6;
  transform: skewX(-30deg);
}

.content {
  position: absolute;
  left: 13%;
  top: 11%;
  width: 58%;
  color: #9ca7b6;
}

.login-content {
  top: 24%;
}

.sub {
  margin: 0;
  font-size: clamp(18px, 2.1vw, 36px);
  letter-spacing: 0.03em;
  font-weight: 300;
}

h1 {
  margin: 2px 0 8px;
  color: #4c5a6e;
  font-size: clamp(30px, 3.7vw, 58px);
  letter-spacing: 0.02em;
}

.el-form {
  display: grid;
  gap: 30px;
}

.el-form-item {
  margin-bottom: 0;
  width: 100%;
}

.method-switch {
  margin: 4px 0 12px;
  display: flex;
  gap: 8px;
}

.code-row :deep(.el-form-item__content) {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
}

.switch-link {
  margin-top: 10px;
  display: inline-flex;
  color: #95a6bf;
  font-size: clamp(14px, 1.4vw, 18px);
  font-weight: 600;
  border: 1px solid #d2d8e1;
  padding: 8px 14px;
}

:deep(.switch-link .el-link__inner) {
  color: #95a6bf;
}

.arrow {
  position: absolute;
  right: 12%;
  top: 50%;
  transform: translateY(-50%);
  color: #6ecde8;
  font-size: clamp(18px, 2.3vw, 34px);
}

.left-mark {
  position: absolute;
  left: 13%;
  bottom: 18%;
  width: 14px;
  height: 14px;
  border-left: 3px solid #56d3f6;
  border-bottom: 3px solid #56d3f6;
}

.left-mark-register {
  left: 10%;
  bottom: 14%;
}

.enter-flag {
  position: absolute;
  right: 16%;
  bottom: -1%;
  width: 30%;
  height: 40%;
  clip-path: polygon(0 12%, 100% 0, 100% 100%, 0 88%);
  border: none;
  background: linear-gradient(155deg, #245d96 0%, #16255f 100%);
  color: #dcecf8;
  display: grid;
  place-content: center;
  gap: 8px;
  font-weight: 700;
  letter-spacing: 0.1em;
  box-shadow: -10px 10px 18px rgba(17, 28, 71, 0.33);
  cursor: pointer;
}

.enter-flag-login {
  bottom: 6%;
}

:deep(.el-input__wrapper) {
  border-radius: 0;
  box-shadow: inset 0 -2px 0 #d7dce4;
  background: transparent;
  padding: 6px 2px;
  min-height: 40px;
}

:deep(.el-input__inner) {
  color: #8f96a3;
  font-size: clamp(12px, 1.45vw, 20px);
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: inset 0 -2px 0 #84daf4;
}

:deep(.el-form-item__content),
:deep(.el-input) {
  width: 100%;
}

:deep(.el-input__inner::placeholder) {
  color: #a8b2bf;
}

:deep(.el-input__clear),
:deep(.el-input__password) {
  color: #9ca7b6;
}

:deep(.enter-flag.el-button) {
  padding: 0;
  border-radius: 0;
  border: none;
  line-height: 1.2;
}

.code-button {
  min-height: 40px;
  padding: 0 16px;
  border-radius: 0;
}

:deep(.enter-flag .el-button__text) {
  display: grid;
  place-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
}

.dot {
  justify-self: center;
  font-size: 28px;
  line-height: 1;
}

.enter-text {
  font-size: clamp(24px, 2.3vw, 34px);
}

@media (max-width: 760px) {
  .triangle-wrap { width: 96vw; }

  .code-row :deep(.el-form-item__content) {
    grid-template-columns: 1fr;
  }
}
</style>
