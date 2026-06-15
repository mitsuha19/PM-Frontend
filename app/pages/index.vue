<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useProjectApi } from '~/composables/useProject'
import { useTaskApi } from '~/composables/useTask'
import type { Project } from '~/types'

const authStore = useAuthStore()
const { fetchProjects } = useProjectApi()
const { fetchTasks } = useTaskApi()

const isLoadingStats = ref(true)
const recentProjects = ref<Project[]>([])
const stats = ref({
  totalProjects: 0,
  pendingTasks: 0,
  completedTasks: 0
})

const loadDashboardData = async () => {
  if (!authStore.activeWorkspaceId) {
    isLoadingStats.value = false
    return
  }

  isLoadingStats.value = true
  try {
    const projects = await fetchProjects()
    stats.value.totalProjects = projects.length

    recentProjects.value = [...projects].sort((a, b) => b.id - a.id).slice(0, 3)

    const taskPromises = projects.map(p => fetchTasks(p.id))
    const taskResults = await Promise.all(taskPromises)

    let pending = 0
    let completed = 0

    taskResults.forEach(projectTasks => {
      pending += projectTasks.filter(t => t.status === 'todo' || t.status === 'in_progress').length
      completed += projectTasks.filter(t => t.status === 'done').length
    })

    stats.value.pendingTasks = pending
    stats.value.completedTasks = completed

  } catch (error) {
    console.error('Gagal memuat statistik dashboard:', error)
  } finally {
    isLoadingStats.value = false
  }
}

onMounted(() => {
  loadDashboardData()
})

watch(() => authStore.activeWorkspaceId, () => {
  stats.value = { totalProjects: 0, pendingTasks: 0, completedTasks: 0 }
  recentProjects.value = []
  loadDashboardData()
})
</script>

<template>

  <div>
    <div class="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 shadow-md text-white mb-8 flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-bold mb-2">Selamat datang kembali, {{ authStore.user?.name }}! 👋</h2>
        <p class="text-blue-100">Berikut adalah ringkasan aktivitas di workspace Anda hari ini.</p>
      </div>
      <div class="hidden md:block">
        <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
      </div>
    </div>

    <div v-if="isLoadingStats" class="flex justify-center items-center py-12">
      <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div class="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Total Proyek</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats.totalProjects }}</p>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div class="w-12 h-12 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Tugas Aktif (Pending)</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats.pendingTasks }}</p>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div class="w-12 h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Tugas Selesai</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats.completedTasks }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="font-bold text-gray-800">Proyek Terbaru</h3>
          <NuxtLink to="/projects" class="text-sm text-blue-600 hover:text-blue-800 font-medium">Lihat Semua &rarr;</NuxtLink>
        </div>

        <div v-if="recentProjects.length === 0" class="p-8 text-center text-gray-500">
          Belum ada proyek. Silakan buat proyek pertama Anda.
        </div>

        <div v-else class="divide-y divide-gray-50">
          <div v-for="project in recentProjects" :key="project.id" class="px-6 py-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
            <div>
              <h4 class="font-medium text-gray-900">{{ project.name }}</h4>
              <p class="text-sm text-gray-500 mt-1 truncate max-w-md">{{ project.description || 'Tidak ada deskripsi' }}</p>
            </div>
            <NuxtLink :to="`/projects/${project.id}`" class="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors">
              Buka Papan
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

