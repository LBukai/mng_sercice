// services/workspaceApi.ts
import { Workspace } from '@/types/workspace';
import { ArchGPTMode, ArchGPTWorkspaceRequest } from '@/types/archgpt';

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

  // Get ArchGPT modes
  getArchGPTModes: async (): Promise<string[]> => {
    const response = await fetch('/api/archgpt/modes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ArchGPT modes: ${response.statusText}`);
    }

    const data: ArchGPTMode = await response.json();
    return data.modes;
  },

  // Create ArchGPT workspace
  createArchGPTWorkspace: async (projectId: string, workspaceData: ArchGPTWorkspaceRequest): Promise<void> => {
    const response = await fetch(`/api/projects/${projectId}/archgptworkspaces`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workspaceData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create ArchGPT workspace: ${response.statusText}`);
    }
  },
};