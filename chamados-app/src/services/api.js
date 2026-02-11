import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your Laravel server IP/URL
// For Android emulator use 10.0.2.2, for iOS simulator use localhost
// For physical device use your computer's local IP
const BASE_URL = 'http://192.168.100.64:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor to add auth token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle 401 responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'user']);
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authService = {
  login: (email, password) =>
    api.post('/login', { email, password, device_name: 'react-native-app' }),

  register: (name, email, password, password_confirmation) =>
    api.post('/register', { name, email, password, password_confirmation }),

  logout: () => api.post('/logout'),

  me: () => api.get('/me'),
};

// Ticket endpoints
export const ticketService = {
  list: (params = {}) => api.get('/tickets', { params }),

  show: (id) => api.get(`/tickets/${id}`),

  create: (data) => api.post('/tickets', data),

  update: (id, data) => api.put(`/tickets/${id}`, data),

  updateStatus: (id, status) => api.patch(`/tickets/${id}/status`, { status }),

  delete: (id) => api.delete(`/tickets/${id}`),
};

export const setBaseURL = (url) => {
  api.defaults.baseURL = url;
};

export default api;
