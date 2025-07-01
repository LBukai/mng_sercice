import { User } from '@/types/user';

export type ProjectRole = 'Project Lead' | 'User';

export interface ProjectRoleDefinition {
  role: ProjectRole;
}

export interface UserAndRole {
  user?: User;
  user_id?: string;
  role: ProjectRole; // Simplified to just the role string
}

export interface ProjectUser {
  user: User;
  role: ProjectRoleDefinition | ProjectRole; // Can be either format for compatibility
}