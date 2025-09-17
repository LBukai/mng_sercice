export interface Workspace {
  id?: string;
  name: string;
  slug?: string;
  project?: string;
  project_id?: string;
  prompt?: string;
  temperature?: number;
  model?: {
    id: number;
    name: string;
  };
}