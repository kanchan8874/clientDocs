import apiClient from './client.js';



export const register = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  return response;
};

export const login = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get('/auth/me');
  return response;
};

export const logout = async () => {
  try {
    const response = await apiClient.post('/auth/logout');
    return response;
  } catch (error) {
    // Even if API call fails, we should still clear local storage
    // This handles cases where token is already expired or invalid
    throw error;
  }
};

export const getUserByEmail = async (email) => {
  const response = await apiClient.get(`/auth/user/${encodeURIComponent(email)}`);
  return response;
};

export const getAllUsers = async () => {
  const response = await apiClient.get('/auth/users');
  return response;
};
