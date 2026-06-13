import { defineStore } from 'pinia'
import type { User } from '~/types'

export const useAuthStore = defineStore('auth', () => {
    const token = useCookie<string | null>('auth_token', { default: () => null })
    const user = useCookie<User | null>('auth_user', { default: () => null })
    const activeWorkspaceId = useCookie<number | null>('active_workspace_id', { default: () => null })

    const isLoggedIn = computed(() => !!token.value)

    function loginSuccess(userData: any, userToken: string) {
        user.value = userData
        token.value = userToken

        if (userData.workspaces && userData.workspaces.length > 0) {
            activeWorkspaceId.value = userData.workspaces[0].id
        }
    }

    function logout() {
        token.value = null
        user.value = null
        activeWorkspaceId.value = null
    }

    function setActiveWorkspace(workspaceId: number) {
        activeWorkspaceId.value = workspaceId
    }

    return {
        token,
        user,
        activeWorkspaceId,
        isLoggedIn,
        loginSuccess,
        logout,
        setActiveWorkspace
    }
})