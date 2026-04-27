<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  value: { type: String, default: '' },
  tone: { type: String, default: 'default' },
})
</script>

<template>
  <article class="card" :class="tone">
    <p class="subtitle">{{ subtitle }}</p>
    <h3>{{ title }}</h3>
    <strong v-if="value">{{ value }}</strong>
    <slot />
  </article>
</template>

<style scoped>
.card {
  border: 2px solid #2e2f29;
  background: #f4f3ea;
  padding: 14px 16px;
  min-height: 110px;
}

.subtitle {
  margin: 0 0 8px;
  color: #6d6a63;
  font-size: 12px;
}

h3 {
  margin: 0;
  font-size: 22px;
}

strong {
  display: inline-block;
  margin-top: 8px;
  font-size: 26px;
}

.income {
  border-color: #1f6d64;
}

.expense {
  border-color: #a5504f;
}

.default {
  border-color: #2e2f29;
}
</style>
