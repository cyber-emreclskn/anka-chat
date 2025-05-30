import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
};

// Server services
export const serverService = {
  getServers: async () => {
    const response = await api.get('/servers');
    return response.data;
  },
  getServer: async (id) => {
    const response = await api.get(`/servers/${id}`);
    return response.data;
  },
  createServer: async (serverData) => {
    const response = await api.post('/servers', serverData);
    return response.data;
  },
  updateServer: async (id, serverData) => {
    const response = await api.put(`/servers/${id}`, serverData);
    return response.data;
  },
  deleteServer: async (id) => {
    const response = await api.delete(`/servers/${id}`);
    return response.data;
  },
};

// Channel services
export const channelService = {
  getChannels: async (serverId) => {
    const response = await api.get(`/channels/server/${serverId}`);
    return response.data;
  },
  getChannel: async (id) => {
    const response = await api.get(`/channels/${id}`);
    return response.data;
  },
  createChannel: async (channelData) => {
    const response = await api.post('/channels', channelData);
    return response.data;
  },
  updateChannel: async (id, channelData) => {
    const response = await api.put(`/channels/${id}`, channelData);
    return response.data;
  },
  deleteChannel: async (id) => {
    const response = await api.delete(`/channels/${id}`);
    return response.data;
  },
};

// Message services
export const messageService = {
  getMessages: async (channelId, limit = 50, offset = 0) => {
    const response = await api.get(`/messages/channel/${channelId}?limit=${limit}&offset=${offset}`);
    return response.data;
  },
  createMessage: async (messageData) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },
  updateMessage: async (id, messageData) => {
    const response = await api.put(`/messages/${id}`, messageData);
    return response.data;
  },
  deleteMessage: async (id) => {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  },
};

export default api;
