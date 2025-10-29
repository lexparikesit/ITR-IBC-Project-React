import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Include credentials (cookies) in requests
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } 
  return config;
}, (error) => {
  return Promise.reject(error);
})

export default apiClient