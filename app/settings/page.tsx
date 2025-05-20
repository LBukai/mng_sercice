'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';

export default function SettingsPage() {
  const [apiSettings, setApiSettings] = useState({
    apiUrl: 'http://localhost:8080',
    apiKey: '********-****-****-****-************',
    timeout: 30,
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    dailySummary: true,
    alertsEnabled: true,
  });
  
  const [displaySettings, setDisplaySettings] = useState({
    darkMode: false,
    compactView: false,
    language: 'english',
    itemsPerPage: 10,
  });
  
  const handleApiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApiSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked,
    }));
  };
  
  const handleDisplayChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement | HTMLSelectElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setDisplaySettings(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setDisplaySettings(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  
  const saveSettings = () => {
    // In a real app, you would save these settings to an API or localStorage
    console.log('Saving settings:', {
      apiSettings,
      notificationSettings,
      displaySettings,
    });
    
    // Show success message
    alert('Settings saved successfully!');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="Settings" />
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">API Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700 mb-1">
              API URL
            </label>
            <input
              id="apiUrl"
              name="apiUrl"
              type="text"
              value={apiSettings.apiUrl}
              onChange={handleApiChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input
              id="apiKey"
              name="apiKey"
              type="password"
              value={apiSettings.apiKey}
              onChange={handleApiChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="timeout" className="block text-sm font-medium text-gray-700 mb-1">
              Request Timeout (seconds)
            </label>
            <input
              id="timeout"
              name="timeout"
              type="number"
              min="1"
              max="120"
              value={apiSettings.timeout}
              onChange={handleApiChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="emailNotifications"
              name="emailNotifications"
              type="checkbox"
              checked={notificationSettings.emailNotifications}
              onChange={handleNotificationChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
              Email Notifications
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              id="pushNotifications"
              name="pushNotifications"
              type="checkbox"
              checked={notificationSettings.pushNotifications}
              onChange={handleNotificationChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="pushNotifications" className="ml-2 block text-sm text-gray-700">
              Push Notifications
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              id="dailySummary"
              name="dailySummary"
              type="checkbox"
              checked={notificationSettings.dailySummary}
              onChange={handleNotificationChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="dailySummary" className="ml-2 block text-sm text-gray-700">
              Daily Summary
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              id="alertsEnabled"
              name="alertsEnabled"
              type="checkbox"
              checked={notificationSettings.alertsEnabled}
              onChange={handleNotificationChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="alertsEnabled" className="ml-2 block text-sm text-gray-700">
              System Alerts
            </label>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Display Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center">
            <input
              id="darkMode"
              name="darkMode"
              type="checkbox"
              checked={displaySettings.darkMode}
              onChange={handleDisplayChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="darkMode" className="ml-2 block text-sm text-gray-700">
              Dark Mode
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              id="compactView"
              name="compactView"
              type="checkbox"
              checked={displaySettings.compactView}
              onChange={handleDisplayChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="compactView" className="ml-2 block text-sm text-gray-700">
              Compact View
            </label>
          </div>
          
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              id="language"
              name="language"
              value={displaySettings.language}
              onChange={handleDisplayChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="english">English</option>
              <option value="spanish">Spanish</option>
              <option value="french">French</option>
              <option value="german">German</option>
              <option value="japanese">Japanese</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="itemsPerPage" className="block text-sm font-medium text-gray-700 mb-1">
              Items Per Page
            </label>
            <select
              id="itemsPerPage"
              name="itemsPerPage"
              value={displaySettings.itemsPerPage}
              onChange={handleDisplayChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}