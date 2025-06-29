import { useState, useRef } from 'react';

interface FileUploadData {
  files: FileList;
  ttl: string;
}

interface FileUploadFormProps {
  onSubmit: (data: FileUploadData) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const FileUploadForm = ({ onSubmit, onCancel, isLoading = false }: FileUploadFormProps) => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [ttlDate, setTtlDate] = useState('');
  const [errors, setErrors] = useState<{ files?: string; ttl?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = () => {
    const newErrors: { files?: string; ttl?: string } = {};

    if (!selectedFiles || selectedFiles.length === 0) {
      newErrors.files = 'Please select at least one file';
    }

    if (!ttlDate) {
      newErrors.ttl = 'TTL date is required';
    } else {
      const selectedDate = new Date(ttlDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
      
      if (selectedDate <= today) {
        newErrors.ttl = 'TTL date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedFiles) {
      return;
    }

    const success = await onSubmit({
      files: selectedFiles,
      ttl: ttlDate,
    });

    if (success) {
      // Reset form on success
      setSelectedFiles(null);
      setTtlDate('');
      setErrors({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setSelectedFiles(files);
    
    // Clear file error when files are selected
    if (files && files.length > 0 && errors.files) {
      setErrors(prev => ({ ...prev, files: undefined }));
    }
  };

  const handleTtlChange = (value: string) => {
    setTtlDate(value);
    
    // Clear TTL error when user starts typing
    if (errors.ttl) {
      setErrors(prev => ({ ...prev, ttl: undefined }));
    }
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get default date (30 days from now)
  const getDefaultDate = () => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    return defaultDate.toISOString().split('T')[0];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Selection Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Files *
        </label>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          className="hidden"
          disabled={isLoading}
        />
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          {selectedFiles && selectedFiles.length > 0 ? (
            <div>
              <div className="text-sm text-gray-600 mb-2">
                {selectedFiles.length} file(s) selected:
              </div>
              <div className="space-y-1">
                {Array.from(selectedFiles).map((file, index) => (
                  <div key={index} className="text-sm text-gray-800 flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleBrowseFiles}
                disabled={isLoading}
                className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Change Files
              </button>
            </div>
          ) : (
            <div>
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-600 mb-2">Drop files here or</p>
              <button
                type="button"
                onClick={handleBrowseFiles}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Browse Files
              </button>
            </div>
          )}
        </div>
        
        {errors.files && (
          <p className="mt-1 text-sm text-red-600">{errors.files}</p>
        )}
      </div>

      {/* TTL Date Selection */}
      <div>
        <label htmlFor="ttlDate" className="block text-sm font-medium text-gray-700 mb-1">
          Time To Live (TTL) Date *
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Files will be automatically deleted after this date
        </p>
        <input
          type="date"
          id="ttlDate"
          value={ttlDate}
          onChange={(e) => handleTtlChange(e.target.value)}
          min={getMinDate()}
          placeholder={getDefaultDate()}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.ttl ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
          }`}
          disabled={isLoading}
        />
        {errors.ttl && (
          <p className="mt-1 text-sm text-red-600">{errors.ttl}</p>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <div className="flex">
          <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Upload Guidelines:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Multiple files can be uploaded at once</li>
              <li>TTL date must be set for all files</li>
              <li>Files will be automatically deleted after the TTL date</li>
              <li>Maximum file size limits may apply</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !selectedFiles || selectedFiles.length === 0 || !ttlDate}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Uploading...' : `Upload ${selectedFiles ? selectedFiles.length : 0} File(s)`}
        </button>
      </div>
    </form>
  );
};