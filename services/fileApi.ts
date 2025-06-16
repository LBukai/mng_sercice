import { ProjectFile } from '../types/file';
import authApiService from './authApi';

const API_BASE_URL = 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = authApiService.getAccessToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const fileApiService = {
  getProjectFiles: async (projectId: string): Promise<ProjectFile[]> => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/files`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch project files: ${response.statusText}`);
    }

    return response.json();
  },
  
  uploadFile: async (projectId: string, file: File, ttl?: string): Promise<ProjectFile> => {
    const formData = new FormData();
    
    // Add the file
    formData.append('files', file);
    
    // Format TTL or use default (1 year from now)
    const defaultTtl = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Add the metadata as a JSON string
    const metadata = [{
      name: file.name,
      ttl: ttl || defaultTtl
    }];
    
    formData.append('metadata', JSON.stringify(metadata));
    
    // For FormData uploads, we need to omit the Content-Type header
    const headers: HeadersInit = {
      'Authorization': authApiService.getAccessToken() ? `Bearer ${authApiService.getAccessToken()}` : '',
    };
    console.log("hello upload", projectId, formData);
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/files`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }

    return response.json();
  },
  
  deleteFile: async (projectId: string, fileId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/files/${fileId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }
  },
};