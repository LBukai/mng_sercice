// types/archgpt.ts
export interface ArchGPTMode {
  modes: string[];
}

export interface ArchGPTWorkspaceRequest {
  workspace: {
    name: string;
    prompt: string;
  };
  mode: string;
  model_id: number;
}