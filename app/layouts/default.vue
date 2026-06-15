<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useAuthApi } from "~/composables/useAuth";
import { useWorkspaceApi } from "~/composables/useWorkspace";

const authStore = useAuthStore()
const { logout } = useAuthApi()

const { workspaces, fetchWorkspaces, createWorkspace, updateWorkspace, deleteWorkspace, loading: workspaceLoading, error: workspaceError } = useWorkspaceApi()

const isModalOpen = ref(false)
const isEditing = ref(false)
const editingWorkspaceId = ref<number | null>(null)

const workspaceForm = ref({
  name: '',
  description: ''
})

onMounted(async () => {
  await fetchWorkspaces()
})

const handleLogout = async () => {
  await logout()
}

const switchWorkspace = (event: Event) => {
  const target = event.target as HTMLSelectElement
  authStore.setActiveWorkspace(Number(target.value))
}

const activeWorkspaceRole = computed(() => {
  const currentWs = workspaces.value.find(w => w.id === authStore.activeWorkspaceId)
  return currentWs?.pivot?.role || 'member'
})
const openCreateModal = () => {
  isEditing.value = false
  editingWorkspaceId.value = null
  workspaceForm.value = { name: '', description: '' }
  isModalOpen.value = true
}

const openEditModal = () => {
  const currentWs = workspaces.value.find(w => w.id === authStore.activeWorkspaceId)
  if (currentWs) {
    isEditing.value = true
    editingWorkspaceId.value = currentWs.id
    workspaceForm.value = {
      name: currentWs.name,
      description: currentWs.description || ''
    }
    isModalOpen.value = true
  }
}

const handleSubmit = async () => {
  try {
    if (isEditing.value && editingWorkspaceId.value) {
      await updateWorkspace(editingWorkspaceId.value, {
        name: workspaceForm.value.name,
        description: workspaceForm.value.description
      })
    } else {
      await createWorkspace({
        name: workspaceForm.value.name,
        description: workspaceForm.value.description
      })
    }

    isModalOpen.value = false
  } catch (error) {
  }
}

const handleDelete = async () => {
  if (!editingWorkspaceId.value) return

  const isConfirmed = window.confirm('Apakah Anda yakin ingin menghapus workspace ini secara permanen? Seluruh data proyek, tugas, dan anggota di dalamnya akan hilang dan tidak dapat dikembalikan.')

  if (isConfirmed) {
    try {
      await deleteWorkspace(editingWorkspaceId.value)
      isModalOpen.value = false
    } catch (error) {
    }
  }
}
</script>

<template>
  <div class="min-h-screen flex bg-gray-50 font-sans relative">

    <aside class="w-64 bg-gray-900 text-white flex flex-col shadow-xl z-20">
      <div class="h-16 flex items-center px-6 border-b border-gray-800">
        <span class="text-xl font-bold tracking-wider text-blue-400">ProManage.</span>
      </div>

      <nav class="flex-1 px-4 py-6 space-y-2">
        <NuxtLink to="/" class="block px-4 py-2.5 rounded-lg transition-colors hover:bg-gray-800" active-class="bg-blue-600 text-white font-medium">
          Dashboard
        </NuxtLink>
        <NuxtLink to="/projects" class="block px-4 py-2.5 rounded-lg text-gray-300 transition-colors hover:bg-gray-800" active-class="bg-blue-600 text-white font-medium">
          Projects
        </NuxtLink>
        <NuxtLink to="/members" class="block px-4 py-2.5 rounded-lg text-gray-300 transition-colors hover:bg-gray-800" active-class="bg-blue-600 text-white font-medium">
          Tim
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-gray-800">
        <button @click="handleLogout" class="w-full flex items-center px-4 py-2 text-sm text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-gray-800">
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Sign Out
        </button>
      </div>
    </aside>

    <div class="flex-1 flex flex-col min-w-0">

      <header class="h-16 bg-white shadow-sm flex items-center justify-between px-8 z-10">
        <h1 class="text-xl font-semibold text-gray-800">
          Workspace Overview
        </h1>

        <div class="flex items-center gap-4">

          <div class="flex items-center gap-2">
            <select
                v-if="workspaces.length > 0"
                :value="authStore.activeWorkspaceId"
                @change="switchWorkspace"
                class="text-sm bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 outline-none"
            >
              <option v-for="ws in workspaces" :key="ws.id" :value="ws.id">
                {{ ws.name }}
              </option>
            </select>

            <span v-else class="text-sm text-red-500 italic">Belum ada Workspace</span>

            <button
                v-if="workspaces.length > 0 && (activeWorkspaceRole === 'owner' || activeWorkspaceRole === 'admin')"
                @click="openEditModal"
                class="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                title="Pengaturan Workspace"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </button>

            <button @click="openCreateModal" class="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors" title="Buat Workspace Baru">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            </button>
          </div>

          <div class="flex items-center gap-2 pl-4 border-l border-gray-200">
            <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {{ authStore.user?.name?.charAt(0).toUpperCase() || 'U' }}
            </div>
            <span class="text-sm font-medium text-gray-700">{{ authStore.user?.name }}</span>
          </div>
        </div>
      </header>

      <main class="flex-1 p-8 overflow-y-auto">
        <div v-if="workspaces.length === 0 && !workspaceLoading" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-md">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-yellow-700">
                Anda belum memiliki Workspace. Silakan buat Workspace baru terlebih dahulu dengan menekan tombol plus (+) di pojok kanan atas.
              </p>
            </div>
          </div>
        </div>

        <slot />
      </main>

    </div>

    <UiModal v-model="isModalOpen" :title="isEditing ? 'Pengaturan Workspace' : 'Buat Workspace Baru'">
      <form id="workspaceForm" @submit.prevent="handleSubmit">
        <div v-if="workspaceError" class="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {{ workspaceError.message }}
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Nama Workspace</label>
          <input
              type="text"
              v-model="workspaceForm.name"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Cth: Tim Alpha"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi (Opsional)</label>
          <textarea
              v-model="workspaceForm.description"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
              rows="3"
              placeholder="Deskripsi singkat workspace..."
          ></textarea>
        </div>
      </form>

      <template #footer>
        <div class="flex justify-between w-full">
          <div>
            <UiButton
                v-if="isEditing"
                type="button"
                variant="danger"
                @click="handleDelete"
                :disabled="workspaceLoading"
            >
              Hapus
            </UiButton>
          </div>

          <div class="flex gap-3">
            <UiButton variant="secondary" @click="isModalOpen = false">
              Batal
            </UiButton>
            <UiButton type="submit" form="workspaceForm" variant="primary" :loading="workspaceLoading">
              {{ isEditing ? 'Simpan Perubahan' : 'Simpan Workspace' }}
            </UiButton>
          </div>
        </div>
      </template>
    </UiModal>

  </div>
</template>

