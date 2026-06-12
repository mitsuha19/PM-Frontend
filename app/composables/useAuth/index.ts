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



    return {
        login,
        loading,
        error
    }
}