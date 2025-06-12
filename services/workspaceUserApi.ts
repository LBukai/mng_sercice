// services/workspaceUserApi.ts
import { WorkspaceUser, UserAndRole } from '@/types/workspaceUser';
import authApiService from './authApi';

const API_BASE_URL = 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = authApiService.getAccessToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const getWorkspaceUsers = async (workspaceId: number): Promise<WorkspaceUser[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/users`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch workspace users: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching workspace users:', error);
    throw error;
  }
};

export const addUsersToWorkspace = async (workspaceId: number, users: UserAndRole[]): Promise<void> => {
  try {
    // Format the request body according to the API spec
    const formattedUsers = users.map(user => ({
      user_id: user.userId,
      // Include role if provided
      ...(user.role ? { role: user.role } : {})
    }));

    const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(formattedUsers),
    });

    if (!response.ok) {
      throw new Error(`Failed to add users to workspace: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error adding users to workspace:', error);
    throw error;
  }
};

export const removeUserFromWorkspace = async (workspaceId: number, userId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to remove user from workspace: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error removing user from workspace:', error);
    throw error;
  }
};

export const updateWorkspaceUserRole = async (workspaceId: number, userId: string, role: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/users/${userId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user role: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};