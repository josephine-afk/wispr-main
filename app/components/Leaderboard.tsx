'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { TrendingUp, TrendingDown, Minus, Activity, Users, Brain } from 'lucide-react';
import Sparkline from './Sparkline';

interface ProjectStats {
  followers_growth: number;
  engagement_count: number;
  momentum: 'rising' | 'falling' | 'stable';
  sparkline: number[];
  period: string;
}

interface LeaderboardProject {
  id: string;
  name: string;
  display_name: string;
  username?: string;
  avatar_url?: string;
  followers_count: number;
  smart_followers_count: number;
  global_points: number;
  stats?: ProjectStats;
}

type MetricType = 'points' | 'followers_growth' | 'smart_followers' | 'engagement';

export default function Leaderboard() {
  const [timePeriod, setTimePeriod] = useState<'24h' | '7d' | '30d'>('7d');
  const [metric, setMetric] = useState<MetricType>('points');
  const [projects, setProjects] = useState<LeaderboardProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the correct endpoint with stats
        const response = await fetch(
          `https://api.wispr.top/projects?include_stats=true&stats_period=${timePeriod}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
            mode: 'cors',
          }
        );
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', response.status, errorText);
          throw new Error(`Failed to fetch projects: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data); // Debug log
        
        // Handle the response structure
        if (data.data && Array.isArray(data.data)) {
          // API returns { data: [...] }
          setProjects(data.data);
          setLastUpdated(new Date().toLocaleTimeString());
        } else if (Array.isArray(data)) {
          setProjects(data);
          setLastUpdated(new Date().toLocaleTimeString());
        } else if (data.projects && Array.isArray(data.projects)) {
          setProjects(data.projects);
          setLastUpdated(new Date().toLocaleTimeString());
        } else {
          console.error('Unexpected API response structure:', data);
          setProjects([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Failed to fetch projects:', err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchLeaderboard, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [timePeriod]); // Re-fetch when time period changes

  // Sort projects by the selected metric
  const sortedProjects = [...projects].sort((a, b) => {
    let aValue = 0;
    let bValue = 0;
    
    switch (metric) {
      case 'points':
        aValue = a.global_points || 0;
        bValue = b.global_points || 0;
        break;
      case 'followers_growth':
        aValue = a.stats?.followers_growth || 0;
        bValue = b.stats?.followers_growth || 0;
        break;
      case 'smart_followers':
        aValue = a.smart_followers_count || 0;
        bValue = b.smart_followers_count || 0;
        break;
      case 'engagement':
        aValue = a.stats?.engagement_count || 0;
        bValue = b.stats?.engagement_count || 0;
        break;
    }
    
    return bValue - aValue; // Sort descending
  });

  const getMetricLabel = (metric: MetricType) => {
    switch (metric) {
      case 'points': return 'Pts';
      case 'followers_growth': return '+Fol';
      case 'smart_followers': return 'Smart';
      case 'engagement': return 'Eng';
    }
  };

  return (
    <div className="w-full max-w-[900px] mx-auto">
      {/* Title Section */}
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white inline-flex items-center gap-2" style={{ marginBottom: '0.3rem' }}>
          <span className="text-green-500 font-mono text-sm">$</span>
          Projects
          <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded font-mono uppercase">Live</span>
        </h1>
        
        {/* Subtitle and Time Period Selector Row */}
        <div className="flex items-start justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
            /projects/{metric.replace('_', '-')}/{timePeriod === '24h' ? 'daily' : timePeriod === '7d' ? 'weekly' : 'monthly'}
          </p>
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg mt-2">
            <button
              onClick={() => setTimePeriod('24h')}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
                timePeriod === '24h'
                  ? 'bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              24h
            </button>
            <button
              onClick={() => setTimePeriod('7d')}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
                timePeriod === '7d'
                  ? 'bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              7d
            </button>
            <button
              onClick={() => setTimePeriod('30d')}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
                timePeriod === '30d'
                  ? 'bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              30d
            </button>
          </div>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMetric('points')}
          className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
            metric === 'points'
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Points
        </button>
        <button
          onClick={() => setMetric('followers_growth')}
          className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
            metric === 'followers_growth'
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Growth
        </button>
        <button
          onClick={() => setMetric('smart_followers')}
          className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
            metric === 'smart_followers'
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Smart
        </button>
        <button
          onClick={() => setMetric('engagement')}
          className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
            metric === 'engagement'
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Engagement
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-8 bg-white/50 dark:bg-black/30 backdrop-blur-sm text-center">
          <div className="text-gray-500 dark:text-gray-400 font-mono text-sm">Loading leaderboard...</div>
        </div>
      ) : error ? (
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-8 bg-white/50 dark:bg-black/30 backdrop-blur-sm text-center">
          <div className="text-red-500 font-mono text-sm">{error}</div>
        </div>
      ) : (
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white/50 dark:bg-black/30 backdrop-blur-sm">
        <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 text-xs font-mono text-gray-500 uppercase">
          <div className="col-span-1">#</div>
          <div className="col-span-3">Project</div>
          <div className="col-span-2 text-right">Followers</div>
          <div className="col-span-2 text-right">Smart %</div>
          <div className="col-span-1 text-right">{getMetricLabel(metric)}</div>
          <div className="col-span-2 text-center">Trend</div>
          <div className="col-span-1"></div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {sortedProjects.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 font-mono text-sm">
              No projects found
            </div>
          ) : (
            sortedProjects.map((project, index) => {
            const rank = index + 1;
            
            // Get the metric value based on selected metric
            let metricValue = 0;
            switch (metric) {
              case 'points':
                metricValue = project.global_points || 0;
                break;
              case 'followers_growth':
                metricValue = project.stats?.followers_growth || 0;
                break;
              case 'smart_followers':
                metricValue = project.smart_followers_count || 0;
                break;
              case 'engagement':
                metricValue = project.stats?.engagement_count || 0;
                break;
            }
            
            return (
              <div
                key={project.id}
                className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group cursor-pointer"
              >
                {/* Rank */}
                <div className="col-span-1 flex items-center">
                  <span className={`font-mono text-sm ${
                    rank === 1 ? 'text-yellow-500 font-bold' :
                    rank === 2 ? 'text-gray-400 font-bold' :
                    rank === 3 ? 'text-orange-400 font-bold' :
                    'text-gray-500'
                  }`}>
                    {rank.toString().padStart(2, '0')}
                  </span>
                </div>

                {/* Project Info */}
                <div className="col-span-3 flex items-center gap-2">
                  {project.avatar_url ? (
                    <img 
                      src={project.avatar_url} 
                      alt={project.display_name}
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      rank <= 3 
                        ? 'bg-black text-white dark:bg-white dark:text-black' 
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {project.display_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="truncate">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {project.display_name}
                      </span>
                    </div>
                    <div className="truncate">
                      <span className="text-xs text-gray-400 font-mono">
                        @{project.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Followers */}
                <div className="col-span-2 flex items-center justify-end gap-1">
                  <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                    {project.followers_count.toLocaleString()}
                  </span>
                  {project.stats?.followers_growth && project.stats.followers_growth > 0 && (
                    <span className="text-xs font-mono text-green-500">
                      +{project.stats.followers_growth}
                    </span>
                  )}
                </div>

                {/* Smart Followers */}
                <div className="col-span-2 flex items-center justify-end">
                  <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                    {project.followers_count > 0 
                      ? `${((project.smart_followers_count / project.followers_count) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </span>
                </div>

                {/* Selected Metric */}
                <div className="col-span-1 flex items-center justify-end">
                  <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                    {metricValue.toLocaleString()}
                  </span>
                </div>

                {/* Sparkline & Momentum */}
                <div className="col-span-2 flex items-center justify-center gap-2">
                  {project.stats?.sparkline && project.stats.sparkline.length > 0 && (
                    <Sparkline 
                      data={project.stats.sparkline} 
                      color={
                        project.stats.momentum === 'rising' ? 'green' : 
                        project.stats.momentum === 'falling' ? 'red' : 
                        'gray'
                      }
                      width={50}
                      height={18}
                    />
                  )}
                  <div className="flex items-center gap-1">
                    {project.stats?.momentum === 'rising' && (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    )}
                    {project.stats?.momentum === 'falling' && (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                    {(!project.stats || project.stats.momentum === 'stable') && (
                      <Minus className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Action */}
                <div className="col-span-1 flex items-center justify-end">
                  <button className="opacity-0 group-hover:opacity-100 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all font-mono">
                    →
                  </button>
                </div>
              </div>
            );
          })
          )}
        </div>
      </div>
      )}

      {/* Bottom Actions */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-mono transition-colors">
            ← Previous
          </button>
          <span className="text-gray-400 font-mono">Page 1 of 10</span>
          <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-mono transition-colors">
            Next →
          </button>
        </div>
        <div className="text-gray-400 font-mono">
          {lastUpdated && `Last updated: ${lastUpdated}`}
        </div>
      </div>
    </div>
  );
}