import { playerApiClient } from './apiClient';

export const loginApi = {
  async loginUser(credentials) {
    const response = await playerApiClient.post('/auth/login', credentials);
    return response.data;
  },

  async registerUser(userData) {
    const response = await playerApiClient.post('/auth/register', userData);
    return response.data;
  },

  async refreshToken() {
    const response = await playerApiClient.post('/auth/refresh');
    return response.data;
  },

  async logoutUser() {
    const response = await playerApiClient.post('/auth/logout');
    return response.data;
  },

  async getCurrentUser() {
    const response = await playerApiClient.get('/auth/me');
    return response.data;
  }
};
