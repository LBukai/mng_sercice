// services/projectApi.ts
import { Project } from '@/types/project';
import { UserAndRole, ProjectRole, ProjectUser } from '@/types/projectUser';
import authApiService from './authApi';

const API_BASE_URL = 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = authApiService.getAccessToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const projectApiService = {
  // Get all projects
  getProjects: async (): Promise<Project[]> => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    return response.json();
  },

  // Get a project by ID
  getProjectById: async (id: string): Promise<Project> => {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.statusText}`);
    }

    return response.json();
  },

  // Create a new project
  createProject: async (projectData: Omit<Project, 'id'>): Promise<Project> => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create project: ${response.statusText}`);
    }

    return response.json();
  },

  // Update a project
  updateProject: async (id: string, projectData: Partial<Project>): Promise<Project> => {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update project: ${response.statusText}`);
    }

    return response.json();
  },

  // Delete a project
  deleteProject: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete project: ${response.statusText}`);
    }
  },

  // Get users for a project
  getProjectUsers: async (projectId: string): Promise<ProjectUser[]> => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/users`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch project users: ${response.statusText}`);
    }

    return response.json();
  },

  // Add users to a project
  addUsersToProject: async (projectId: string, usersData: UserAndRole[]): Promise<void> => {
    console.log(JSON.stringify(usersData));
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(usersData),
    });

    if (!response.ok) {
      throw new Error(`Failed to add users to project: ${response.statusText}`);
    }
  },

  // Update user role in a project
  updateUserRole: async (projectId: string, userId: string, role: ProjectRole): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/users/${userId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user role: ${response.statusText}`);
    }
  },

  // Remove a user from a project
  removeUserFromProject: async (projectId: string, userId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to remove user from project: ${response.statusText}`);
    }
  }
};