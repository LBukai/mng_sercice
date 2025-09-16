// components/projects/WorkspaceForm.tsx
import { useState, useEffect } from 'react';
import { Workspace } from '@/types/workspace';
import { ArchGPTWorkspaceRequest } from '@/types/archgpt';
import { Model } from '@/types/model';
import { useArchGPT } from '@/hooks/useArchGPT';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface WorkspaceFormProps {
  projectModels: Model[];
  onSubmit: (workspaceData: Omit<Workspace, 'id'>) => Promise<boolean>;
  onSubmitArchGPT?: (workspaceData: ArchGPTWorkspaceRequest) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const WorkspaceForm = ({ 
  projectModels, 
  onSubmit, 
  onSubmitArchGPT,
  onCancel, 
  isLoading = false 
}: WorkspaceFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    prompt: '',
    isArchGPT: false,
    selectedModelId: '',
    selectedMode: '',
  });
  
  const [errors, setErrors] = useState<{
    name?: string;
    prompt?: string;
    model?: string;
    mode?: string;
  }>({});

  const { archGPTModes, isLoadingModes, fetchArchGPTModes } = useArchGPT();

  // Fetch ArchGPT modes when component mounts
  useEffect(() => {
    fetchArchGPTModes();
  }, [fetchArchGPTModes]);

  // Set default model when ArchGPT is enabled and models are available
  useEffect(() => {
    if (formData.isArchGPT && projectModels.length > 0 && !formData.selectedModelId) {
      setFormData(prev => ({
        ...prev,
        selectedModelId: String(projectModels[0].id)
      }));
    }
  }, [formData.isArchGPT, projectModels]);

  // Set default mode when ArchGPT is enabled and modes are available
  useEffect(() => {
    if (formData.isArchGPT && archGPTModes.length > 0 && !formData.selectedMode) {
      setFormData(prev => ({
        ...prev,
        selectedMode: archGPTModes[0]
      }));
    }
  }, [formData.isArchGPT, archGPTModes]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Workspace name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Workspace name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Workspace name must be less than 50 characters';
    }

    if (formData.isArchGPT) {
      if (!formData.selectedModelId) {
        newErrors.model = 'Please select a model for ArchGPT workspace';
      }

      if (!formData.selectedMode) {
        newErrors.mode = 'Please select a mode for ArchGPT workspace';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    let success = false;

    if (formData.isArchGPT && onSubmitArchGPT) {
      // Create ArchGPT workspace
      const archGPTData: ArchGPTWorkspaceRequest = {
        workspace: {
          name: formData.name.trim(),
          prompt: formData.prompt.trim(),
        },
        mode: formData.selectedMode,
        model_id: parseInt(formData.selectedModelId, 10),
      };
      success = await onSubmitArchGPT(archGPTData);
    } else {
      // Create regular workspace
      const workspaceData: Omit<Workspace, 'id'> = {
        name: formData.name.trim(),
        prompt: formData.prompt.trim() || undefined,
      };
      success = await onSubmit(workspaceData);
    }

    if (success) {
      // Reset form on success
      setFormData({
        name: '',
        prompt: '',
        isArchGPT: false,
        selectedModelId: '',
        selectedMode: '',
      });
      setErrors({});
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Reset ArchGPT fields when toggling off
    if (field === 'isArchGPT' && !value) {
      setFormData(prev => ({
        ...prev,
        selectedModelId: '',
        selectedMode: '',
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="workspaceName" className="block text-sm font-medium text-gray-700 mb-1">
          Workspace Name *
        </label>
        <input
          type="text"
          id="workspaceName"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
          }`}
          placeholder="Enter workspace name"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="workspacePrompt" className="block text-sm font-medium text-gray-700 mb-1">
          System Prompt
        </label>
        <textarea
          id="workspacePrompt"
          value={formData.prompt}
          onChange={(e) => handleInputChange('prompt', e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.prompt ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
          }`}
          placeholder="Enter system prompt for this workspace (optional)"
          disabled={isLoading}
        />
        {errors.prompt && (
          <p className="mt-1 text-sm text-red-600">{errors.prompt}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Optional: This prompt will guide the AI&apos;s responses in this workspace.
        </p>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isArchGPT"
          checked={formData.isArchGPT}
          onChange={(e) => handleInputChange('isArchGPT', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          disabled={isLoading}
        />
        <label htmlFor="isArchGPT" className="ml-2 block text-sm font-medium text-gray-700">
          ArchGPT Workspace
        </label>
      </div>

      {formData.isArchGPT && (
        <>
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>ArchGPT Workspace:</strong> This will create a specialized workspace with enhanced AI capabilities.
            </p>
          </div>

          <div>
            <label htmlFor="selectedModel" className="block text-sm font-medium text-gray-700 mb-1">
              Model *
            </label>
            {projectModels.length === 0 ? (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  No models are assigned to this project. Please assign models to the project first.
                </p>
              </div>
            ) : (
              <select
                id="selectedModel"
                value={formData.selectedModelId}
                onChange={(e) => handleInputChange('selectedModelId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.model ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                disabled={isLoading}
              >
                <option value="">Select a model</option>
                {projectModels.map((model) => (
                  <option key={model.id} value={String(model.id)}>
                    {model.name} ({model.provider?.name || 'Unknown Provider'})
                  </option>
                ))}
              </select>
            )}
            {errors.model && (
              <p className="mt-1 text-sm text-red-600">{errors.model}</p>
            )}
          </div>

          <div>
            <label htmlFor="selectedMode" className="block text-sm font-medium text-gray-700 mb-1">
              Mode *
            </label>
            {isLoadingModes ? (
              <div className="flex items-center justify-center py-2">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-sm text-gray-600">Loading modes...</span>
              </div>
            ) : archGPTModes.length === 0 ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">
                  Unable to load ArchGPT modes. Please try again.
                </p>
              </div>
            ) : (
              <select
                id="selectedMode"
                value={formData.selectedMode}
                onChange={(e) => handleInputChange('selectedMode', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.mode ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                disabled={isLoading || isLoadingModes}
              >
                <option value="">Select a mode</option>
                {archGPTModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            )}
            {errors.mode && (
              <p className="mt-1 text-sm text-red-600">{errors.mode}</p>
            )}
          </div>
        </>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !formData.name.trim() || (formData.isArchGPT && (!formData.selectedModelId || !formData.selectedMode))}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading 
            ? 'Creating...' 
            : formData.isArchGPT 
              ? 'Create ArchGPT Workspace' 
              : 'Create Workspace'
          }
        </button>
      </div>
    </form>
  );
};