'use client';

import { useState, useEffect } from 'react';
import { Star, GitBranch, Eye, ArrowUpRight, Code, Package, Zap, Shield, Cloud, Database } from 'lucide-react';
import Navbar from '../components/Navbar';

interface Project {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  avatar_url?: string;
  followers_count: number;
  smart_followers_count: number;
  global_points: number;
  stats?: {
    followers_growth: number;
    engagement_count: number;
    momentum: 'rising' | 'falling' | 'stable';
    sparkline: number[];
    period: string;
  };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.wispr.top/projects?include_stats=true&stats_period=7d');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.data && Array.isArray(data.data)) {
          setProjects(data.data.slice(0, 20)); // Get first 20 projects
        } else if (Array.isArray(data)) {
          setProjects(data.slice(0, 20));
        } else {
          setProjects([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Failed to fetch projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-[#e8e8e8] dark:bg-black transition-colors duration-300">
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-16 pt-36">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white inline-flex items-center gap-2">
                <span className="text-green-500 font-mono text-sm">$</span>
                Projects
                <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-500 rounded font-mono uppercase">
                  {projects.length} projects
                </span>
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-mono">
                /wispr/projects
              </p>
            </div>
            <div className="text-xs text-gray-400 font-mono">
              Last sync: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-8 bg-white/50 dark:bg-black/30 backdrop-blur-sm text-center">
            <div className="text-gray-500 dark:text-gray-400 font-mono text-sm">Loading projects...</div>
          </div>
        ) : error ? (
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-8 bg-white/50 dark:bg-black/30 backdrop-blur-sm text-center">
            <div className="text-red-500 font-mono text-sm">{error}</div>
          </div>
        ) : (
          <>
            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group relative border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white/50 dark:bg-black/30 backdrop-blur-sm hover:bg-white dark:hover:bg-black/50 transition-all cursor-pointer"
                >
                  {/* Status Badge */}
                  {project.stats?.momentum && (
                    <div className="absolute top-4 right-4">
                      <span className={`text-xs font-mono px-2 py-1 rounded ${
                        project.stats.momentum === 'rising' ? 'bg-green-500/10 text-green-500' :
                        project.stats.momentum === 'falling' ? 'bg-red-500/10 text-red-500' :
                        'bg-gray-500/10 text-gray-500'
                      }`}>
                        {project.stats.momentum}
                      </span>
                    </div>
                  )}

                  {/* Project Header */}
                  <div className="flex items-start gap-3 mb-3">
                    {project.avatar_url ? (
                      <img 
                        src={project.avatar_url} 
                        alt={project.display_name}
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Code className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-mono text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {project.display_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {project.description || `@${project.name}`}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Star className="w-3 h-3" />
                        <span className="font-mono">{project.global_points.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Eye className="w-3 h-3" />
                        <span className="font-mono">{project.followers_count.toLocaleString()}</span>
                      </div>
                      {project.stats?.followers_growth && project.stats.followers_growth > 0 && (
                        <div className="flex items-center gap-1 text-green-500">
                          <span className="font-mono">+{project.stats.followers_growth}</span>
                        </div>
                      )}
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Smart Followers */}
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-xs text-gray-400 font-mono">
                      {project.smart_followers_count.toLocaleString()} smart followers
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            {projects.length > 0 && (
              <div className="mt-8 text-center">
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded text-sm font-mono text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  Load more...
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}