'use client';
import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5014',
});

// Добавляем access токен в каждый запрос
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Перехватываем ошибки и обновляем токен
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Если access токен истёк
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const res = await axios.post('http://localhost:5014/account/refresh', refreshToken, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                // Обновляем токены
                localStorage.setItem('accessToken', res.data.accessToken);
                localStorage.setItem('refreshToken', res.data.refreshToken);

                // Повторяем исходный запрос с новым токеном
                originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
                return API(originalRequest);
            } catch (refreshError) {
                console.error('Ошибка при обновлении токена:', refreshError);
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default API;
