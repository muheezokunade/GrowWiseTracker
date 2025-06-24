import React from 'react';
import { useLocation } from 'wouter';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setLocation('/')}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center justify-center"
          >
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}