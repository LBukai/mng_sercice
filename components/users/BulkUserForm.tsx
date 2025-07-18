import { useState, useRef } from 'react';
import { User } from '@/types/user';

interface BulkUserData {
  fullName: string;
  email: string;
  username: string;
  isAdmin: boolean;
}

interface BulkUserFormProps {
  onSubmit: (users: Omit<User, 'id'>[]) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const BulkUserForm = ({ onSubmit, onCancel, isLoading = false }: BulkUserFormProps) => {
  const [users, setUsers] = useState<BulkUserData[]>([
    { fullName: '', email: '', username: '', isAdmin: false }
  ]);
  const [errors, setErrors] = useState<{ [key: number]: Partial<BulkUserData> }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate JSON template for download
  const generateTemplate = () => {
    const template = [
      {
        name: "John Doe",
        email: "john.doe@company.com", // Optional
        username: "johndoe",
        isAdmin: false
      },
      {
        name: "Jane Smith",
        email: "", // Can be empty
        username: "janesmith",
        isAdmin: true
      }
    ];
    
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle JSON file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        
        if (Array.isArray(jsonData)) {
          const validUsers = jsonData.map((user: User) => ({
            fullName:  user.name || '',
            email: user.email || '',
            username: user.username || '',
            isAdmin: Boolean(user.isAdmin || false)
          }));
          
          setUsers(validUsers.length > 0 ? validUsers : [{ fullName: '', email: '', username: '', isAdmin: false }]);
          setErrors({});
        } else {
          alert('Invalid JSON format. Please upload an array of user objects.');
        }
      } catch (error) {
        console.error('Invalid JSON file. Please check the format and try again.', error);
      }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Add new user row
  const addUser = () => {
    setUsers([...users, { fullName: '', email: '', username: '', isAdmin: false }]);
  };

  // Remove user row
  const removeUser = (index: number) => {
    if (users.length > 1) {
      const newUsers = users.filter((_, i) => i !== index);
      setUsers(newUsers);
      
      // Clean up errors for removed user
      const newErrors = { ...errors };
      delete newErrors[index];
      // Shift down error indices
      Object.keys(newErrors).forEach(key => {
        const keyNum = parseInt(key);
        if (keyNum > index) {
          newErrors[keyNum - 1] = newErrors[keyNum];
          delete newErrors[keyNum];
        }
      });
      setErrors(newErrors);
    }
  };

  // Update user data
  const updateUser = (index: number, field: keyof BulkUserData, value: string | boolean) => {
    const newUsers = [...users];
    newUsers[index] = { ...newUsers[index], [field]: value };
    setUsers(newUsers);

    // Clear error for this field
    if (errors[index]?.[field]) {
      const newErrors = { ...errors };
      if (newErrors[index]) {
        delete newErrors[index][field];
        if (Object.keys(newErrors[index]).length === 0) {
          delete newErrors[index];
        }
      }
      setErrors(newErrors);
    }
  };

  // Auto-generate username from full name
  const generateUsername = (index: number, fullName: string) => {
    const username = fullName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '')
      .slice(0, 20);
    
    if (username && !users[index].username) {
      updateUser(index, 'username', username);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: { [key: number]: Partial<BulkUserData> } = {};
    
    users.forEach((user, index) => {
      const userErrors: Partial<BulkUserData> = {};
      
      if (!user.fullName.trim()) {
        userErrors.fullName = 'Full name is required';
      }
      
      // Email is optional, but if provided must be valid
      if (user.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
        userErrors.email = 'Invalid email format';
      }
      
      if (!user.username.trim()) {
        userErrors.username = 'Username is required';
      } else if (user.username.length < 3) {
        userErrors.username = 'Username must be at least 3 characters';
      }
      
      // Check for duplicate emails and usernames (only check non-empty emails)
      const duplicateEmail = user.email.trim() ? users.findIndex((u, i) => i !== index && u.email === user.email) : -1;
      const duplicateUsername = users.findIndex((u, i) => i !== index && u.username === user.username);
      
      if (duplicateEmail !== -1) {
        userErrors.email = 'Email already used in another row';
      }
      
      if (duplicateUsername !== -1) {
        userErrors.username = 'Username already used in another row';
      }
      
      if (Object.keys(userErrors).length > 0) {
        newErrors[index] = userErrors;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Transform the data to match the API requirements
    const usersToCreate = users.map(user => ({
      name: user.fullName.trim(),
      email: user.email.trim() || undefined, // Only include email if provided
      username: user.username.trim().toLowerCase(),
      isAdmin: user.isAdmin
    }));

    await onSubmit(usersToCreate);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Upload Section */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={generateTemplate}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Download JSON Template
        </button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".json"
          className="hidden"
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Upload JSON File
        </button>
      </div>

      {/* Users Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">Users to Create</h4>
        </div>
        
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Full Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email Address (Optional)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={user.fullName}
                      onChange={(e) => {
                        updateUser(index, 'fullName', e.target.value);
                        generateUsername(index, e.target.value);
                      }}
                      className={`w-full px-2 py-1 border rounded text-sm ${
                        errors[index]?.fullName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="John Doe"
                      disabled={isLoading}
                    />
                    {errors[index]?.fullName && (
                      <p className="mt-1 text-xs text-red-600">{errors[index].fullName}</p>
                    )}
                  </td>
                  
                  <td className="px-4 py-3">
                    <input
                      type="email"
                      value={user.email}
                      onChange={(e) => updateUser(index, 'email', e.target.value)}
                      className={`w-full px-2 py-1 border rounded text-sm ${
                        errors[index]?.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="john@company.com"
                      disabled={isLoading}
                    />
                    {errors[index]?.email && (
                      <p className="mt-1 text-xs text-red-600">{errors[index].email}</p>
                    )}
                  </td>
                  
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={user.username}
                      onChange={(e) => updateUser(index, 'username', e.target.value)}
                      className={`w-full px-2 py-1 border rounded text-sm ${
                        errors[index]?.username ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="johndoe"
                      disabled={isLoading}
                    />
                    {errors[index]?.username && (
                      <p className="mt-1 text-xs text-red-600">{errors[index].username}</p>
                    )}
                  </td>
                  
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={user.isAdmin}
                      onChange={(e) => updateUser(index, 'isAdmin', e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={isLoading}
                    />
                  </td>
                  
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => removeUser(index)}
                      disabled={users.length === 1 || isLoading}
                      className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <button
            type="button"
            onClick={addUser}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Another User
          </button>
        </div>
      </div>

      {/* Submit Actions */}
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
          disabled={isLoading || users.length === 0}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating...' : `Add ${users.length} User${users.length === 1 ? '' : 's'}`}
        </button>
      </div>
    </form>
  );
};