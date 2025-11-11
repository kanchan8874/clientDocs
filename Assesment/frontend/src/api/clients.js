import apiClient from './client.js';

/**
 * Clients API Service
 * 
 * Functions for client management:
 * - Get all clients
 * - Get single client
 * - Create client
 * - Update client
 * - Delete client
 */

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
