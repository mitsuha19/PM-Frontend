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

            <button @click="isModalOpen = true" class="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors" title="Buat Workspace Baru">
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

    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Buat Workspace Baru</h3>

        <div v-if="workspaceError" class="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {{ workspaceError.message }}
        </div>

        <form @submit.prevent="handleCreateWorkspace">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Workspace</label>
            <input
                type="text"
                v-model="newWorkspace.name"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Cth: Tim Alpha"
            >
          </div>
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi (Opsional)</label>
            <textarea
                v-model="newWorkspace.description"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
                rows="3"
                placeholder="Deskripsi singkat workspace..."
            ></textarea>
          </div>

          <div class="flex justify-end gap-3">
            <button
                type="button"
                @click="isModalOpen = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
                type="submit"
                :disabled="workspaceLoading"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center"
            >
              <svg v-if="workspaceLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              {{ workspaceLoading ? 'Menyimpan...' : 'Simpan Workspace' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import {useAuthApi} from "~/composables/useAuth";
import {useWorkspaceApi} from "~/composables/useWorkspace";


const authStore = useAuthStore()
const { logout } = useAuthApi()

const { workspaces, fetchWorkspaces, createWorkspace, loading: workspaceLoading, error: workspaceError } = useWorkspaceApi()

const isModalOpen = ref(false)
const newWorkspace = ref({
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

const handleCreateWorkspace = async () => {
  try {
    await createWorkspace({
      name: newWorkspace.value.name,
      description: newWorkspace.value.description
    })

    isModalOpen.value = false
    newWorkspace.value = { name: '', description: '' }
  } catch (error) {

  }
}
</script>