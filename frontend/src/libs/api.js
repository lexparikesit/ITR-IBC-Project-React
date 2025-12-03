import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://api-ibc.itr-compass.co.id/api',
    timeout: 60000,
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
