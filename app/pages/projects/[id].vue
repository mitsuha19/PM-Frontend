<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTaskApi } from '~/composables/useTask'
import { useMemberApi } from '~/composables/useMember'
import type { Task } from '~/types/task'

const route = useRoute()
const projectId = route.params.id as string

const { tasks, fetchTasks, createTask, updateTask, deleteTask, loading, error } = useTaskApi()
const { members, fetchMembers } = useMemberApi()

const isModalOpen = ref(false)
const isEditing = ref(false)
const editingTaskId = ref<number | null>(null)

const taskForm = ref({
  title: '',
  description: '',
  status: 'todo' as 'todo' | 'in_progress' | 'done',
  assignee_id: null as number | null
})

const todoTasks = computed(() => tasks.value.filter(t => t.status === 'todo'))
const inProgressTasks = computed(() => tasks.value.filter(t => t.status === 'in_progress'))
const doneTasks = computed(() => tasks.value.filter(t => t.status === 'done'))

onMounted(async () => {
  await fetchTasks(projectId)
  await fetchMembers()
})

const startDrag = (event: DragEvent, task: Task) => {
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('taskId', task.id.toString())
  }
}

const onDrop = async (event: DragEvent, newStatus: 'todo' | 'in_progress' | 'done') => {
  const taskIdStr = event.dataTransfer?.getData('taskId')
  if (!taskIdStr) return

  const taskId = parseInt(taskIdStr)
  const task = tasks.value.find(t => t.id === taskId)

  if (task && task.status !== newStatus) {
    const oldStatus = task.status

    task.status = newStatus

    try {
      await updateTask(projectId, taskId, {
        title: task.title,
        description: task.description || '',
        status: newStatus,
        assignee_id: task.assignee_id
      })
    } catch (e) {
      task.status = oldStatus
      alert('Gagal memindahkan tugas. Silakan coba lagi.')
    }
  }
}

const openCreateModal = () => {
  isEditing.value = false
  editingTaskId.value = null
  taskForm.value = { title: '', description: '', status: 'todo', assignee_id: null }
  isModalOpen.value = true
}

const openEditModal = (task: any) => {
  isEditing.value = true
  editingTaskId.value = task.id
  taskForm.value = {
    title: task.title,
    description: task.description || '',
    status: task.status,
    assignee_id: task.assignee_id || null
  }
  isModalOpen.value = true
}

