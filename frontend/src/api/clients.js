//Yeh file clients ke liye sabhi API calls define karti hai.
import apiClient from './client.js';  // Axios instance (token handling ke saath)


export const getClients = async () => {
  const response = await apiClient.get('/clients');
  return response;
};


export const getClient = async (clientId) => {
  // GET request - /api/clients/:id endpoint pe
  const response = await apiClient.get(`/clients/${clientId}`);
  return response;
};


export const createClient = async (clientData) => {
  // POST request - /api/clients endpoint pe
  // clientData - request body me bhejenge
  const response = await apiClient.post('/clients', clientData);
  return response;
};


export const updateClient = async (clientId, clientData) => {
  // PUT request - /api/clients/:id endpoint pe
  // clientData - request body me bhejenge
  const response = await apiClient.put(`/clients/${clientId}`, clientData);
  return response;
};

export const deleteClient = async (clientId) => {
  // DELETE request - /api/clients/:id endpoint pe
  const response = await apiClient.delete(`/clients/${clientId}`);
  return response;
};
