import { useState, useRef, ChangeEvent } from 'react';
import { User } from '@/types/user';

interface MultiUserFormProps {
  onSubmit: (userData: Omit<User, 'id'>[]) => void;
  onCancel: () => void;
}

// Empty user template
const emptyUser: Omit<User, 'id'> = {
  name: '',
  email: '',
  username: '',
  password: '',
  isAdmin: false,
};

export const MultiUserForm = ({ onSubmit, onCancel }: MultiUserFormProps) => {
  // State for multiple users
  const [users, setUsers] = useState<Omit<User, 'id'>[]>([{ ...emptyUser }]);
  
  // State for errors, one object per user
  const [errors, setErrors] = useState<Array<{
    name?: string;
    email?: string;
    username?: string;
    password?: string;
  }>>([{}]);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle input changes for a specific user
  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setUsers(prevUsers => {
      const updatedUsers = [...prevUsers];
      
      if (type === 'checkbox') {
        const target = e.target as HTMLInputElement;
        updatedUsers[index] = {
          ...updatedUsers[index],
          [name]: target.checked,
        };
      } else {
        updatedUsers[index] = {
          ...updatedUsers[index],
          [name]: value,
        };
      }
      
      return updatedUsers;
    });
  };

  // Add another user row
  const addUserRow = () => {
    setUsers(prevUsers => [...prevUsers, { ...emptyUser }]);
    setErrors(prevErrors => [...prevErrors, {}]);
  };

  // Remove a user row
  const removeUserRow = (index: number) => {
    setUsers(prevUsers => prevUsers.filter((_, i) => i !== index));
    setErrors(prevErrors => prevErrors.filter((_, i) => i !== index));
  };

  // Validate all user forms
  const validateForms = () => {
    const newErrors = users.map(user => {
      const userErrors: {
        name?: string;
        email?: string;
        username?: string;
        password?: string;
      } = {};
      
      if (!user.name?.trim()) {
        userErrors.name = 'Name is required';
      }
      
      if (!user.email?.trim()) {
        userErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(user.email)) {
        userErrors.email = 'Email is invalid';
      }
      
      if (!user.username?.trim()) {
        userErrors.username = 'Username is required';
      }
      
      if (!user.password?.trim()) {
        userErrors.password = 'Password is required';
      } else if (user.password.length < 6) {
        userErrors.password = 'Password must be at least 6 characters';
      }
      
      return userErrors;
    });
    
    setErrors(newErrors);
    
    // Check if any errors exist
    return newErrors.every(userErrors => Object.keys(userErrors).length === 0);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForms()) {
      onSubmit(users);
    }
  };

  // Handle JSON file upload
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonContent = event.target?.result as string;
        // The JSON format appears to be non-standard, so we need to fix it
        // Assuming the content is an array of user objects wrapped in another object
        // We'll try to parse it and handle potential format issues
        
        let parsedData;
        try {
          // Standard JSON parsing
          parsedData = JSON.parse(jsonContent);
        } catch {
          // Try to fix the format by adding square brackets and proper commas
          const fixedContent = jsonContent
            .replace(/^\s*{/, '[')
            .replace(/}\s*$/, ']')
            .replace(/}\s*,?\s*{/g, '},{');
          
          parsedData = JSON.parse(fixedContent);
        }
        
        // If parsedData is an object with nested objects, convert to array
        if (parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData)) {
          parsedData = Object.values(parsedData);
        }
        
        // Ensure we have an array of user objects
        if (Array.isArray(parsedData)) {
          // Filter out any items that don't match the user structure
          const validUsers = parsedData.filter(item => 
            item && 
            typeof item === 'object' && 
            'name' in item && 
            'email' in item && 
            'username' in item
          );
          
          if (validUsers.length > 0) {
            setUsers(validUsers);
            setErrors(validUsers.map(() => ({})));
          } else {
            alert('No valid user data found in the JSON file');
          }
        } else {
          throw new Error('Invalid JSON format');
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
        alert('Invalid JSON format. Please check the file and try again.');
      }
    };
    
    reader.readAsText(file);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Export JSON template
  const downloadTemplate = () => {
    const template = [
      {
        name: "Example User", 
        email: "user@example.com", 
        username: "exampleuser", 
        password: "password123", 
        isAdmin: false
      },
      {
        name: "Admin User", 
        email: "admin@example.com", 
        username: "adminuser", 
        password: "password123", 
        isAdmin: true
      }
    ];
    
    const jsonString = JSON.stringify(template, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-lg font-medium mb-4">Add Multiple Users</h2>
      
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={downloadTemplate}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Download JSON Template
        </button>
        
        <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
          <span>Upload JSON File</span>
          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-2 grid grid-cols-10 gap-2 text-xs font-medium text-gray-700 px-2">
          <div className="col-span-2">Full Name</div>
          <div className="col-span-2">Email Address</div>
          <div className="col-span-2">Username</div>
          <div className="col-span-2">Password</div>
          <div className="col-span-1">Admin</div>
          <div className="col-span-1"></div>
        </div>
        
        <div className="space-y-3">
          {users.map((user, index) => (
            <div key={index} className="grid grid-cols-10 gap-2 items-start">
              <div className="col-span-2">
                <input
                  type="text"
                  name="name"
                  value={user.name || ''}
                  onChange={(e) => handleChange(index, e)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    errors[index]?.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Full Name"
                />
                {errors[index]?.name && (
                  <p className="mt-1 text-xs text-red-600">{errors[index].name}</p>
                )}
              </div>
              
              <div className="col-span-2">
                <input
                  type="email"
                  name="email"
                  value={user.email || ''}
                  onChange={(e) => handleChange(index, e)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    errors[index]?.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Email Address"
                />
                {errors[index]?.email && (
                  <p className="mt-1 text-xs text-red-600">{errors[index].email}</p>
                )}
              </div>
              
              <div className="col-span-2">
                <input
                  type="text"
                  name="username"
                  value={user.username || ''}
                  onChange={(e) => handleChange(index, e)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    errors[index]?.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Username"
                />
                {errors[index]?.username && (
                  <p className="mt-1 text-xs text-red-600">{errors[index].username}</p>
                )}
              </div>
              
              <div className="col-span-2">
                <input
                  type="password"
                  name="password"
                  value={user.password || ''}
                  onChange={(e) => handleChange(index, e)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    errors[index]?.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Password"
                />
                {errors[index]?.password && (
                  <p className="mt-1 text-xs text-red-600">{errors[index].password}</p>
                )}
              </div>
              
              <div className="col-span-1 flex items-center justify-center h-full pt-2">
                <input
                  type="checkbox"
                  name="isAdmin"
                  checked={user.isAdmin || false}
                  onChange={(e) => handleChange(index, e)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="col-span-1 flex items-center justify-center h-full pt-2">
                <button
                  type="button"
                  onClick={() => removeUserRow(index)}
                  disabled={users.length === 1}
                  className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                  title="Remove user"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4">
          <button
            type="button"
            onClick={addUserRow}
            className="flex items-center px-3 py-2 text-sm font-medium text-blue-700 hover:text-blue-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Another User
          </button>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add {users.length > 1 ? `${users.length} Users` : 'User'}
          </button>
        </div>
      </form>
    </div>
  );
};