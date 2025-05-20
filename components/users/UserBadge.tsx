import React from 'react';

interface UserBadgeProps {
  isAdmin: boolean | undefined;
  size?: 'sm' | 'md' | 'lg';
}

export const UserBadge: React.FC<UserBadgeProps> = ({ 
  isAdmin = false, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  };

  if (isAdmin) {
    return (
      <span className={`bg-blue-100 text-blue-800 font-medium ${sizeClasses[size]} rounded flex items-center gap-1`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Admin
      </span>
    );
  }

  return (
    <span className={`bg-gray-100 text-gray-800 font-medium ${sizeClasses[size]} rounded`}>
      User
    </span>
  );
};