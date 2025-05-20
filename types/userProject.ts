// types/userProject.ts
import { Project } from '@/types/project';
import { ProjectRole } from '@/types/projectUser';

export interface UserProject {
  project: Project;
  role: ProjectRole | string;
}