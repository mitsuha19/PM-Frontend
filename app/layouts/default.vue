<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import {useAuthApi} from "~/composables/useAuth";

const authStore = useAuthStore()
const {logout} = useAuthApi()

const handleLogout = async () => {
  await logout()
}
</script>

<template>
  <div class="min-h-screen flex bg-gray-50 font-sans">

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
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
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
          <div class="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200">
            Workspace ID: {{ authStore.activeWorkspaceId || 'N/A' }}
          </div>

          <div class="flex items-center gap-2 pl-4 border-l border-gray-200">
            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {{ authStore.user?.name?.charAt(0).toUpperCase() }}
            </div>
            <span class="text-sm font-medium text-gray-700">{{ authStore.user?.name }}</span>
          </div>
        </div>
      </header>

      <main class="flex-1 p-8 overflow-y-auto">
        <slot />
      </main>

    </div>
  </div>
</template>

