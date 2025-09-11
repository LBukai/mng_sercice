// components/projects/ManageProjectModelsForm.tsx
import { useState, useEffect } from 'react';
//import { Model } from '@/types/model';
import { useModels } from '@/hooks/useModels';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface ManageProjectModelsFormProps {
  currentModelIds: number[];
  onSubmit: (modelIds: number[]) => Promise<boolean>;
  onCancel: () => void;
}

export const ManageProjectModelsForm = ({ 
  currentModelIds, 
  onSubmit, 
  onCancel 
}: ManageProjectModelsFormProps) => {
  const { models, isLoading: modelsLoading, fetchModels } = useModels();
  const [selectedModelIds, setSelectedModelIds] = useState<number[]>(currentModelIds);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  useEffect(() => {
    setSelectedModelIds(currentModelIds);
  }, [currentModelIds]);

  const handleModelToggle = (modelId: number) => {
    setSelectedModelIds(prev => {
      if (prev.includes(modelId)) {
        return prev.filter(id => id !== modelId);
      } else {
        return [...prev, modelId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      const success = await onSubmit(selectedModelIds);
      if (success) {
        // Reset form on success
        setSearchTerm('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter models based on search term
  const filteredModels = models.filter(model => {
    if (!searchTerm.trim()) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      (model.name || '').toLowerCase().includes(search) ||
      (model.provider || '').toLowerCase().includes(search) ||
      String(model.id || '').toLowerCase().includes(search)
    );
  });

  if (modelsLoading) {
    return (
      <div className="py-8 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="text-sm text-gray-600 mb-4">
          Select which models should be available for this project. Users in this project will only be able to use the selected models.
        </p>
        
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search models by name, provider, or ID..."
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
              Showing {filteredModels.length} of {models.length} models
            </p>
          )}
        </div>

        {filteredModels.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded-md text-gray-500 text-sm">
            {searchTerm 
              ? `No models found matching "${searchTerm}"`
              : "No models available."
            }
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Access
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredModels.map(model => {
                  const modelId = Number(model.id);
                  if (isNaN(modelId)) return null;
                  
                  return (
                    <tr key={model.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          id={`model-${model.id}`}
                          checked={selectedModelIds.includes(modelId)}
                          onChange={() => handleModelToggle(modelId)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          disabled={isSubmitting}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <label htmlFor={`model-${model.id}`} className="cursor-pointer">
                          <div className="text-sm font-medium text-gray-900">{model.name}</div>
                          <div className="text-xs text-gray-500">ID: {model.id}</div>
                        </label>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {model.provider}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          model.public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {model.public ? 'Public' : 'Private'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selection Summary */}
      <div className="bg-blue-50 p-3 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>{selectedModelIds.length}</strong> model{selectedModelIds.length === 1 ? '' : 's'} selected
          {selectedModelIds.length !== currentModelIds.length && (
            <span className="ml-2 text-blue-600">
              ({Math.abs(selectedModelIds.length - currentModelIds.length)} change{Math.abs(selectedModelIds.length - currentModelIds.length) === 1 ? '' : 's'})
            </span>
          )}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Updating...' : 'Update Models'}
        </button>
      </div>
    </form>
  );
};