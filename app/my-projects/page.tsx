// app/my-projects/page.tsx
'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function MyProjectsPage() {
  const { userProjects, isLoading, user, isAuthenticated } = useAuth();

  // Safe check for array
  const projects = Array.isArray(userProjects) ? userProjects : [];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // Check if user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-10">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Authentication Required</h3>
            <p className="mt-1 text-sm text-gray-500">
              You need to be logged in to view your projects.
            </p>
            <div className="mt-6">
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="My Projects" />
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {projects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((userProject, index) => (
              <div 
                key={userProject?.project?.id || index} 
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-5">
                  <h5 className="text-xl font-semibold tracking-tight text-gray-900">
                    {userProject?.project?.name || 'Unnamed Project'}
                  </h5>
                  
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      Project Number:
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {userProject?.project?.projectNumber || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      Your Role:
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      userProject?.role === 'Project Lead' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {userProject?.role || 'Member'}
                    </span>
                  </div>
                  
                  {userProject?.project?.id && (
                    <div className="mt-4">
                      <Link
                        href={`/projects/${userProject.project.id}`}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300"
                      >
                        View Details
                        <svg className="w-3.5 h-3.5 ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
            <p className="mt-1 text-sm text-gray-500">
              {user ? 'You haven\'t been assigned to any projects yet.' : 'Please log in to view your projects.'}
            </p>
            {user?.isAdmin && (
              <div className="mt-6">
                <Link
                  href="/projects"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View All Projects
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}