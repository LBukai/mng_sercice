// components/models/ModelForm.tsx
import { useState, useEffect } from 'react';
import { Model } from '@/types/model';
import { Provider } from '@/types/provider';
import { useProviders } from '@/hooks/useProviders';

interface ModelFormProps {
  model?: Model;
  onSubmit: (modelData: Omit<Model, 'id'> | Model) => void;
  onCancel: () => void;
}

export const ModelForm = ({ model, onSubmit, onCancel }: ModelFormProps) => {
  const isEditMode = !!model?.id;
  const { providers, fetchProviders } = useProviders();
  
  const [formData, setFormData] = useState<{
    name: string;
    provider?: Provider;
    selectedProviderId: string;
    public?: boolean;
  }>({
    name: model?.name || '',
    provider: model?.provider,
    selectedProviderId: model?.provider?.id ? String(model.provider.id) : '',
    public: model?.public || false,
  });

  const [errors, setErrors] = useState<{
    name?: string;
    provider?: string;
  }>({});

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
    } else if (name === 'selectedProviderId') {
      const selectedProvider = providers.find(p => String(p.id) === value);
      setFormData((prev) => ({
        ...prev,
        selectedProviderId: value,
        provider: selectedProvider,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing/selecting
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {
      name?: string;
      provider?: string;
    } = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Model name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Model name must be at least 2 characters';
    }

    if (!formData.selectedProviderId) {
      newErrors.provider = 'Provider is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const payload = {
        name: formData.name.trim(),
        provider: formData.provider,
        public: formData.public,
      };
      
      // If editing, include the id and other existing fields
      if (isEditMode && model?.id) {
        onSubmit({
          ...model,
          ...payload,
        });
      } else {
        onSubmit(payload);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-medium mb-6">
        {isEditMode ? 'Edit Model' : 'Add New Model'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Model Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            placeholder="e.g., gpt-4, qwen3, o3-mini"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="selectedProviderId" className="block text-sm font-medium text-gray-700 mb-1">
            Provider <span className="text-red-500">*</span>
          </label>
          <select
            id="selectedProviderId"
            name="selectedProviderId"
            value={formData.selectedProviderId || ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.provider ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a provider...</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
          {errors.provider && (
            <p className="mt-1 text-sm text-red-600">{errors.provider}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="public"
            name="public"
            checked={formData.public || false}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="public" className="ml-2 block text-sm text-gray-700">
            Public access
          </label>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isEditMode ? 'Update Model' : 'Add Model'}
          </button>
        </div>
      </form>
    </div>
  );
};