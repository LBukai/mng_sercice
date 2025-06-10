// types/projectUser.ts
import { User } from '@/types/user';

export type ProjectRole = 'Project Lead' | 'User';

export interface ProjectRoleDefinition {
  role: string;
}

export interface UserAndRole {
  user?: User;
  user_id?: string;
  role: ProjectRole;
}

export interface ProjectUser {
  user: User;
  role: ProjectRole;
}