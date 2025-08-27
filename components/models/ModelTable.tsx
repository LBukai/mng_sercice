// components/models/ModelTable.tsx
import { useState } from 'react';
import { Model } from '@/types/model';
import { ModelForm } from './ModelForm';
import { Modal } from '@/components/common/Modal';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { useModels } from '@/hooks/useModels';

interface ModelTableProps {
  models: Model[];
  defaultModelId?: string | number;
  onModelChange: () => void;
  isLoading?: boolean;
}

export const ModelTable = ({ models, defaultModelId, onModelChange, isLoading = false }: ModelTableProps) => {
  const [sortField, setSortField] = useState<keyof Model>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<Model | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { createModel, updateModel, deleteModel, updateDefaultModel } = useModels();

  const handleSort = (field: keyof Model) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedModels = [...models].sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];
    
    if (fieldA === undefined) return sortDirection === 'asc' ? -1 : 1;
    if (fieldB === undefined) return sortDirection === 'asc' ? 1 : -1;
    
    if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Filter models based on search term
  const filteredModels = sortedModels.filter(model => {
    if (!searchTerm.trim()) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      (model.name || '').toLowerCase().includes(search) ||
      (model.provider || '').toLowerCase().includes(search) ||
      String(model.id || '').toLowerCase().includes(search)
    );
  });

  const handleAddModel = async (modelData: Omit<Model, 'id'>) => {
    const result = await createModel(modelData);
    if (result) {
      setShowAddModal(false);
      onModelChange(); // Refresh the model list
    }
  };

  const handleEditModel = (model: Model) => {
    setEditingModel(model);
  };

  const handleUpdateModel = async (modelData: Model) => {
    if (!modelData.id) return;
    
    const result = await updateModel(String(modelData.id), modelData);
    if (result) {
      setEditingModel(null);
      onModelChange(); // Refresh the model list
    }
  };

  const handleDeleteClick = (model: Model) => {
    setModelToDelete(model);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!modelToDelete?.id) return;
    
    const result = await deleteModel(String(modelToDelete.id));
    if (result) {
      setShowDeleteModal(false);
      setModelToDelete(null);
      onModelChange(); // Refresh the model list
    }
  };

  const handleSetDefault = async (modelId: string | number) => {
    const result = await updateDefaultModel(modelId);
    if (result) {
      onModelChange(); // Refresh to get updated default model
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Model List</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Model
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search models..."
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

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
              <th 
                className="py-3 px-6 text-left cursor-pointer"
                onClick={() => handleSort('id')}
              >
                ID
                {sortField === 'id' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                className="py-3 px-6 text-left cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Name
                {sortField === 'name' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                className="py-3 px-6 text-left cursor-pointer"
                onClick={() => handleSort('provider')}
              >
                Provider
                {sortField === 'provider' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th className="py-3 px-6 text-center">
                Status
              </th>
              <th className="py-3 px-6 text-center">
                Default
              </th>
              <th className="py-3 px-6 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {isLoading ? (
              <>
                <SkeletonLoader type="table-row" count={5} />
              </>
            ) : sortedModels.length > 0 ? (
              filteredModels.map((model) => {
                const isDefault = String(model.id) === String(defaultModelId);
                return (
                  <tr key={model.id} className={`border-b border-gray-200 hover:bg-gray-50 ${isDefault ? 'bg-blue-50' : ''}`}>
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      {model.id}
                    </td>
                    <td className="py-3 px-6 text-left">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className={`h-8 w-8 rounded flex items-center justify-center ${isDefault ? 'bg-blue-100' : 'bg-gray-100'}`}>
                            <svg className={`h-4 w-4 ${isDefault ? 'text-blue-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${isDefault ? 'text-blue-900' : 'text-gray-900'}`}>
                            {model.name}
                            {isDefault && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-left">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {model.provider}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        model.public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {model.public ? 'Public' : 'Private'}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      {!isDefault && (
                        <button
                          onClick={() => handleSetDefault(model.id!)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Set Default
                        </button>
                      )}
                      {isDefault && (
                        <span className="text-blue-600 text-sm font-medium">Current Default</span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => handleEditModel(model)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteClick(model)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-500">
                  {searchTerm ? `No models found matching "${searchTerm}"` : 'No models found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Model Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        title="Add New Model"
        size="md"
      >
        <ModelForm 
          onSubmit={handleAddModel}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Model Modal */}
      <Modal 
        isOpen={!!editingModel} 
        onClose={() => setEditingModel(null)}
        title="Edit Model"
        size="md"
      >
        {editingModel && (
          <ModelForm 
            model={editingModel}
            onSubmit={handleUpdateModel}
            onCancel={() => setEditingModel(null)}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Are you sure you want to delete the model `&quot;`{modelToDelete?.name}`&quot;`? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};