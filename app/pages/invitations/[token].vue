<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useMemberApi } from '~/composables/useMember'

definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { acceptInvitation, loading } = useMemberApi()

const token = route.params.token as string
const isSuccess = ref(false)
const isCheckingAuth = ref(true)

const customErrorMessage = ref<string | null>(null)

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    isCheckingAuth.value = false
    return
  }

  isCheckingAuth.value = false

  await processInvitation()
})

const processInvitation = async () => {
  try {
    await acceptInvitation(token)
    isSuccess.value = true

    setTimeout(() => {
      router.push('/')
    }, 2000)
  } catch (e: any) {
    let backendMessage =
        e?.data?.message ||
        e?.response?._data?.message ||
        e?.response?.data?.message ||
        e?.message ||
        '';

    if (backendMessage.includes('Bad Request') || backendMessage.includes('[POST]') || backendMessage === '') {
      backendMessage = 'Tautan undangan tidak valid, sudah digunakan, atau telah kedaluwarsa.';
    }

    customErrorMessage.value = backendMessage;
  }
}

const goToLogin = () => {
  router.push(`/login?redirect=/invitations/${token}`)
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">

      <div class="mb-6">
        <span class="text-2xl font-bold tracking-wider text-blue-600">ProManage.</span>
      </div>

      <h2 class="text-xl font-bold text-gray-900 mb-6">Memproses Undangan...</h2>

      <div v-if="isCheckingAuth" class="py-8 flex justify-center">
        <UiLoading />
      </div>

      <div v-else-if="!authStore.isLoggedIn" class="space-y-4">
        <div class="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <p class="text-gray-600 text-sm">
          Anda harus masuk (login) ke akun Anda terlebih dahulu untuk menerima undangan ini. Pastikan Anda login menggunakan email yang sama dengan alamat penerima undangan.
        </p>
        <UiButton @click="goToLogin" class="w-full justify-center">
          Login untuk Menerima
        </UiButton>
        <p class="text-xs text-gray-400 mt-4">
          Belum punya akun? <NuxtLink :to="`/register`" class="text-blue-600 hover:underline">Daftar sekarang</NuxtLink>
        </p>
      </div>

      <div v-else-if="isSuccess" class="space-y-4">
        <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <p class="text-green-700 font-medium">Undangan berhasil diterima!</p>
        <p class="text-sm text-gray-500">Mengarahkan Anda ke Dashboard...</p>
      </div>

      <div v-else-if="customErrorMessage" class="space-y-4">
        <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <UiAlert :message="customErrorMessage" />
        <UiButton variant="secondary" @click="router.push('/')" class="w-full justify-center mt-2">
          Kembali ke Beranda
        </UiButton>
      </div>

      <div v-else class="py-8 flex justify-center">
        <UiLoading />
      </div>

    </div>
  </div>
</template>