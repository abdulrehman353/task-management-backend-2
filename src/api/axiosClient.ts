import axios from 'axios';

// Backend Cloudflare Tunnel URL
const axiosClient = axios.create({
  baseURL: 'https://this-painting-steve-institution.trycloudflare.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-attach JWT Token to every request if user is logged in
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;