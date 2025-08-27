// components/models/ProviderBadge.tsx
import React from 'react';

interface ProviderBadgeProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
}

export const ProviderBadge: React.FC<ProviderBadgeProps> = ({ 
  name, 
  size = 'md',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  };

  const getProviderColor = (providerName: string) => {
    const lowerName = providerName.toLowerCase();
    
    switch (lowerName) {
      case 'ollama':
        return variant === 'outline' 
          ? 'border-blue-300 text-blue-700 bg-blue-50' 
          : 'bg-blue-100 text-blue-800';
      case 'azure':
        return variant === 'outline' 
          ? 'border-sky-300 text-sky-700 bg-sky-50' 
          : 'bg-sky-100 text-sky-800';
      case 'openai':
        return variant === 'outline' 
          ? 'border-green-300 text-green-700 bg-green-50' 
          : 'bg-green-100 text-green-800';
      case 'anthropic':
        return variant === 'outline' 
          ? 'border-purple-300 text-purple-700 bg-purple-50' 
          : 'bg-purple-100 text-purple-800';
      case 'google':
      case 'gemini':
        return variant === 'outline' 
          ? 'border-yellow-300 text-yellow-700 bg-yellow-50' 
          : 'bg-yellow-100 text-yellow-800';
      case 'huggingface':
        return variant === 'outline' 
          ? 'border-orange-300 text-orange-700 bg-orange-50' 
          : 'bg-orange-100 text-orange-800';
      default:
        return variant === 'outline' 
          ? 'border-gray-300 text-gray-700 bg-gray-50' 
          : 'bg-gray-100 text-gray-800';
    }
  };

  const borderClass = variant === 'outline' ? 'border' : '';

  return (
    <span 
      className={`font-medium ${sizeClasses[size]} rounded ${borderClass} ${getProviderColor(name)} inline-flex items-center`}
      title={`Provider: ${name}`}
    >
      {name}
    </span>
  );
};