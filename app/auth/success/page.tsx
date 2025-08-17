'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get tokens from URL if present
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const username = searchParams.get('username');
    
    if (accessToken && refreshToken) {
      // Store tokens
      localStorage.setItem('token', accessToken);
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      if (username) {
        localStorage.setItem('username', username);
      }
      localStorage.setItem('x_connected', 'true');
      
      // Redirect with tokens in URL for the AuthContext to handle
      router.push(`/?access_token=${accessToken}&refresh_token=${refreshToken}&username=${username || ''}`);
    } else {
      // Just redirect with success flag
      router.push('/?x_connected=true');
    }
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#e8e8e8] dark:bg-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
        <p className="mt-4 text-gray-700 dark:text-gray-300">Connecting your X account...</p>
      </div>
    </div>
  );
}