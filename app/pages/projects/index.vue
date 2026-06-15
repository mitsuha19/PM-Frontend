<template>
  <div>
    <UiPageHeader title="Daftar Proyek" description="Kelola semua proyek di dalam workspace ini.">
      <UiButton @click="openCreateModal">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        Proyek Baru
      </UiButton>
    </UiPageHeader>

    <UiLoading v-if="loading && projects.length === 0" />

    <UiEmptyState
        v-else-if="projects.length === 0"
        title="Belum ada proyek"
        description="Mulai kolaborasi dengan membuat proyek pertama Anda."
    >
      <template #action>
        <button @click="openCreateModal" class="text-blue-600 hover:text-blue-700 font-medium">
          + Buat Proyek Baru
        </button>
      </template>
    </UiEmptyState>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
          v-for="project in projects"
          :key="project.id"
          class="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between"
      >
        <div class="mb-4">
          <h3 class="text-lg font-bold text-gray-800 mb-2">{{ project.name }}</h3>
          <p class="text-sm text-gray-500 line-clamp-3">
            {{ project.description || 'Tidak ada deskripsi' }}
          </p>
        </div>

        <div class="pt-4 border-t border-gray-50 flex justify-between items-center">
          <span class="text-xs font-medium text-gray-400">
            Dibuat: {{ new Date(project.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}
          </span>

          <div class="flex items-center gap-2">
            <button @click="openEditModal(project)" class="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-gray-600 transition-colors">
              Edit
            </button>
            <NuxtLink :to="`/projects/${project.id}`" class="px-3 py-1.5 text-sm bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-200 font-medium text-blue-700 transition-colors">
              Buka Papan
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <UiModal v-model="isModalOpen" :title="isEditing ? 'Edit Proyek' : 'Buat Proyek Baru'">
      <form id="projectForm" @submit.prevent="handleSubmit">
        <UiAlert :message="error?.message" />

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Nama Proyek</label>
          <input
              type="text"
              v-model="projectForm.name"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Cth: Redesign Landing Page"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <textarea
              v-model="projectForm.description"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
              rows="3"
              placeholder="Tujuan proyek ini adalah..."
          ></textarea>
        </div>
      </form>

      <template #footer>
        <div class="flex justify-between w-full">
          <div>
            <UiButton v-if="isEditing" type="button" variant="danger" @click="handleDelete" :disabled="loading">
              Hapus
            </UiButton>
          </div>
          <div class="flex gap-3">
            <UiButton variant="secondary" @click="isModalOpen = false">Batal</UiButton>
            <UiButton type="submit" form="projectForm" variant="primary" :loading="loading">
              {{ isEditing ? 'Simpan Perubahan' : 'Buat Proyek' }}
            </UiButton>
          </div>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useProjectApi } from '~/composables/useProject'
import { useAuthStore } from '~/stores/auth'
import type { Project } from '~/types'

const authStore = useAuthStore()
const { projects, fetchProjects, createProject, updateProject, deleteProject, loading, error } = useProjectApi()

const isModalOpen = ref(false)
const isEditing = ref(false)
const editingProjectId = ref<number | null>(null)

const projectForm = ref({
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

const openCreateModal = () => {
  isEditing.value = false
  editingProjectId.value = null
  projectForm.value = { name: '', description: '' }
  isModalOpen.value = true
}

const openEditModal = (project: Project) => {
  isEditing.value = true
  editingProjectId.value = project.id
  projectForm.value = {
    name: project.name,
    description: project.description
  }
  isModalOpen.value = true
}

const handleSubmit = async () => {
  try {
    if (isEditing.value && editingProjectId.value) {
      await updateProject(editingProjectId.value, {
        name: projectForm.value.name,
        description: projectForm.value.description
      })
    } else {
      await createProject({
        name: projectForm.value.name,
        description: projectForm.value.description
      })
    }
    isModalOpen.value = false
  } catch (e) {
  }
}

const handleDelete = async () => {
  if (!editingProjectId.value) return

  const isConfirmed = window.confirm('Apakah Anda yakin ingin menghapus proyek ini beserta seluruh tugas di dalamnya? Tindakan ini tidak dapat dibatalkan.')

  if (isConfirmed) {
    try {
      await deleteProject(editingProjectId.value)
      isModalOpen.value = false
    } catch (e) {
    }
  }
}
</script>