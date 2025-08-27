// app/models/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { ProviderTable } from '@/components/models/ProviderTable';
import { ModelTable } from '@/components/models/ModelTable';
import { useProviders } from '@/hooks/useProviders';
import { useModels } from '@/hooks/useModels';

export default function ModelsPage() {
  const [activeTab, setActiveTab] = useState<'models' | 'providers'>('models');
  
  const { providers, isLoading: providersLoading, error: providersError, fetchProviders } = useProviders();
  const { models, defaultModel, isLoading: modelsLoading, error: modelsError, fetchModels, fetchDefaultModel } = useModels();

  useEffect(() => {
    fetchProviders();
    fetchModels();
    fetchDefaultModel();
  }, [fetchProviders, fetchModels, fetchDefaultModel]);

  const handleProviderChange = () => {
    fetchProviders();
    // Also refresh models as they might be affected by provider changes
    fetchModels();
  };

  const handleModelChange = () => {
    fetchModels();
    fetchDefaultModel();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="AI Models & Providers Management" />
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('models')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'models'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Models
            <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
              {models.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('providers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'providers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Providers
            <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
              {providers.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Default Model Information */}
      {activeTab === 'models' && defaultModel && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Current Default Model
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  <strong>{defaultModel.name}</strong> ({defaultModel.provider}) is currently set as the default model for the system.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'models' && (
          <>
            {modelsError && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                {modelsError}
              </div>
            )}
            
            <ModelTable 
              models={models} 
              defaultModelId={defaultModel?.id}
              onModelChange={handleModelChange} 
              isLoading={modelsLoading} 
            />
          </>
        )}

        {activeTab === 'providers' && (
          <>
            {providersError && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                {providersError}
              </div>
            )}
            
            <ProviderTable 
              providers={providers} 
              onProviderChange={handleProviderChange} 
              isLoading={providersLoading} 
            />
          </>
        )}
      </div>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Total Models</div>
              <div className="text-2xl font-semibold text-gray-900">{modelsLoading ? '...' : models.length}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded bg-green-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Active Providers</div>
              <div className="text-2xl font-semibold text-gray-900">{providersLoading ? '...' : providers.length}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded bg-yellow-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Public Models</div>
              <div className="text-2xl font-semibold text-gray-900">
                {modelsLoading ? '...' : models.filter(m => m.public).length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}