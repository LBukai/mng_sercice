import React from 'react';

interface SkeletonLoaderProps {
  type: 'text' | 'circle' | 'rectangle' | 'table-row' | 'card';
  count?: number;
  className?: string;
  width?: string;
  height?: string;
  animate?: boolean;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type,
  count = 1,
  className = '',
  width,
  height,
  animate = true,
}) => {
  const baseClass = 'bg-gray-200 rounded';
  const animationClass = animate ? 'animate-pulse' : '';
  const style: React.CSSProperties = {};
  
  if (width) style.width = width;
  if (height) style.height = height;
  
  // Helper to create a skeleton item based on type
  const createSkeletonItem = (key: number) => {
    switch (type) {
      case 'text':
        return (
          <div 
            key={key}
            className={`${baseClass} ${animationClass} h-4 my-2 ${className}`}
            style={style}
          ></div>
        );
      case 'circle':
        return (
          <div 
            key={key}
            className={`${baseClass} ${animationClass} rounded-full ${className}`}
            style={{ ...style, aspectRatio: '1/1' }}
          ></div>
        );
      case 'rectangle':
        return (
          <div 
            key={key}
            className={`${baseClass} ${animationClass} ${className}`}
            style={style}
          ></div>
        );
      case 'table-row':
        return (
          <tr key={key} className={animationClass}>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className={`${baseClass} h-4 w-12`}></div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className={`${baseClass} h-4 w-32`}></div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className={`${baseClass} h-4 w-24`}></div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className={`${baseClass} h-4 w-40`}></div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
              <div className={`${baseClass} h-4 w-12 mx-auto`}></div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right">
              <div className="flex justify-end gap-2">
                <div className={`${baseClass} h-4 w-10`}></div>
                <div className={`${baseClass} h-4 w-14`}></div>
              </div>
            </td>
          </tr>
        );
      case 'card':
        return (
          <div key={key} className={`${baseClass} p-4 rounded-lg ${animationClass} ${className}`} style={style}>
            <div className={`${baseClass} h-6 w-3/4 mb-4`}></div>
            <div className={`${baseClass} h-4 w-full mb-2`}></div>
            <div className={`${baseClass} h-4 w-full mb-2`}></div>
            <div className={`${baseClass} h-4 w-2/3 mb-4`}></div>
            <div className="flex justify-end">
              <div className={`${baseClass} h-8 w-24 rounded-md`}></div>
            </div>
          </div>
        );
      default:
        return (
          <div 
            key={key}
            className={`${baseClass} ${animationClass} ${className}`}
            style={style}
          ></div>
        );
    }
  };
  
  // Create an array of skeleton items
  const skeletonItems = Array.from({ length: count }, (_, i) => createSkeletonItem(i));
  
  return <>{skeletonItems}</>;
};