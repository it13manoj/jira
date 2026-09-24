import api from '../api/axios' // Import your Axios interceptor

export const loginUser = async (email, password) => {
  const response = await api.post('/login', { username: email, password })
  if (response.data.token) {
    localStorage.setItem('token', response.data.token)
  }
  return response.data
}

export const registerUser = async (fullName, email, password) => {
  const response = await api.post('/register', {
    name: fullName,
    username: email,
    password: password
  })
  return response.data
}
