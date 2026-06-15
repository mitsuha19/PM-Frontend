import { ref } from 'vue'
import { useGeneralAPI } from '~/composables/useGeneralApi'
import type { Workspace } from '~/types'
import { useAuthStore } from '~/stores/auth'

export const useWorkspaceApi = () => {
    const { generalAPI, loading, error } = useGeneralAPI()
    const authStore = useAuthStore()

    const workspaces = ref<Workspace[]>([])

    const fetchWorkspaces = async () => {
        try {
            const response: any = await generalAPI({
                endpoint: 'workspace',
                method: 'GET'
            })

            workspaces.value = response.data || response

            if (workspaces.value.length > 0 && !authStore.activeWorkspaceId) {
                authStore.setActiveWorkspace(workspaces.value[0].id)
            }

            const isCurrentValid = workspaces.value.find(w => w.id === authStore.activeWorkspaceId)
            if (!isCurrentValid && workspaces.value.length > 0) {
                authStore.setActiveWorkspace(workspaces.value[0].id)
            }

            return workspaces.value
        } catch (e) {
            console.error('Gagal mengambil data workspace:', e)
            throw e
        }
    }

    const createWorkspace = async (data: { name: string; description?: string }) => {
        try {
            const response: any = await generalAPI({
                endpoint: 'workspace',
                method: 'POST',
                embodied: true,
                body: data
            })

            await fetchWorkspaces()
            const createdWorkspace = response.data || response
            if (createdWorkspace && createdWorkspace.id) {
                authStore.setActiveWorkspace(createdWorkspace.id)
            }

            return createdWorkspace
        } catch (e) {
            console.error('Gagal membuat workspace:', e)
            throw e
        }
    }

    const updateWorkspace = async (workspaceId: number | string, data: { name: string; description? : string }) => {
        try {
            const response: any = await generalAPI({
                endpoint: 'workspace',
                method: 'PUT',
                embodied: true,
                body: data
            })

            await fetchWorkspaces()
            return response.data || response
        } catch (e) {
            console.error('Gagal mengambil data workspace:', e)
            throw e
        }
    }

    const deleteWorkspace = async (workspaceId: number | string) => {
        try {
            await generalAPI({
                endpoint: 'workspace',
                method: 'DELETE',
            })

            await fetchWorkspaces()

            if ( authStore.activeWorkspaceId === Number(workspaceId)) {
                if(workspaces.value.length > 0) {
                    authStore.setActiveWorkspace(workspaces.value[0].id)
                } else {
                    authStore.setActiveWorkspace(null as any)
                }
            }
        } catch (e) {
            console.error('Gagal mengambil data workspace:', e)
            throw e
        }
    }

    return {
        workspaces,
        fetchWorkspaces,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
        loading,
        error
    }
}