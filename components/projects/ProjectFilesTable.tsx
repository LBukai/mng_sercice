import { useState } from 'react';
import { File } from '@/types/file';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { Modal } from '@/components/common/Modal';
import { FileUploadForm } from './FileUploadForm';

interface FileUploadData {
  files: FileList;
  ttl: string;
}

interface ProjectFilesTableProps {
  projectFiles: File[];
  isLoading: boolean;
  error: string | null;
  onUploadFiles: (data: FileUploadData) => Promise<File[] | false>;
  onRemoveFile: (fileId: string) => Promise<boolean>;
  onUpdateFileTTL?: (fileId: string, ttl: string) => Promise<boolean>;
}

export const ProjectFilesTable = ({
  projectFiles,
  isLoading,
  error,
  onUploadFiles,
  onRemoveFile,
  onUpdateFileTTL
}: ProjectFilesTableProps) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTTL, setEditingTTL] = useState<string | null>(null);
  const [editTTLValue, setEditTTLValue] = useState('');

  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  const handleUploadFiles = async (data: FileUploadData) => {
    setIsUploading(true);
    try {
      const success = await onUploadFiles(data);
      if (success) {
        setShowUploadModal(false);
      }
      return !!success;
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = async (fileId: string, fileName: string) => {
    if (window.confirm(`Are you sure you want to remove "${fileName}" from this project? This action cannot be undone.`)) {
      await onRemoveFile(fileId);
    }
  };

  const handleEditTTL = (fileId: string, currentTTL?: string) => {
    setEditingTTL(fileId);
    setEditTTLValue(currentTTL ? currentTTL.split('T')[0] : ''); // Extract date part
  };

  const handleSaveTTL = async (fileId: string) => {
    if (onUpdateFileTTL && editTTLValue) {
      const success = await onUpdateFileTTL(fileId, editTTLValue);
      if (success) {
        setEditingTTL(null);
        setEditTTLValue('');
      }
    }
  };

  const handleCancelTTL = () => {
    setEditingTTL(null);
    setEditTTLValue('');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString();
  };

  const isFileDueSoon = (ttlDate?: string) => {
    if (!ttlDate) return false;
    const ttl = new Date(ttlDate);
    const now = new Date();
    const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    return (ttl.getTime() - now.getTime()) <= oneWeek && ttl.getTime() > now.getTime();
  };

  const isFileExpired = (ttlDate?: string) => {
    if (!ttlDate) return false;
    const ttl = new Date(ttlDate);
    const now = new Date();
    return ttl.getTime() <= now.getTime();
  };

  // Filter files based on search term
  const filteredFiles = projectFiles.filter(file => {
    if (!searchTerm.trim()) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      (file.name || '').toLowerCase().includes(search) ||
      String(file.id || '').toLowerCase().includes(search) ||
      (file.created_by || '').toLowerCase().includes(search)
    );
  });

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Project Files</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Files uploaded to this project.</p>
          </div>
          <button
            onClick={handleUploadClick}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Upload File
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search files..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          {searchTerm && (
            <p className="mt-2 text-sm text-gray-600">
              Showing {filteredFiles.length} of {projectFiles.length} files
            </p>
          )}
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
                  Upload Date
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
              ) : filteredFiles.length > 0 ? (
                filteredFiles.map((file) => {
                  const isDueSoon = isFileDueSoon(file.ttl);
                  const isExpired = isFileExpired(file.ttl);
                  const rowClassName = isExpired 
                    ? "bg-red-50 hover:bg-red-100 border-l-4 border-red-500" 
                    : isDueSoon 
                    ? "bg-yellow-50 hover:bg-yellow-100 border-l-4 border-yellow-500" 
                    : "hover:bg-gray-50";

                  return (
                    <tr key={file.id} className={rowClassName}>
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
                              {isExpired && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  Expired
                                </span>
                              )}
                              {isDueSoon && !isExpired && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Due Soon
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {file.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(file.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {editingTTL === file.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="date"
                              value={editTTLValue}
                              onChange={(e) => setEditTTLValue(e.target.value)}
                              min={getMinDate()}
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                              onClick={() => handleSaveTTL(file.id!)}
                              className="text-green-600 hover:text-green-800 text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelTTL}
                              className="text-gray-600 hover:text-gray-800 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>{file.ttl ? formatDate(file.ttl) : 'No expiry'}</span>
                            {onUpdateFileTTL && (
                              <button
                                onClick={() => handleEditTTL(file.id!, file.ttl)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-4">
                          Download
                        </button>
                        <button 
                          onClick={() => handleRemoveFile(file.id!, file.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchTerm ? `No files found matching "${searchTerm}"` : 'No files uploaded to this project'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Files Modal */}
      <Modal 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)}
        title="Upload Files to Project"
        size="md"
      >
        <FileUploadForm 
          onSubmit={handleUploadFiles}
          onCancel={() => setShowUploadModal(false)}
          isLoading={isUploading}
        />
      </Modal>
    </>
  );
};