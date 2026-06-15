<template>
  <div>
    <div class="mb-4">
      <NuxtLink to="/projects" class="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-2">
        &larr; Kembali ke Daftar Proyek
      </NuxtLink>

      <UiPageHeader title="Papan Tugas" :description="`Kelola tugas untuk proyek #${projectId}`">
        <UiButton @click="openCreateModal">
          + Tambah Tugas
        </UiButton>
      </UiPageHeader>
    </div>

    <UiLoading v-if="loading && tasks.length === 0" />

    <div v-else class="flex gap-6 overflow-x-auto pb-4">

      <div class="min-w-[300px] flex-1 bg-gray-100 rounded-xl p-4 flex flex-col h-full min-h-[500px]">
        <h3 class="font-bold text-gray-700 mb-4 flex items-center justify-between">
          <span>To Do</span>
          <span class="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs">{{ todoTasks.length }}</span>
        </h3>
        <div class="space-y-3 flex-1">
          <div
              v-for="task in todoTasks"
              :key="task.id"
              @click="openEditModal(task)"
              class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors"
          >
            <h4 class="font-medium text-gray-900">{{ task.title }}</h4>
            <p class="text-sm text-gray-500 mt-1 line-clamp-2">{{ task.description }}</p>
          </div>
          <div v-if="todoTasks.length === 0" class="text-sm text-gray-400 text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">Belum ada tugas</div>
        </div>
      </div>

      <div class="min-w-[300px] flex-1 bg-blue-50 rounded-xl p-4 flex flex-col h-full min-h-[500px]">
        <h3 class="font-bold text-blue-800 mb-4 flex items-center justify-between">
          <span>In Progress</span>
          <span class="bg-blue-200 text-blue-800 px-2 py-0.5 rounded text-xs">{{ inProgressTasks.length }}</span>
        </h3>
        <div class="space-y-3 flex-1">
          <div
              v-for="task in inProgressTasks"
              :key="task.id"
              @click="openEditModal(task)"
              class="bg-white p-4 rounded-lg shadow-sm border border-blue-100 cursor-pointer hover:border-blue-300 transition-colors"
          >
            <h4 class="font-medium text-gray-900">{{ task.title }}</h4>
            <p class="text-sm text-gray-500 mt-1 line-clamp-2">{{ task.description }}</p>
          </div>
          <div v-if="inProgressTasks.length === 0" class="text-sm text-gray-400 text-center py-4 border-2 border-dashed border-blue-200 rounded-lg">Kosong</div>
        </div>
      </div>

      <div class="min-w-[300px] flex-1 bg-green-50 rounded-xl p-4 flex flex-col h-full min-h-[500px]">
        <h3 class="font-bold text-green-800 mb-4 flex items-center justify-between">
          <span>Done</span>
          <span class="bg-green-200 text-green-800 px-2 py-0.5 rounded text-xs">{{ doneTasks.length }}</span>
        </h3>
        <div class="space-y-3 flex-1">
          <div
              v-for="task in doneTasks"
              :key="task.id"
              @click="openEditModal(task)"
              class="bg-white p-4 rounded-lg shadow-sm border border-green-100 cursor-pointer hover:border-green-300 opacity-75 transition-colors"
          >
            <h4 class="font-medium text-gray-900 line-through">{{ task.title }}</h4>
            <p class="text-sm text-gray-500 mt-1 line-clamp-2">{{ task.description }}</p>
          </div>
          <div v-if="doneTasks.length === 0" class="text-sm text-gray-400 text-center py-4 border-2 border-dashed border-green-200 rounded-lg">Kosong</div>
        </div>
      </div>

    </div>

    <UiModal v-model="isModalOpen" :title="isEditing ? 'Edit Tugas' : 'Tambah Tugas Baru'">
      <form id="taskForm" @submit.prevent="handleSubmit">
        <UiAlert :message="error?.message" />

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Nama Tugas</label>
          <input
              type="text"
              v-model="taskForm.title"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Cth: Desain logo baru"
          >
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
              v-model="taskForm.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <textarea
              v-model="taskForm.description"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
              rows="3"
              placeholder="Detail instruksi tugas..."
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
                :disabled="loading"
            >
              Hapus
            </UiButton>
          </div>

          <div class="flex gap-3">
            <UiButton variant="secondary" @click="isModalOpen = false">Batal</UiButton>
            <UiButton type="submit" form="taskForm" variant="primary" :loading="loading">
              {{ isEditing ? 'Simpan Perubahan' : 'Simpan Tugas' }}
            </UiButton>
          </div>
        </div>
      </template>
    </UiModal>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTaskApi } from '~/composables/useTask'
import type { Task } from '~/types/task'

const route = useRoute()
const projectId = route.params.id as string

const { tasks, fetchTasks, createTask, updateTask, deleteTask, loading, error } = useTaskApi()

const isModalOpen = ref(false)
const isEditing = ref(false)
const editingTaskId = ref<number | null>(null)

const taskForm = ref({
  title: '',
  description: '',
  status: 'todo'
})

const todoTasks = computed(() => tasks.value.filter(t => t.status === 'todo'))
const inProgressTasks = computed(() => tasks.value.filter(t => t.status === 'in_progress'))
const doneTasks = computed(() => tasks.value.filter(t => t.status === 'done'))

onMounted(async () => {
  await fetchTasks(projectId)
})

const openCreateModal = () => {
  isEditing.value = false
  editingTaskId.value = null
  taskForm.value = { title: '', description: '', status: 'todo' }
  isModalOpen.value = true
}

const openEditModal = (task: Task) => {
  isEditing.value = true
  editingTaskId.value = task.id
  taskForm.value = {
    title: task.title,
    description: task.description || '',
    status: task.status
  }
  isModalOpen.value = true
}

const handleSubmit = async () => {
  try {
    if (isEditing.value && editingTaskId.value) {
      await updateTask(projectId, editingTaskId.value, {
        title: taskForm.value.title,
        description: taskForm.value.description,
        status: taskForm.value.status
      })
    } else {
      await createTask(projectId, {
        title: taskForm.value.title,
        description: taskForm.value.description,
        status: taskForm.value.status
      })
    }
    isModalOpen.value = false
  } catch (e) {
  }
}

const handleDelete = async () => {
  if (!editingTaskId.value) return
  const isConfirmed = window.confirm('Apakah Anda yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan.')

  if (isConfirmed) {
    try {
      await deleteTask(projectId, editingTaskId.value)
      isModalOpen.value = false
    } catch (e) {
    }
  }
}
</script>