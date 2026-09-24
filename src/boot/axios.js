import { boot } from 'quasar/wrappers'
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.API_URL || 'https://api.wdpcare.com/api/v1'
})

api.interceptors.request.use(
  config => {
    const publicEndpoints = ['/auth/login', '/auth/signup']
    const isPublic = publicEndpoints.some(url => config.url?.includes(url))

    if (!isPublic) {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
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
