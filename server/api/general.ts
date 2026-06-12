
import { getCookie, readBody, setResponseHeaders, createError } from 'h3'
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const backendUrl = config.public.apiBase || 'http://127.0.0.1:8000/api/'
    const body = await readBody(event)

    const isBlob = body.responseType === 'blob'

    const authToken = getCookie(event, 'auth_token')
    const workspaceId = getCookie(event, 'active_workspace_id')

    const headers: Record<string, string> = {}

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
    }

    if (workspaceId) {
        headers['X-Workspace-ID'] = workspaceId
    }

    if (!isBlob) {
        headers['Accept'] = 'application/json'
    }

    const cleanEndpoint = body.endpoint.replace(/^\/+/, '')

    const safeBackendUrl = backendUrl.replace(/\/$/, '')

    const response = await $fetch.raw(`${safeBackendUrl}/${cleanEndpoint}`, {
        headers,
        method: body.method || 'POST',
        body: body.method === 'GET' ? null : (body.embodied ? body.body : body),
        params: body.params,
        responseType: body.responseType,
        ignoreResponseError: true,
    })

    if (response.status >= 400) {
        let errorData = response._data
        if (isBlob) {
            const raw = errorData instanceof Blob
                ? await errorData.text()
                : Buffer.isBuffer(errorData)
                    ? errorData.toString('utf-8')
                    : null
            if (raw) {
                try {
                    errorData = JSON.parse(raw)
                }
                catch {
                    errorData = { message: raw }
                }
            }
        }
        throw createError({
            statusCode: response.status,
            statusMessage: response.statusText || 'Unknown Error',
            data: errorData,
        })
    }

    if (isBlob) {
        const contentDisposition = response.headers.get('content-disposition') || ''
        const contentType = response.headers.get('content-type') || 'application/octet-stream'

        setResponseHeaders(event, {
            'Content-Disposition': contentDisposition,
            'Content-Type': contentType,
        })

        if (response._data instanceof Blob) {
            return Buffer.from(await response._data.arrayBuffer())
        }
    }

    return response._data
})