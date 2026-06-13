import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore()

    const publicRoutes = ['/login', '/register']
    const isPublicRoute = publicRoutes.includes(to.path)

    if (!authStore.isLoggedIn && !isPublicRoute) {
        return navigateTo('/login')
    }

    if (authStore.isLoggedIn && isPublicRoute) {
        return navigateTo('/')
    }
})