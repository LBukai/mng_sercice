// components/common/SkeletonLoader.tsx
import React from 'react';

type SkeletonType = 'card' | 'text' | 'table-row' | 'table-rows' | 'image' | 'avatar';

interface SkeletonLoaderProps {
  type: SkeletonType;
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type, 
  count = 1, 
  className = '' 
}) => {
  // Create an array from count
  const items = Array.from({ length: count }, (_, i) => i);
  
  // Function to create different skeleton items based on type
  const createSkeletonItem = (index: number) => {
    switch (type) {
      case 'card':
        return (
          <div 
            key={index}
            className={`animate-pulse rounded-lg bg-white p-4 shadow ${className}`}
          >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        );
        
      case 'text':
        return (
          <div key={index} className={`animate-pulse ${className}`}>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        );
        
      case 'table-row':
        // This is for a SINGLE table row
        return (
          <tr key={index} className={`animate-pulse ${className}`}>
            <td className="py-3 px-6 border-b border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </td>
            <td className="py-3 px-6 border-b border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </td>
            <td className="py-3 px-6 border-b border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </td>
            <td className="py-3 px-6 border-b border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </td>
            <td className="py-3 px-6 border-b border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </td>
            <td className="py-3 px-6 border-b border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </td>
            <td className="py-3 px-6 border-b border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </td>
          </tr>
        );
        
      case 'table-rows':
        // NEW TYPE: This returns a React Fragment with multiple rows
        // Use this when you need to add skeleton rows directly to a tbody
        return (
          <React.Fragment key={index}>
            {Array.from({ length: count }, (_, i) => (
              <tr key={`row-${i}`} className={`animate-pulse ${className}`}>
                <td className="py-3 px-6 border-b border-gray-200">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </td>
                <td className="py-3 px-6 border-b border-gray-200">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </td>
                <td className="py-3 px-6 border-b border-gray-200">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </td>
                <td className="py-3 px-6 border-b border-gray-200">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </td>
                <td className="py-3 px-6 border-b border-gray-200">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </td>
                <td className="py-3 px-6 border-b border-gray-200">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </td>
                <td className="py-3 px-6 border-b border-gray-200">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </td>
              </tr>
            ))}
          </React.Fragment>
        );
        
      case 'image':
        return (
          <div 
            key={index}
            className={`animate-pulse bg-gray-200 rounded ${className}`}
            style={{ height: '200px' }}
          ></div>
        );
        
      case 'avatar':
        return (
          <div 
            key={index}
            className={`animate-pulse bg-gray-200 rounded-full h-12 w-12 ${className}`}
          ></div>
        );
        
      default:
        return <div key={index} className="animate-pulse h-4 bg-gray-200 rounded"></div>;
    }
  };

  // For table-rows type (special case), we return just a single Fragment
  if (type === 'table-rows') {
    return createSkeletonItem(0);
  }
  
  // For all other types, we return multiple items based on count
  return (
    <>
      {items.map((i) => createSkeletonItem(i))}
    </>
  );
};