'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: 'How do I add a new user?',
    answer: 'To add a new user, go to the Users page and click on the "Add User" button. Fill in the required information in the form that appears and click "Add User" to create a new user account. If you cant se user page you are not a Admin of the system. Only administrators can create users'
  },
  {
    question: 'How do I update user information?',
    answer: 'To update user information, navigate to the Users page, find the user you want to edit, and click the "Edit" button in the Actions column. Make your changes in the form and click "Update User" to save your changes.'
  },
  {
    question: 'How do I delete a user?',
    answer: 'To delete a user, go to the Users page, find the user you want to remove, and click the "Delete" button in the Actions column. A confirmation dialog will appear; click "Delete" to confirm the removal of the user.'
  },
  {
    question: 'How can i add multiple users at once?',
    answer: 'To add a new user, go to the Users page and click on the "Add Multiple User" button. Upload your structured json and press Add users. You can get the the template for the json by clicking Download JSON template'
  },
  {
    question: 'How can I login to anythingLLM?',
    answer: 'User can only access AnythingLLM from the management service. By clicking on anythingLLM in the sidebar you get authenticated and redirected into your anytingLLM profile.'
  },
  {
    question: 'How do I add a new Project?',
    answer: 'To add a new user, go to the Projects page and click on the "Add Project" button. Fill in the required information in the form that appears and click "Add Project" to create a new project. If you cant se project page you are not a Admin of the system. Only administrators can create projects'
  },
  {
    question: 'Who can edit Project informations?',
    answer: 'Only administrators can edit Project informations'
  },
  {
    question: 'Who can manage users in a project?',
    answer: 'Administrators can manage user in any project. Users can only manage users within projects where they have the role project lead'
  },
  {
    question: 'Who can manage workspaces in a project?',
    answer: 'Administrators can manage workspaces in any project. Users can only manage workspaces within projects where they have the role project lead'
  },
  {
    question: 'Who can manage files in a project?',
    answer: 'Administrators can manage files in any project. Users can only manage files within projects where they have the role project lead'
  },
  {
    question: 'How can I add users to a workspace?',
    answer: 'To add a user to a workspace, the user has to be in the project where the workspace belong to. If they are not in the project add them first to the project. In the woerkspace page you can click add user. In the modal you will see all the users that are in the project and not yet assaigned to the workspace.'
  },
  {
    question: 'How can I add files to a workspace?',
    answer: 'To add a file to a workspace, the file has to be in the project where the workspace belong to. If its are not in the project add it first to the project. In the woerkspace page you can click add file. In the modal you will see all the files that are in the project and not yet assaigned to the workspace.'
  },
  {
    question: 'What types of file can be uploaded?',
    answer: 'Any text based types can be uploaded for example PDFs, word documents, CSV, codebases, and more. For more information check anythingLlm documentation.'
  },
];

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  
  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const toggleFAQ = (index: number) => {
    if (expandedFAQ === index) {
      setExpandedFAQ(null);
    } else {
      setExpandedFAQ(index);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="Help Center" />
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">How can we help you today?</h2>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search help articles..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-medium text-gray-900">Frequently Asked Questions</h3>
          
          {filteredFAQs.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No results found for. Try a different search term.
            </div>
          ) : (
            filteredFAQs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-md">
                <button
                  className="flex justify-between items-center w-full px-4 py-3 text-left focus:outline-none"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="text-sm font-medium text-gray-900">{faq.question}</span>
                  <svg
                    className={`h-5 w-5 text-gray-500 transform ${expandedFAQ === index ? 'rotate-180' : ''} transition-transform duration-200`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                
                {expandedFAQ === index && (
                  <div className="px-4 py-3 text-sm text-gray-600 border-t border-gray-200 bg-gray-50">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Need More Help?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-md p-4 hover:border-blue-500 transition-colors">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-blue-100 rounded-full mr-3">
                <svg
                  className="h-6 w-6 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-md font-medium text-gray-900">Contact Support</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Our support team is here to help you with any questions or issues you might have.
            </p>
            <a
              href="mailto:dare@edag.com"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Email us at dare@edag.com
            </a>
          </div>
          
          <div className="border border-gray-200 rounded-md p-4 hover:border-blue-500 transition-colors">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-purple-100 rounded-full mr-3">
                <svg
                  className="h-6 w-6 text-purple-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-md font-medium text-gray-900">Documentation</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Access our comprehensive documentation for detailed instructions on using all features of the application.
            </p>
            <a
              href="https://weedag.sharepoint.com/sites/--DARE/SitePages/Open-EDAG-AI-Plattform.aspx"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              View documentation
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}