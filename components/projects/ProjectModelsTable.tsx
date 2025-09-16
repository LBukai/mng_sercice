// components/projects/ProjectModelsTable.tsx
import { useState } from 'react';
import { Model } from '@/types/model';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { Modal } from '@/components/common/Modal';
import { ManageProjectModelsForm } from './ManageProjectModelsForm';

interface ProjectModelsTableProps {
  projectModels: Model[];
  isLoading: boolean;
  error: string | null;
  onUpdateModels: (modelIds: number[]) => Promise<boolean>;
  isAdmin?: boolean;
}

export const ProjectModelsTable = ({
  projectModels,
  isLoading,
  error,
  onUpdateModels,
  isAdmin = false
}: ProjectModelsTableProps) => {
  const [showManageModelsModal, setShowManageModelsModal] = useState(false);

  const handleManageModels = () => {
    setShowManageModelsModal(true);
  };

  const handleUpdateModels = async (modelIds: number[]) => {
    const success = await onUpdateModels(modelIds);
    if (success) {
      setShowManageModelsModal(false);
    }
    return success;
  };

  return (
    <>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Project Models</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">AI models available for this project.</p>
          </div>
          {isAdmin && (
            <button
              onClick={handleManageModels}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Manage Models
            </button>
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
                  Model Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <>
                  <SkeletonLoader type="table-row" count={3} />
                </>
              ) : projectModels.length > 0 ? (
                projectModels.map((model) => (
                  <tr key={model.id || `model-${model.name}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                            <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {model.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {model.provider?.name || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {model.id}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                    No models assigned to this project
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage Models Modal */}
      <Modal 
        isOpen={showManageModelsModal} 
        onClose={() => setShowManageModelsModal(false)}
        title="Manage Project Models"
        size="lg"
      >
        <ManageProjectModelsForm 
          currentModelIds={projectModels.map(m => Number(m.id)).filter(id => !isNaN(id))}
          onSubmit={handleUpdateModels}
          onCancel={() => setShowManageModelsModal(false)}
        />
      </Modal>
    </>
  );
};