<script setup>
import { reactive } from 'vue'

const props = defineProps({
  mode: { type: String, default: 'login' },
  submitting: { type: Boolean, default: false },
})

const emit = defineEmits(['submit'])

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
})

const onSubmit = () => {
  if (props.mode === 'register' && form.password !== form.confirmPassword) {
    return
  }
  emit('submit', { ...form })
}
</script>

<template>
  <section class="login-scene">
    <div class="triangle-wrap">
      <div class="triangle-shadow"></div>
      <div class="triangle-frame"></div>
      <div class="triangle-panel">
        <div class="top-lines"></div>
        <div class="content">
          <p class="sub">{{ mode === 'login' ? 'LOG INTO' : 'REGISTER' }}</p>
          <h1>{{ mode === 'login' ? 'SYSTEM' : 'ACCOUNT' }}</h1>
          <div class="accent-line"></div>

          <form @submit.prevent="onSubmit">
            <input v-model.trim="form.username" type="text" placeholder="LOGIN..." required />
            <input v-model.trim="form.password" type="password" placeholder="PASSWORD..." required />
            <input
              v-if="mode === 'register'"
              v-model.trim="form.confirmPassword"
              type="password"
              placeholder="CONFIRM PASSWORD..."
              required
            />
          </form>
          <p v-if="mode === 'register'" class="role-tip">NEW ACCOUNT DEFAULT ROLE: STUDENT</p>
          <router-link v-if="mode === 'login'" class="switch-link" to="/register">CREATE ACCOUNT</router-link>
          <router-link v-else class="switch-link" to="/login">BACK TO LOGIN</router-link>
        </div>

        <span class="arrow">&gt;</span>
        <span class="left-mark"></span>
      </div>

      <button class="enter-flag" :disabled="submitting" type="submit" @click="onSubmit">
        <span class="dot">o</span>
        <span>{{ submitting ? 'WAIT' : mode === 'login' ? 'ENTER' : 'JOIN' }}</span>
      </button>
      <span class="bottom-lines"></span>
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
  width: min(86vw, 760px);
  aspect-ratio: 1.08 / 1;
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
  left: 19%;
  top: 20%;
  width: 52%;
  color: #9ca7b6;
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

.accent-line {
  width: 62%;
  border-bottom: 3px solid #56d3f6;
  margin-bottom: 14px;
}

form {
  display: grid;
  gap: 10px;
}

input {
  border: 0;
  border-bottom: 2px solid #d7dce4;
  padding: 8px 2px;
  background: transparent;
  color: #8f96a3;
  font-size: clamp(12px, 1.45vw, 20px);
}

.role-tip {
  margin: 10px 0 0;
  color: #98a7bc;
  font-size: clamp(10px, 1vw, 13px);
  letter-spacing: 0.04em;
}

input:focus {
  outline: none;
  border-bottom-color: #84daf4;
}

.switch-link {
  margin-top: 10px;
  display: inline-block;
  color: #95a6bf;
  font-size: clamp(10px, 1vw, 13px);
  text-decoration: none;
  border: 1px solid #d2d8e1;
  padding: 4px 8px;
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

.dot {
  justify-self: center;
  font-size: 28px;
  line-height: 1;
}

.bottom-lines {
  position: absolute;
  right: 17%;
  bottom: -22px;
  width: 82px;
  height: 52px;
  border-right: 4px solid #56d3f6;
  border-bottom: 4px solid #56d3f6;
}

@media (max-width: 760px) {
  .triangle-wrap { width: 96vw; }
}
</style>
