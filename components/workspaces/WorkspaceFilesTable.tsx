import { useState } from 'react';
import { File } from '@/types/file';
import { Workspace } from '@/types/workspace';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { Modal } from '@/components/common/Modal';
import { AddWorkspaceFilesForm } from './AddWorkspaceFilesForm';

interface WorkspaceFilesTableProps {
  workspaceFiles: File[];
  workspace: Workspace;
  isLoading: boolean;
  error: string | null;
  onFileRemove: (fileId: string) => Promise<boolean>;
  onAddFiles: (fileIds: string[]) => Promise<boolean>;
}

export const WorkspaceFilesTable = ({
  workspaceFiles,
  workspace,
  isLoading,
  error,
  onFileRemove,
  onAddFiles
}: WorkspaceFilesTableProps) => {
  const [showAddFilesModal, setShowAddFilesModal] = useState(false);

  const handleRemoveFile = async (fileId: string, fileName: string) => {
    if (window.confirm(`Are you sure you want to remove ${fileName} from this workspace?`)) {
      await onFileRemove(fileId);
    }
  };

  const handleAddFiles = async (fileIds: string[]) => {
    const success = await onAddFiles(fileIds);
    if (success) {
      setShowAddFilesModal(false);
    }
    return success;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Workspace Files</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Files assigned to this workspace.</p>
          </div>
          <button
            onClick={() => setShowAddFilesModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Files
          </button>
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-100 border-l-4 border-red-400 text-red-700">
            {error}
          </div>
        )}

        <div className="border-t border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TTL
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <>
                  <SkeletonLoader type="table-row" count={3} />
                </>
              ) : workspaceFiles.length > 0 ? (
                workspaceFiles.map((file) => (
                  <tr key={file.id || `file-${file.name}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center">
                            <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {file.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {file.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {file.created_by || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(file.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {file.ttl ? formatDate(file.ttl) : 'No expiry'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRemoveFile(file.id!, file.name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No files assigned to this workspace
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Files Modal */}
      <Modal 
        isOpen={showAddFilesModal} 
        onClose={() => setShowAddFilesModal(false)}
        title="Add Files to Workspace"
        size="md"
      >
        <AddWorkspaceFilesForm 
          workspace={workspace}
          existingFiles={workspaceFiles.map(f => f.id as string)}
          onSubmit={handleAddFiles}
          onCancel={() => setShowAddFilesModal(false)}
        />
      </Modal>
    </>
  );
};  