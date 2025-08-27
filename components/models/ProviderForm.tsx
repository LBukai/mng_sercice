// components/models/ProviderForm.tsx
import { useState } from 'react';
import { Provider } from '@/types/provider';

interface ProviderFormProps {
  provider?: Provider;
  onSubmit: (providerData: Omit<Provider, 'id'> | Provider) => void;
  onCancel: () => void;
}

export const ProviderForm = ({ provider, onSubmit, onCancel }: ProviderFormProps) => {
  const isEditMode = !!provider?.id;
  
  const [formData, setFormData] = useState<Provider>({
    name: '',
    ...provider,
  });

  const [errors, setErrors] = useState<{
    name?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
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
    } = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Provider name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Provider name must be at least 2 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        ...formData,
        name: formData.name.trim(),
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-medium mb-6">
        {isEditMode ? 'Edit Provider' : 'Add New Provider'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Provider Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            placeholder="e.g., ollama, azure, gemini"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
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
            {isEditMode ? 'Update Provider' : 'Add Provider'}
          </button>
        </div>
      </form>
    </div>
  );
};
