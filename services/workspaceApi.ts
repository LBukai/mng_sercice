// services/workspaceApi.ts
import { Workspace } from '@/types/workspace';

export const workspaceApiService = {
  // Get workspaces for a project
  getProjectWorkspaces: async (projectId: string): Promise<Workspace[]> => {
    const response = await fetch(`/api/projects/${projectId}/workspaces`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch project workspaces: ${response.statusText}`);
    }

    return response.json();
  },

  // Add workspaces to a project
  addWorkspacesToProject: async (projectId: string, workspacesData: Workspace[]): Promise<void> => {
    const response = await fetch(`/api/projects/${projectId}/workspaces`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workspacesData),
    });

    if (!response.ok) {
      throw new Error(`Failed to add workspaces to project: ${response.statusText}`);
    }
  },
};