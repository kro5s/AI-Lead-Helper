import axios from 'axios';
import { AUTH_UNAUTHORIZED_EVENT } from '../constants/auth';
import { clearAccessToken, getAccessToken } from '../utils/auth';

export const API_BASE_URL = 'http://localhost:8000';

export const API_CLIENT = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

API_CLIENT.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API_CLIENT.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearAccessToken();
      window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
    }

    return Promise.reject(error);
  },
);
