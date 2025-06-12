// types/workspaceUser.ts
import { User } from './user';

export interface WorkspaceUser {
  id?: number;
  user: User;
  workspaceId: number;
  role?: string;
}

export interface UserAndRole {
  userId: string;
  role?: string;
}

export type WorkspaceRole = 'Admin' | 'Member' | 'Viewer';