import React from 'react';
import { ProjectFile } from '../../types/file';
import { Button } from '../common/Button';
import { SkeletonLoader } from '../common/SkeletonLoader';

interface FileTableProps {
  files: ProjectFile[];
  loading: boolean;
  onDelete: (fileId: string) => void;
}

export const FileTable: React.FC<FileTableProps> = ({ files, loading, onDelete }) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return <SkeletonLoader count={5} type={'text'} />;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Name</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Size</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Type</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Uploaded By</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Uploaded At</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-4 px-4 text-center text-gray-500">
                No files found for this project
              </td>
            </tr>
          ) : (
            files.map((file) => (
              <tr key={file.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {file.name}
                  </a>
                </td>
                <td className="py-3 px-4">{formatFileSize(file.size)}</td>
                <td className="py-3 px-4">{file.type}</td>
                <td className="py-3 px-4">{file.uploadedBy}</td>
                <td className="py-3 px-4">{formatDate(file.uploadedAt)}</td>
                <td className="py-3 px-4">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(file.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};