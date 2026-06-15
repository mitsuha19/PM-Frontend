<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useMemberApi } from '~/composables/useMember'

const authStore = useAuthStore()
const { members, fetchMembers, addMember, loading, error } = useMemberApi()

const isModalOpen = ref(false)
const newMember = ref({
  email: '',
  role: 'member'
})

const currentUserRole = computed(() => {
  const me = members.value.find(m => m.id === authStore.user?.id)
  return me ? me.pivot.role : 'member'
})

onMounted(async () => {
  if (authStore.activeWorkspaceId) {
    await fetchMembers()
  }
})

watch(() => authStore.activeWorkspaceId, async (newId) => {
  if (newId) {
    await fetchMembers()
  } else {
    members.value = []
  }
})

const handleAddMember = async () => {
  try {
    await addMember({
      email: newMember.value.email,
      role: newMember.value.role
    })

    isModalOpen.value = false
    newMember.value = { email: '', role: 'member' }
  } catch (e) {
  }
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Anggota Tim</h1>
        <p class="text-sm text-gray-500 mt-1">Kelola siapa saja yang memiliki akses ke workspace ini.</p>
      </div>

      <UiButton
          v-if="currentUserRole === 'owner' || currentUserRole === 'admin'"
          @click="isModalOpen = true"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
        Undang Anggota
      </UiButton>
    </div>

    <div v-if="loading && members.length === 0" class="flex justify-center items-center py-12">
      <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    </div>

    <div v-else class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="divide-y divide-gray-100">
        <div v-for="member in members" :key="member.id" class="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">

          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
              {{ member.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ member.name }}</p>
              <p class="text-sm text-gray-500">{{ member.email }}</p>
            </div>
          </div>

          <div>
            <span
                :class="[
                'px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider border',
                member.pivot.role === 'owner' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                member.pivot.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                'bg-gray-50 text-gray-700 border-gray-200'
              ]"
            >
              {{ member.pivot.role }}
            </span>
          </div>

        </div>
      </div>
    </div>

    <UiModal v-model="isModalOpen" title="Undang Anggota Baru">
      <form id="addMemberForm" @submit.prevent="handleAddMember">
        <div v-if="error" class="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {{ error.message }}
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Alamat Email</label>
          <input
              type="email"
              v-model="newMember.email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="email.rekan@example.com"
          >
          <p class="text-xs text-gray-500 mt-1">Pastikan email tersebut sudah terdaftar di aplikasi ini.</p>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Peran (Role)</label>
          <select
              v-model="newMember.role"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="member">Member (Dapat mengelola tugas)</option>
            <option value="admin">Admin (Bisa mengelola tugas & mengundang member)</option>
          </select>
        </div>
      </form>

      <template #footer>
        <UiButton variant="secondary" @click="isModalOpen = false">Batal</UiButton>
        <UiButton type="submit" form="addMemberForm" variant="primary" :loading="loading">
          Kirim Undangan
        </UiButton>
      </template>
    </UiModal>

  </div>
</template>