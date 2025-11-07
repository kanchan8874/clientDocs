/**
 * CLIENTS.JS - Clients API Service
 * 
 * Yeh file clients ke liye sabhi API calls define karti hai.
 * 
 * Functions:
 * - getClients() - Sabhi clients fetch karta hai
 * - getClient() - Ek client fetch karta hai (ID se)
 * - createClient() - Naya client create karta hai
 * - updateClient() - Client update karta hai
 * - deleteClient() - Client delete karta hai
 * 
 * Flow:
 * 1. apiClient use karke backend API ko call karta hai
 * 2. Token automatically add hota hai (apiClient interceptor se)
 * 3. Response/Error return karta hai
 */

import apiClient from './client.js';  // Axios instance (token handling ke saath)

/**
 * getClients() - Sabhi Clients Fetch Karna
 * 
 * Backend API: GET /api/clients
 * 
 * Flow:
 * 1. GET request bhejo /api/clients pe
 * 2. Backend se clients list milegi
 * 3. Response return karo
 * 
 * @returns {Promise} Clients list
 */
export const getClients = async () => {
  // GET request - /api/clients endpoint pe
  // Token automatically add hoga (interceptor se)
  const response = await apiClient.get('/clients');
  return response;
};

/**
 * getClient() - Ek Client Fetch Karna (ID se)
 * 
 * Backend API: GET /api/clients/:id
 * 
 * Flow:
 * 1. GET request bhejo /api/clients/:id pe
 * 2. Backend se specific client milega
 * 3. Response return karo
 * 
 * @param {string} clientId - Client ka ID
 * @returns {Promise} Client data
 */
export const getClient = async (clientId) => {
  // GET request - /api/clients/:id endpoint pe
  const response = await apiClient.get(`/clients/${clientId}`);
  return response;
};

/**
 * createClient() - Naya Client Create Karna
 * 
 * Backend API: POST /api/clients
 * 
 * Flow:
 * 1. POST request bhejo /api/clients pe (client data ke saath)
 * 2. Backend me client create hoga
 * 3. Created client data return hoga
 * 
 * @param {Object} clientData - Client data (name, email, phone, etc.)
 * @returns {Promise} Created client data
 */
export const createClient = async (clientData) => {
  // POST request - /api/clients endpoint pe
  // clientData - request body me bhejenge
  const response = await apiClient.post('/clients', clientData);
  return response;
};

/**
 * updateClient() - Client Update Karna
 * 
 * Backend API: PUT /api/clients/:id
 * 
 * Flow:
 * 1. PUT request bhejo /api/clients/:id pe (updated data ke saath)
 * 2. Backend me client update hoga
 * 3. Updated client data return hoga
 * 
 * @param {string} clientId - Client ka ID
 * @param {Object} clientData - Updated client data
 * @returns {Promise} Updated client data
 */
export const updateClient = async (clientId, clientData) => {
  // PUT request - /api/clients/:id endpoint pe
  // clientData - request body me bhejenge
  const response = await apiClient.put(`/clients/${clientId}`, clientData);
  return response;
};

/**
 * deleteClient() - Client Delete Karna
 * 
 * Backend API: DELETE /api/clients/:id
 * 
 * Flow:
 * 1. DELETE request bhejo /api/clients/:id pe
 * 2. Backend me client delete hoga
 * 3. Success response return hoga
 * 
 * @param {string} clientId - Client ka ID
 * @returns {Promise} Success response
 */
export const deleteClient = async (clientId) => {
  // DELETE request - /api/clients/:id endpoint pe
  const response = await apiClient.delete(`/clients/${clientId}`);
  return response;
};
