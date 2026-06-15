<template>
  <div class="flex justify-between items-center mb-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">{{ title }}</h1>
      <p v-if="description" class="text-sm text-gray-500 mt-1">{{ description }}</p>
    </div>
    <div class="flex items-center gap-3">
      <slot></slot> </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>