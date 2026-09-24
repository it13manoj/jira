import { boot } from 'quasar/wrappers'
import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1'
})

// Axios Request Interceptor to attach auth headers dynamically
api.interceptors.request.use(
  config => {
    // 1. Skip adding Token for Public Endpoints (Login / Signup)
    const publicEndpoints = [
      '/auth/login',
      '/auth/signup',
      '/auth/login',
      '/auth/signup'
    ]
    const isPublic = publicEndpoints.some(url => config.url?.includes(url))

    if (!isPublic) {
      const token = localStorage.getItem('token') // Change 'token' to your localStorage key name
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    // 2. Automatically handle Multipart / File Upload Content-Type
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data'
    }

    return config
  },
  error => Promise.reject(error)
)

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
