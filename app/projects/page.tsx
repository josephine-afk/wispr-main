'use client';

import { useState } from 'react';
import { Star, GitBranch, Eye, ArrowUpRight, Code, Package, Zap, Shield, Cloud, Database } from 'lucide-react';
import Navbar from '../components/Navbar';

interface Project {
  id: number;
  name: string;
  description: string;
  stars: number;
  forks: number;
  views: number;
  language: string;
  languageColor: string;
  status: 'active' | 'archived' | 'beta';
  lastUpdate: string;
  tags: string[];
  icon: React.ElementType;
}

const projects: Project[] = [
  {
    id: 1,
    name: 'neural-engine',
    description: 'High-performance ML inference engine with ONNX runtime support',
    stars: 3427,
    forks: 892,
    views: 12847,
    language: 'Rust',
    languageColor: '#dea584',
    status: 'active',
    lastUpdate: '2 hours ago',
    tags: ['ai', 'performance', 'rust'],
    icon: Zap
  },
  {
    id: 2,
    name: 'quantum-sdk',
    description: 'Quantum computing SDK for hybrid classical-quantum algorithms',
    stars: 2891,
    forks: 643,
    views: 9821,
    language: 'Python',
    languageColor: '#3572A5',
    status: 'beta',
    lastUpdate: '5 hours ago',
    tags: ['quantum', 'sdk', 'research'],
    icon: Code
  },
  {
    id: 3,
    name: 'cipher-vault',
    description: 'Zero-knowledge encryption vault with distributed key management',
    stars: 4102,
    forks: 1203,
    views: 15234,
    language: 'Go',
    languageColor: '#00ADD8',
    status: 'active',
    lastUpdate: '1 day ago',
    tags: ['security', 'encryption', 'privacy'],
    icon: Shield
  },
  {
    id: 4,
    name: 'edge-compute',
    description: 'Serverless edge computing platform with global CDN integration',
    stars: 5234,
    forks: 1456,
    views: 18976,
    language: 'TypeScript',
    languageColor: '#2b7489',
    status: 'active',
    lastUpdate: '3 hours ago',
    tags: ['cloud', 'serverless', 'edge'],
    icon: Cloud
  },
  {
    id: 5,
    name: 'data-mesh',
    description: 'Distributed data mesh architecture for real-time analytics',
    stars: 2167,
    forks: 532,
    views: 7234,
    language: 'Scala',
    languageColor: '#c22d40',
    status: 'active',
    lastUpdate: '12 hours ago',
    tags: ['data', 'analytics', 'distributed'],
    icon: Database
  },
  {
    id: 6,
    name: 'micro-core',
    description: 'Lightweight microservices framework with built-in observability',
    stars: 3892,
    forks: 923,
    views: 11234,
    language: 'Java',
    languageColor: '#b07219',
    status: 'active',
    lastUpdate: '6 hours ago',
    tags: ['microservices', 'framework', 'java'],
    icon: Package
  }
];

export default function ProjectsPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'beta' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'stars' | 'recent' | 'views'>('stars');

  const filteredProjects = projects
    .filter(p => filter === 'all' || p.status === filter)
    .sort((a, b) => {
      if (sortBy === 'stars') return b.stars - a.stars;
      if (sortBy === 'views') return b.views - a.views;
      return 0; // For 'recent', we'd normally sort by date
    });

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
                  {filteredProjects.length} repos
                </span>
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-mono">
                /wispr/repositories
              </p>
            </div>
            <div className="text-xs text-gray-400 font-mono">
              Last sync: {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {(['all', 'active', 'beta', 'archived'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1.5 text-xs font-mono rounded transition-all ${
                    filter === status
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-mono">sort:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-mono bg-transparent border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600"
              >
                <option value="stars">stars</option>
                <option value="recent">recent</option>
                <option value="views">views</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((project) => {
            const Icon = project.icon;
            return (
              <div
                key={project.id}
                className="group relative border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white/50 dark:bg-black/30 backdrop-blur-sm hover:bg-white dark:hover:bg-black/50 transition-all cursor-pointer"
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`text-xs font-mono px-2 py-1 rounded ${
                    project.status === 'active' ? 'bg-green-500/10 text-green-500' :
                    project.status === 'beta' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-gray-500/10 text-gray-500'
                  }`}>
                    {project.status}
                  </span>
                </div>

                {/* Project Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-mono text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {project.description}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {project.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="text-xs font-mono px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.languageColor }} />
                      <span className="text-gray-600 dark:text-gray-400 font-mono">{project.language}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Star className="w-3 h-3" />
                      <span className="font-mono">{project.stars.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <GitBranch className="w-3 h-3" />
                      <span className="font-mono">{project.forks.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Eye className="w-3 h-3" />
                      <span className="font-mono">{project.views.toLocaleString()}</span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Last Update */}
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-400 font-mono">
                    updated {project.lastUpdate}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded text-sm font-mono text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
            Load more...
          </button>
        </div>
      </div>
    </div>
  );
}