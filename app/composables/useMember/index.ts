import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useGeneralAPI } from '~/composables/useGeneralApi'
import type {WorkspaceMember} from "~/types/member";


export const useMemberApi = () => {
    const { generalAPI, loading, error } = useGeneralAPI()
    const members = ref<WorkspaceMember[]>([])

    const fetchMembers = async () => {
        try {
            const response: any = await generalAPI({
                endpoint: 'workspace-members',
                method: 'GET'
            })

            members.value = response.data || response
            return members.value
        } catch (e) {
            console.error('Gagal mengambil data anggota:', e)
            throw e
        }
    }

    const addMember = async (data: { email: string; role: string }) => {
        try {
            const response: any = await generalAPI({
                endpoint: 'workspace-members',
                method: 'POST',
                embodied: true,
                body: data
            })

            await fetchMembers()
            return response.data || response
        } catch (e) {
            console.error('Gagal menambah anggota:', e)
            throw e
        }
    }
    const acceptInvitation = async (token: string) => {
        const authStore = useAuthStore()
        loading.value = true
        error.value = null
        try {
            const response: any = await generalAPI({
                endpoint: `invitations/${token}/accept`,
                method: 'POST'
            })
            if (response?.data?.id) {
                authStore.setActiveWorkspace(response.data.id)
            }

            return response
        } catch (e: any) {
            error.value = e
            throw e
        } finally {
            loading.value = false
        }
    }


    return {
        members,
        fetchMembers,
        addMember,
        acceptInvitation,
        loading,
        error
    }
}