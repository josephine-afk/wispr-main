'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthErrorPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home with error parameter
    router.push('/?x_error=true');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#e8e8e8] dark:bg-black">
      <div className="text-center">
        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
        <p className="mt-4 text-red-600 dark:text-red-400">Authentication failed. Redirecting...</p>
      </div>
    </div>
  );
}