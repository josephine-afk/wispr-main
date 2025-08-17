'use client';

import Navbar from './components/Navbar';
import Leaderboard from './components/Leaderboard';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#e8e8e8] dark:bg-black transition-colors duration-300">
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-16 pt-36">
        <div className="mt-8">
          
          <Leaderboard />

          {/* Content - Featured Projects */}
          <div className="min-h-[500px] mt-20">
            <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-200 mb-8">Featured on Mindshare</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-[#101112] p-12 rounded-2xl hover:shadow-lg dark:hover:bg-[#151617] transition-all duration-300">
                <h3 className="text-2xl font-normal mb-4 text-gray-900 dark:text-white">AI Assistant</h3>
                <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">Next-generation AI-powered productivity tool</p>
              </div>
              <div className="bg-white dark:bg-[#101112] p-12 rounded-2xl hover:shadow-lg dark:hover:bg-[#151617] transition-all duration-300">
                <h3 className="text-2xl font-normal mb-4 text-gray-900 dark:text-white">Design System</h3>
                <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">Comprehensive component library for modern apps</p>
              </div>
              <div className="bg-white dark:bg-[#101112] p-12 rounded-2xl hover:shadow-lg dark:hover:bg-[#151617] transition-all duration-300">
                <h3 className="text-2xl font-normal mb-4 text-gray-900 dark:text-white">Data Platform</h3>
                <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">Real-time analytics and insights dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}