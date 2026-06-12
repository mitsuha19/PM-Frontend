import type { FetchError } from 'ofetch'
import { useAuthStore } from '~/stores/auth'

interface GeneralApiError {
    statusCode: number
    message: string
}

interface GeneralApiRequest {
    endpoint: string
    method?: string
    embodied?: boolean
    body?: unknown
    params?: Record<string, any>
    responseType?: string
}

export const useGeneralAPI = () => {
    const loading = ref(false)
    const error = ref<GeneralApiError | null>(null)
    const authStore = useAuthStore()

    async function handleFetchError(e: FetchError) {
        loading.value = false
        let message = e.message || e.statusMessage || 'Unknown error'

        if (e.data instanceof Blob) {
            try {
                const text = await e.data.text()
                const parsed = JSON.parse(text)
                message = parsed?.data?.message || parsed?.message || message
            } catch {}
        } else {
            message = e.data?.data?.message || e.data?.message || message
        }

        error.value = {
            statusCode: e.statusCode ?? 500,
            message,
        }

        if (e.statusCode === 401) {
            authStore.logout()
            navigateTo('/login')
        }

        throw e
    }

    const generalAPI = async (request: GeneralApiRequest) => {
        loading.value = true
        error.value = null

        if (request.responseType === 'blob') {
            const raw = await $fetch.raw('/api/general', {
                method: 'POST',
                body: request,
                responseType: 'blob',
            }).catch(handleFetchError)

            loading.value = false

            const contentDisposition = raw.headers.get('content-disposition') || ''
            const match = contentDisposition.match(/filename="?([^"]+)"?/)
            const filename = match?.[1] ?? null

            return { data: raw._data, filename }
        }

        const response = await $fetch('/api/general', {
            method: 'POST',
            body: request,
            ...(request.responseType ? { responseType: request.responseType } : {}),
        }).catch(handleFetchError)

        loading.value = false

        return response
    }

    return {
        generalAPI,
        loading,
        error,
    }
}