import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Backend Cloudflare Tunnel URL
const axiosClient = axios.create({
  baseURL: 'https://formats-selection-cloud-finds.trycloudflare.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-attach JWT Token to every request if user is logged in
axiosClient.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error reading auth token from storage:', error);
  }
  return config;
});

export default axiosClient;