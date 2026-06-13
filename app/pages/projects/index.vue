<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Daftar Proyek</h1>
        <p class="text-sm text-gray-500 mt-1">Kelola semua proyek di dalam workspace ini.</p>
      </div>

      <UiButton @click="isModalOpen = true">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        Proyek Baru
      </UiButton>
    </div>

    <div v-if="loading && projects.length === 0" class="flex justify-center items-center py-12">
      <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    </div>

    <div v-else-if="projects.length === 0" class="bg-white rounded-xl border border-gray-200 border-dashed p-12 text-center">
      <div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-1">Belum ada proyek</h3>
      <p class="text-gray-500 mb-4">Mulai kolaborasi dengan membuat proyek pertama Anda.</p>
      <button @click="isModalOpen = true" class="text-blue-600 hover:text-blue-700 font-medium">
        + Buat Proyek Baru
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
          v-for="project in projects"
          :key="project.id"
          class="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col"
      >
        <div class="flex-1">
          <h3 class="text-lg font-bold text-gray-800 mb-2">{{ project.name }}</h3>
          <p class="text-sm text-gray-500 line-clamp-3">
            {{ project.description }}
          </p>
        </div>

        <div class="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-sm text-gray-500">
          <span>Dibuat: {{ new Date(project.created_at).toLocaleDateString() }}</span>
          <NuxtLink :to="`/projects/${project.id}`" class="text-blue-600 font-medium hover:underline">
            Lihat Tugas &rarr;
          </NuxtLink>
        </div>
      </div>
    </div>

    <UiModal v-model="isModalOpen" title="Buat Proyek Baru">
      <form id="createProjectForm" @submit.prevent="handleCreateProject">
        <div v-if="error" class="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {{ error.message }}
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Nama Proyek</label>
          <input
              type="text"
              v-model="newProject.name"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Cth: Redesign Landing Page"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <textarea
              v-model="newProject.description"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
              rows="3"
              placeholder="Tujuan proyek ini adalah..."
          ></textarea>
        </div>
      </form>

      <template #footer>
        <UiButton variant="secondary" @click="isModalOpen = false">
          Batal
        </UiButton>
        <UiButton type="submit" form="createProjectForm" variant="primary" :loading="loading">
          Buat Proyek
        </UiButton>
      </template>
    </UiModal>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useProjectApi } from '~/composables/useProject'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const { projects, fetchProjects, createProject, loading, error } = useProjectApi()

const isModalOpen = ref(false)
const newProject = ref({
  name: '',
  description: ''
})

onMounted(async () => {
  if (authStore.activeWorkspaceId) {
    await fetchProjects()
  }
})

watch(() => authStore.activeWorkspaceId, async (newWorkspaceId) => {
  if (newWorkspaceId) {
    await fetchProjects()
  } else {
    projects.value = []
  }
})

const handleCreateProject = async () => {
  try {
    await createProject({
      name: newProject.value.name,
      description: newProject.value.description
    })
    isModalOpen.value = false
    newProject.value = { name: '', description: '' }
  } catch (e) {
  }
}
</script>