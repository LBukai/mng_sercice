export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface FileUploadDto {
  projectId: string;
  file: File; // Using browser's File type
}