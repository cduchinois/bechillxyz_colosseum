import React, { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function ToastTest() {
  useEffect(() => {
    // Show a success toast when the component mounts
    toast.success('This is a test success toast');
    
    // Show an error toast after 2 seconds
    const timer = setTimeout(() => {
      toast.error('This is a test error toast');
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="p-8">
      <Toaster position="top-right" toastOptions={{ duration: 5000 }} />
      <h1 className="text-2xl font-bold mb-4">Toast Test Page</h1>
      <p>This page tests the toast notification functionality.</p>
      <button 
        onClick={() => toast.success('Button clicked toast')}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Show Another Toast
      </button>
    </div>
  );
}
