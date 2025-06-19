export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  size: number;
  type?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  url?: string;
  ttl?: string; // Optional TTL (expiration date) in YYYY-MM-DD format
}

export interface FileUploadDto {
  projectId: string;
  file: File; // Using browser's File type
  ttl?: string; // Optional TTL (expiration date)
}