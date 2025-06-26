import { User } from '@/types/user';

export type ProjectRole = 'Project Lead' | 'User' /*| 'admin' | 'viewer'*/;

export interface ProjectRoleDefinition {
  role: ProjectRole;
}

export interface UserAndRole {
  user?: User;
  user_id?: string;
  role: ProjectRoleDefinition | ProjectRole;
}

export interface ProjectUser {
  user: User;
  role: ProjectRoleDefinition;
}