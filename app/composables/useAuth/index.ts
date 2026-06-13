import { useGeneralAPI } from '~/composables/useGeneralApi'
import { useAuthStore } from '~/stores/auth'

export const useAuthApi = () => {
    const { generalAPI, loading, error } = useGeneralAPI()
    const authStore = useAuthStore()

    const login = async (credentials: Record<string, string>) => {
        try {
            const response: any = await generalAPI({
                endpoint: 'login',
                method: 'POST',
                embodied: true,
                body: credentials
            })

            const userData = response.data?.user || response.user
            const tokenData = response.data?.token || response.token

            if (tokenData && userData) {
                authStore.loginSuccess(userData, tokenData)
                navigateTo('/')
            }

            return response
        } catch (e) {
            console.error('Login Error:', e)
            throw e
        }
    }

    const register = async (data: Record<string, string>) => {
        try {
            const response: any = await generalAPI({
                endpoint: 'register',
                method: 'POST',
                embodied: true,
                body: data,
            })

            const userData = response.data?.user || response.user
            const tokenData = response.data?.token || response.token

            if (tokenData && userData) {
                authStore.loginSuccess(userData, tokenData)
                navigateTo('/')
            } else {
                navigateTo('/login')
            }

            return resposne
        } catch (e) {
            console.error('Register Error:', e)
            throw e
        }
    }

    const logout = async () => {
        try {
            await generalAPI({
                endpoint: 'logout',
                method: 'POST',
            })

        } catch (error) {
            console.error('Logout Error:', error)

        } finally {
            authStore.logout()
            navigateTo('/login')
        }
    }

    return {
        login,
        register,
        logout,
        loading,
        error
    }
}