const handleSubmit = async () => {
  try {
    if (isEditing.value && editingTaskId.value) {
      await updateTask(projectId, editingTaskId.value, {
        title: taskForm.value.title,
        description: taskForm.value.description,
        status: taskForm.value.status,
        assignee_id: taskForm.value.assignee_id
      })
    } else {
      await createTask(projectId, {
        title: taskForm.value.title,
        description: taskForm.value.description,
        status: taskForm.value.status,
        assignee_id: taskForm.value.assignee_id
      })
    }
    await fetchTasks(projectId)
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

      <div
          class="min-w-[300px] flex-1 bg-gray-100 rounded-xl p-4 flex flex-col h-full min-h-[500px] transition-colors"
          @drop="onDrop($event, 'todo')"
          @dragover.prevent
          @dragenter.prevent
      >
        <h3 class="font-bold text-gray-700 mb-4 flex items-center justify-between">
          <span>To Do</span>
          <span class="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs">{{ todoTasks.length }}</span>
        </h3>
        <div class="space-y-3 flex-1">
          <div
              v-for="task in todoTasks"
              :key="task.id"
              draggable="true"
              @dragstart="startDrag($event, task)"
              @click="openEditModal(task)"
              class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:border-blue-300 transition-colors flex flex-col gap-2"
          >
            <div>
              <h4 class="font-medium text-gray-900">{{ task.title }}</h4>
              <p class="text-sm text-gray-500 mt-1 line-clamp-2">{{ task.description }}</p>
            </div>

            <div class="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
              <span class="text-xs text-gray-400">#{{ task.id }}</span>
              <div v-if="task.assignee" class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold" :title="`Ditugaskan ke: ${task.assignee.name}`">
                {{ task.assignee.name.charAt(0).toUpperCase() }}
              </div>
              <div v-else class="w-6 h-6 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-400" title="Belum ditugaskan">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
            </div>
          </div>
          <div v-if="todoTasks.length === 0" class="text-sm text-gray-400 text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">Belum ada tugas</div>
        </div>
      </div>

      <div
          class="min-w-[300px] flex-1 bg-blue-50 rounded-xl p-4 flex flex-col h-full min-h-[500px] transition-colors"
          @drop="onDrop($event, 'in_progress')"
          @dragover.prevent
          @dragenter.prevent
      >
        <h3 class="font-bold text-blue-800 mb-4 flex items-center justify-between">
          <span>In Progress</span>
          <span class="bg-blue-200 text-blue-800 px-2 py-0.5 rounded text-xs">{{ inProgressTasks.length }}</span>
        </h3>
        <div class="space-y-3 flex-1">
          <div
              v-for="task in inProgressTasks"
              :key="task.id"
              draggable="true"
              @dragstart="startDrag($event, task)"
              @click="openEditModal(task)"
              class="bg-white p-4 rounded-lg shadow-sm border border-blue-100 cursor-grab active:cursor-grabbing hover:border-blue-300 transition-colors flex flex-col gap-2"
          >
            <div>
              <h4 class="font-medium text-gray-900">{{ task.title }}</h4>
              <p class="text-sm text-gray-500 mt-1 line-clamp-2">{{ task.description }}</p>
            </div>

            <div class="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
              <span class="text-xs text-gray-400">#{{ task.id }}</span>
              <div v-if="task.assignee" class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold" :title="`Ditugaskan ke: ${task.assignee.name}`">
                {{ task.assignee.name.charAt(0).toUpperCase() }}
              </div>
              <div v-else class="w-6 h-6 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-400" title="Belum ditugaskan">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
            </div>
          </div>
          <div v-if="inProgressTasks.length === 0" class="text-sm text-gray-400 text-center py-4 border-2 border-dashed border-blue-200 rounded-lg">Kosong</div>
        </div>
      </div>

      <div
          class="min-w-[300px] flex-1 bg-green-50 rounded-xl p-4 flex flex-col h-full min-h-[500px] transition-colors"
          @drop="onDrop($event, 'done')"
          @dragover.prevent
          @dragenter.prevent
      >
        <h3 class="font-bold text-green-800 mb-4 flex items-center justify-between">
          <span>Done</span>
          <span class="bg-green-200 text-green-800 px-2 py-0.5 rounded text-xs">{{ doneTasks.length }}</span>
        </h3>
        <div class="space-y-3 flex-1">
          <div
              v-for="task in doneTasks"
              :key="task.id"
              draggable="true"
              @dragstart="startDrag($event, task)"
              @click="openEditModal(task)"
              class="bg-white p-4 rounded-lg shadow-sm border border-green-100 cursor-grab active:cursor-grabbing hover:border-green-300 opacity-75 transition-colors flex flex-col gap-2"
          >
            <div>
              <h4 class="font-medium text-gray-900 line-through">{{ task.title }}</h4>
              <p class="text-sm text-gray-500 mt-1 line-clamp-2">{{ task.description }}</p>
            </div>

            <div class="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
              <span class="text-xs text-gray-400">#{{ task.id }}</span>
              <div v-if="task.assignee" class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold" :title="`Ditugaskan ke: ${task.assignee.name}`">
                {{ task.assignee.name.charAt(0).toUpperCase() }}
              </div>
              <div v-else class="w-6 h-6 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-400" title="Belum ditugaskan">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
            </div>
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

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
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
            <label class="block text-sm font-medium text-gray-700 mb-1">Penerima Tugas</label>
            <select
                v-model="taskForm.assignee_id"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option :value="null">-- Belum Ada --</option>
              <option v-for="member in members" :key="member.id" :value="member.id">
                {{ member.name }}
              </option>
            </select>
          </div>
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
