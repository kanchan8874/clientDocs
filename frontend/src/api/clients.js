import apiClient from './client.js';

export const getClients = async () => {
  const response = await apiClient.get('/clients');
  return response;
};

export const getClient = async (clientId) => {
  const response = await apiClient.get(`/clients/${clientId}`);
  return response;
};

export const createClient = async (clientData) => {
  const response = await apiClient.post('/clients', clientData);
  return response;
};

export const updateClient = async (clientId, clientData) => {
  const response = await apiClient.put(`/clients/${clientId}`, clientData);
  return response;
};

export const deleteClient = async (clientId) => {
  const response = await apiClient.delete(`/clients/${clientId}`);
  return response;
};
