import { ref } from 'vue'
import { useGeneralAPI } from '~/composables/useGeneralApi'
import type {Task} from "~/types/task";


export const useTaskApi = () => {
    const { generalAPI, loading, error } = useGeneralAPI()
    const tasks = ref<Task[]>([])

    const fetchTasks = async (projectId: string | number) => {
        try {
            const response = await generalAPI<{ data: Task[] } | Task[]>({
                endpoint: `projects/${projectId}/tasks`,
                method: 'GET'
            })

            tasks.value = ('data' in response ? response.data : response) as Task[]
            return tasks.value
        } catch (e) {
            console.error('Gagal mengambil data tugas:', e)
            throw e
        }
    }

    const createTask = async (projectId: string | number, data: { title: string; description?: string; status?: string; assignee_id?: string }) => {
        try {
            const response = await generalAPI<{ data: Task } | Task>({
                endpoint: `projects/${projectId}/tasks`,
                method: 'POST',
                embodied: true,
                body: data
            })

            await fetchTasks(projectId)
            return ('data' in response ? response.data : response) as Task
        } catch (e) {
            console.error('Gagal membuat tugas:', e)
            throw e
        }
    }

    const updateTask = async (projectId: string | number, taskId: string | number, data: { title?: string; description?: string; status?: string; assignee_id?: string }) => {
        try {
            const response = await generalAPI<{ data: Task } | Task>({
                endpoint: `projects/${projectId}/tasks/${taskId}`,
                method: 'PUT',
                embodied: true,
                body: data
            })

            await fetchTasks(projectId)
            return ('data' in response ? response.data : response) as Task
        } catch (e) {
            console.error('Gagal memperbarui tugas:', e)
            throw e
        }
    }

    const deleteTask = async (projectId: string | number, taskId: string | number) => {
        try {
            await generalAPI({
                endpoint: `projects/${projectId}/tasks/${taskId}`,
                method: 'DELETE'
            })

            await fetchTasks(projectId)
        } catch (e) {
            console.error('Gagal menghapus tugas:', e)
            throw e
        }
    }

    return {
        tasks,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        loading,
        error
    }
}