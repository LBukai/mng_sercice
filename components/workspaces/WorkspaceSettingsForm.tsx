import { useState } from 'react';
import { Workspace } from '@/types/workspace';

interface WorkspaceSettingsFormProps {
  workspace: Workspace;
  onUpdate: (updatedWorkspace: Workspace) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const WorkspaceSettingsForm = ({ 
  workspace, 
  onUpdate, 
  onCancel, 
  isLoading = false 
}: WorkspaceSettingsFormProps) => {
  const [formData, setFormData] = useState({
    prompt: workspace.prompt || '',
    temperature: workspace.temperature || 0.7,
  });
  
  const [errors, setErrors] = useState<{
    prompt?: string;
    temperature?: string;
  }>({});

  const validateForm = () => {
    const newErrors: { prompt?: string; temperature?: string } = {};
    
    if (formData.temperature < 0 || formData.temperature > 2) {
      newErrors.temperature = 'Temperature must be between 0 and 2';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const updatedWorkspace = {
      ...workspace,
      ...formData,
    };

    await onUpdate(updatedWorkspace);
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
          System Prompt
        </label>
        <textarea
          id="prompt"
          value={formData.prompt}
          onChange={(e) => handleInputChange('prompt', e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.prompt ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
          }`}
          placeholder="Enter system prompt for this workspace..."
          disabled={isLoading}
        />
        {errors.prompt && (
          <p className="mt-1 text-sm text-red-600">{errors.prompt}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          This prompt will be used to guide the AI`&apos;`s responses in this workspace.
        </p>
      </div>

      <div>
        <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
          Temperature: {formData.temperature}
        </label>
        <input
          type="range"
          id="temperature"
          min="0"
          max="2"
          step="0.1"
          value={formData.temperature}
          onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          disabled={isLoading}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0 (Focused)</span>
          <span>1 (Balanced)</span>
          <span>2 (Creative)</span>
        </div>
        {errors.temperature && (
          <p className="mt-1 text-sm text-red-600">{errors.temperature}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Controls randomness: lower values for more focused responses, higher values for more creative responses.
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Updating...' : 'Update Settings'}
        </button>
      </div>
    </form>
  );
};