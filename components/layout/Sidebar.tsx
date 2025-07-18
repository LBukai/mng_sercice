// components/layout/Sidebar.tsx
'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAnythingLLM } from '@/hooks/useAnythingLLM';

// Define navigation items with admin requirements
const navigationItems = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    adminOnly: true 
  },
  { 
    name: 'My Projects', 
    href: '/my-projects', 
    icon: 'M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    adminOnly: false 
  },
  { 
    name: 'Users', 
    href: '/users', 
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    adminOnly: true 
  },
  { 
    name: 'Projects', 
    href: '/projects', 
    icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    adminOnly: true 
  },
  { 
    name: 'Help', 
    href: '/help', 
    icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    adminOnly: false 
  },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const isAdmin = user?.isAdmin || false;
  const { redirectToAnythingLLM, isLoading: isAnythingLLMLoading } = useAnythingLLM();

  // Filter navigation items based on admin status
  const visibleNavigationItems = navigationItems.filter(item => {
    if (item.adminOnly && !isAdmin) {
      return false; // Hide admin-only items from non-admin users
    }
    return true;
  });

  const handleAnythingLLMClick = async () => {
    await redirectToAnythingLLM();
  };

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-gray-800">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <img 
                src="/edag.png" 
                alt="EDAG" 
                className="h-8 w-auto"
              />
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1 flex flex-col">
              <div className="space-y-1">
                {visibleNavigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <svg
                        className={`mr-3 h-6 w-6 ${
                          isActive ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d={item.icon}
                        />
                      </svg>
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              
              {/* Open EDAG AI Button*/}
              <div className="mt-auto">
                <button
                  onClick={handleAnythingLLMClick}
                  disabled={isAnythingLLMLoading}
                  className="group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md bg-gray-700 text-gray-400 hover:bg-gray-900 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <img
                    src="edag-icon.svg"
                    alt="Open EDAG AI"
                    className="mr-3 h-6 w-6 filter grayscale opacity-60 group-hover:opacity-80"
                    style={{
                      filter: 'grayscale(1) brightness(0.8)'
                    }}
                  />
                  {isAnythingLLMLoading ? 'Opening...' : 'Open EDAG AI'}
                </button>
              </div>
            </nav>
          </div>
          
          {/* User Info Section */}
          <div className="flex-shrink-0 flex bg-gray-700 p-4">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs font-medium text-gray-300">{user?.email}</p>
                {isAdmin && (
                  <p className="text-xs font-medium text-yellow-400">Admin</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};