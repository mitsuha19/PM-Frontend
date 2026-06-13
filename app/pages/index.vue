<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div>
    <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">Selamat datang kembali, {{ authStore.user?.name }}! 👋</h2>
      <p class="text-gray-600">Ini adalah pusat kendali proyek Anda. Pilih atau buat proyek baru untuk mulai mengelola tugas-tugas tim Anda.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p class="text-sm font-medium text-gray-500 mb-1">Total Proyek</p>
        <p class="text-3xl font-bold text-gray-900">12</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p class="text-sm font-medium text-gray-500 mb-1">Tugas Selesai</p>
        <p class="text-3xl font-bold text-green-600">48</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p class="text-sm font-medium text-gray-500 mb-1">Tugas Pending</p>
        <p class="text-3xl font-bold text-orange-500">7</p>
      </div>
    </div>
  </div>
</template>

