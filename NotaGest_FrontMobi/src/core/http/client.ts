import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { env } from '../config/env';
import { HttpHeader } from '../constants/enums';
import { SecureStorageService } from '../storage/secureStorage';

export const httpClient: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
});

httpClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStorageService.getToken();
    if (token && config.headers) {
      config.headers.set(HttpHeader.Authorization, `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);
