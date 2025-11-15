import axios from 'axios'
import { auth } from './firebase'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

// Add request interceptor to include Firebase token
api.interceptors.request.use(
  async (config) => {
    try {
      // Get current user and token
      const user = auth.currentUser
      if (user) {
        const token = await user.getIdToken()
        config.headers.Authorization = `Bearer ${token}`
      } else {
        // Try to get token from localStorage as fallback
        const storedToken = localStorage.getItem('firebase_token')
        if (storedToken) {
          config.headers.Authorization = `Bearer ${storedToken}`
        }
      }
    } catch (error) {
      console.error('Error getting Firebase token:', error)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default api
