// components/models/ModelStatusIndicator.tsx
import React from 'react';

interface ModelStatusIndicatorProps {
  isActive?: boolean;
  isDefault?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ModelStatusIndicator: React.FC<ModelStatusIndicatorProps> = ({ 
  isActive = true, 
  isDefault = false, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  if (isDefault) {
    return (
      <div className="flex items-center space-x-1">
        <div className={`${sizeClasses[size]} bg-blue-400 rounded-full animate-pulse`} />
        <span className="text-xs text-blue-600 font-medium">Default</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1">
      <div 
        className={`${sizeClasses[size]} rounded-full ${
          isActive ? 'bg-green-400' : 'bg-gray-300'
        }`} 
      />
      <span className={`text-xs font-medium ${
        isActive ? 'text-green-600' : 'text-gray-500'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    </div>
  );
};