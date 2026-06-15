import { ref } from 'vue'
import type { Project } from '~/types'
import { useGeneralAPI } from '~/composables/useGeneralApi'

export const useProjectApi = () => {
    const { generalAPI, loading, error } = useGeneralAPI()
    const projects = ref<Project[]>([])

    const fetchProjects = async () => {
        try {
            const response: any = await generalAPI({
                endpoint: 'project',
                method: 'GET'
            })

            projects.value = response.data || response
            return projects.value
        } catch (e) {
            console.error('Gagal mengambil data proyek:', e)
            throw e
        }
    }

    const createProject = async (data: { name: string; description: string }) => {
        try {
            const response: any = await generalAPI({
                endpoint: 'project',
                method: 'POST',
                embodied: true,
                body: data
            })

            await fetchProjects()
            return response.data || response
        } catch (e) {
            console.error('Gagal membuat proyek:', e)
            throw e
        }
    }

    const updateProject = async (projectId: string | number, data: { name: string; description: string }) => {
        try {
            const response: any = await generalAPI({
                endpoint: `project/${projectId}`,
                method: 'PUT',
                embodied: true,
                body: data
            })

            await fetchProjects()
            return response.data || response
        } catch (e) {
            console.error('Gagal memperbarui proyek:', e)
            throw e
        }
    }

    const deleteProject = async (projectId: string | number) => {
        try {
            await generalAPI({
                endpoint: `project/${projectId}`,
                method: 'DELETE'
            })

            await fetchProjects()
        } catch (e) {
            console.error('Gagal menghapus proyek:', e)
            throw e
        }
    }

    return {
        projects,
        fetchProjects,
        createProject,
        updateProject,
        deleteProject,
        loading,
        error
    }
}