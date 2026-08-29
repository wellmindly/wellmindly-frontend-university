import axios from 'axios';

let rawApiUrl = import.meta.env.VITE_API_URL || 'https://api.wellmindly.com/api';
if (rawApiUrl.endsWith('/')) rawApiUrl = rawApiUrl.slice(0, -1);
if (!rawApiUrl.endsWith('/api')) rawApiUrl += '/api';

const api = axios.create({
  baseURL: rawApiUrl,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Pull a displayable string out of an axios error. The API answers in two shapes:
 * the v1 routes and the global error handler send `{ error: { code, message } }`,
 * the older routes send `{ error: "text" }`. Rendering the object form directly
 * makes React throw "Objects are not valid as a React child".
 */
export const apiErrorMessage = (err: unknown, fallback: string): string => {
  const payload = (err as { response?: { data?: { error?: unknown; message?: unknown } } })?.response?.data;
  const error = payload?.error;

  if (typeof error === 'string' && error.trim()) return error;
  if (error && typeof error === 'object') {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  if (typeof payload?.message === 'string' && payload.message.trim()) return payload.message;

  return fallback;
};

export default api;
