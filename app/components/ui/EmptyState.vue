<template>
  <div class="bg-white rounded-xl border border-gray-200 border-dashed p-12 text-center">
    <div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
      <slot name="icon">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
      </slot>
    </div>
    <h3 class="text-lg font-medium text-gray-900 mb-1">{{ title }}</h3>
    <p class="text-gray-500 mb-4">{{ description }}</p>
    <slot name="action"></slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>