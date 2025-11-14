import apiClient from './client.js';



export const getDocuments = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      params.append(key, filters[key]);
    }
  });
  
  const response = await apiClient.get(`/documents?${params.toString()}`);
  return response;
};

export const getDocument = async (documentId) => {
  const response = await apiClient.get(`/documents/${documentId}`);
  return response;
};

export const uploadDocument = async (formData) => {
  const response = await apiClient.post('/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response;
};

export const updateDocument = async (documentId, documentData) => {
  const response = await apiClient.put(`/documents/${documentId}`, documentData);
  return response;
};

export const deleteDocument = async (documentId) => {
  const response = await apiClient.delete(`/documents/${documentId}`);
  return response;
};

export const shareDocument = async (documentId, userIds) => {
  const response = await apiClient.post(`/documents/${documentId}/share`, { userIds });
  return response;
};

export const downloadDocument = async (documentId) => {
  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const response = await fetch(
    `${apiUrl}/api/documents/${documentId}/download`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Download failed');
  }
  
  // Get filename from Content-Disposition header or use documentId
  const contentDisposition = response.headers.get('Content-Disposition');
  let filename = documentId;
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].replace(/['"]/g, '');
    }
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
