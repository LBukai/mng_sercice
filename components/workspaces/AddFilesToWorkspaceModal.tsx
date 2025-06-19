// components/workspaces/AddFilesToWorkspaceModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ProjectFile } from '@/types/file';
import { fileApiService } from '@/services/fileApi';

interface AddFilesToWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (fileIds: string[]) => Promise<boolean>;
  projectId: string;
  existingFileIds: string[]; // IDs of files already in the workspace
}

const AddFilesToWorkspaceModal: React.FC<AddFilesToWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projectId,
  existingFileIds
}) => {
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchProjectFiles();
      setSelectedFileIds([]);
    }
  }, [isOpen, projectId]);

  const fetchProjectFiles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const files = await fileApiService.getProjectFiles(projectId);
      setProjectFiles(files);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project files';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedFileIds.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const success = await onSubmit(selectedFileIds);
      if (success) {
        onClose();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add files to workspace';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFileIds(prevIds => {
      if (prevIds.includes(fileId)) {
        return prevIds.filter(id => id !== fileId);
      } else {
        return [...prevIds, fileId];
      }
    });
  };

  // Format the file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get available files (files in the project but not yet in the workspace)
  const availableFiles = projectFiles.filter(file => !existingFileIds.includes(file.id));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Files to Workspace"
      size="lg"
    >
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center p-6">
            <LoadingSpinner size="md" />
          </div>
        ) : error ? (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        ) : availableFiles.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No files available to add. All project files are already assigned to this workspace.
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {availableFiles.map((file) => (
                  <tr 
                    key={file.id} 
                    className={`${selectedFileIds.includes(file.id) ? 'bg-blue-50' : ''} hover:bg-gray-50 cursor-pointer`}
                    onClick={() => toggleFileSelection(file.id)}
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedFileIds.includes(file.id)}
                        onChange={() => toggleFileSelection(file.id)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{file.name}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {file.size ? formatFileSize(file.size) : 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {file.type || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedFileIds.length === 0 || isSubmitting}
            isLoading={isSubmitting}
          >
            Add Selected Files
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddFilesToWorkspaceModal;