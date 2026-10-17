

import axios from 'axios';

export function getBackendUrl(): string {
    const url = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'https://notagest-0o2r.onrender.com';
    return url.replace(/\/+$/, '');
}

const api = axios.create({
    baseURL: getBackendUrl(), 
});

api.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config; 
    },
    (error) => {
        return Promise.reject(error);
    }
);


export default api;