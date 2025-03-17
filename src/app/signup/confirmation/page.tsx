'use client';
import { useRouter } from 'next/navigation';
import React from 'react';

const confirmation: React.FC = () => {
  const router = useRouter();

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-green-600">Registration Successful!</h2>
        <p className="text-gray-700 mt-2">Your account has been created successfully.</p>
        <p className="text-gray-700">You can now log in using your credentials.</p>

        <button
          onClick={() => router.push('/login')}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default confirmation;
