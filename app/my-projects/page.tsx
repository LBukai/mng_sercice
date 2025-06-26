'use client';

import { useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { useUserProjects } from '@/hooks/useUserProjects';
import { UserProject } from '@/types/userProject';

export default function MyProjectsPage() {
  const { userProjects, isLoading, error, fetchUserProjects } = useUserProjects();
  
  // Hardcoded user ID as requested
  const userId = '25';

  useEffect(() => {
    fetchUserProjects(userId);
  }, [fetchUserProjects, userId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="My Projects" />
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : userProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userProjects.map((userProject: UserProject) => (
              <ProjectCard 
                key={userProject.project.id} 
                userProject={userProject}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects assigned</h3>
            <p className="text-gray-500">You are not currently assigned to any projects.</p>
          </div>
        )}
      </div>
    </div>
  );
}