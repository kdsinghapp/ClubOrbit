import axios from 'axios';
import { API_BASE_URL, SEARCH_BASE_URL, CHAT_BASE_URL } from '../config/api';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../firebase';

export const playerApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const searchApiClient = axios.create({
  baseURL: SEARCH_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatApiClient = axios.create({
  baseURL: CHAT_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const addAuthToken = async (config) => {
  const user = auth.currentUser;

  if (user) {
    try {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
      localStorage.setItem('authToken', token);
    } catch {
      // Fallback to localStorage token if available.
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } else {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
};

const handleApiError = async (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('authToken');
    if (auth.currentUser) {
      try {
        await firebaseSignOut(auth);
      } catch {
        // ignore signout error
      }
    }
  }
  return Promise.reject(error);
};

playerApiClient.interceptors.request.use(addAuthToken);
searchApiClient.interceptors.request.use(addAuthToken);
chatApiClient.interceptors.request.use(addAuthToken);

playerApiClient.interceptors.response.use((response) => response, handleApiError);
searchApiClient.interceptors.response.use((response) => response, handleApiError);
chatApiClient.interceptors.response.use((response) => response, handleApiError);

export default playerApiClient;
