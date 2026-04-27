<template>
  <main class="not-found">
    <h1>404</h1>
    <p>页面不存在，返回系统首页继续操作。</p>
    <router-link to="/overview">回到首页</router-link>
  </main>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: grid;
  place-content: center;
  gap: 10px;
  background: #f5f8fc;
  text-align: center;
}
a {
  color: #2e679d;
}
</style>
