export interface Workspace {
  id?: string;
  name: string;
  slug?: string;
  project?: string;
  prompt?: string;
  temperature?: number;
  model?: {
    id: number;
    name: string;
  };
}