'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Database, Zap, Shield, Info, RotateCcw, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api/optimized-client';

interface PerformanceSettings {
  enableCaching: boolean;
  cacheTimeout: number;
  maxConcurrentRequests: number;
  enableRateLimit: boolean;
  autoCleanup: boolean;
  prefetchResults: boolean;
}

const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<PerformanceSettings>({
    enableCaching: true,
    cacheTimeout: 300, // 5 minutes
    maxConcurrentRequests: 5,
    enableRateLimit: true,
    autoCleanup: true,
    prefetchResults: false
  });

  const [cacheStats, setCacheStats] = useState<any>(null);
  const [rateLimitStats, setRateLimitStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('hexa-performance-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Load initial stats
    loadStats();
  }, []);

  const loadStats = () => {
    setCacheStats(apiClient.getCacheStats());
    setRateLimitStats(apiClient.getRateLimitStats());
  };

  const handleSettingChange = (key: keyof PerformanceSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('hexa-performance-settings', JSON.stringify(newSettings));
  };

  const clearCache = async () => {
    setIsLoading(true);
    try {
      apiClient.clearCache();
      loadStats();
    } finally {
      setIsLoading(false);
    }
  };

  const resetRateLimits = async () => {
    setIsLoading(true);
    try {
      apiClient.resetRateLimits();
      loadStats();
    } finally {
      setIsLoading(false);
    }
  };

  const resetAllSettings = () => {
    const defaultSettings: PerformanceSettings = {
      enableCaching: true,
      cacheTimeout: 300,
      maxConcurrentRequests: 5,
      enableRateLimit: true,
      autoCleanup: true,
      prefetchResults: false
    };
    setSettings(defaultSettings);
    localStorage.setItem('hexa-performance-settings', JSON.stringify(defaultSettings));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Performance Settings</h2>
      </div>

      {/* Performance Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Performance Options</h3>
        </div>

        <div className="space-y-4">
          {/* Enable Caching */}
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="enableCaching" className="text-sm font-medium text-gray-700">
                Enable Caching
              </label>
              <p className="text-xs text-gray-500">Cache search results to improve performance</p>
            </div>
            <input
              id="enableCaching"
              type="checkbox"
              checked={settings.enableCaching}
              onChange={(e) => handleSettingChange('enableCaching', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>

          {/* Cache Timeout */}
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="cacheTimeout" className="text-sm font-medium text-gray-700">
                Cache Timeout (seconds)
              </label>
              <p className="text-xs text-gray-500">How long to keep cached results</p>
            </div>
            <select
              id="cacheTimeout"
              value={settings.cacheTimeout}
              onChange={(e) => handleSettingChange('cacheTimeout', parseInt(e.target.value))}
              className="rounded border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              <option value={60}>1 minute</option>
              <option value={300}>5 minutes</option>
              <option value={600}>10 minutes</option>
              <option value={1800}>30 minutes</option>
              <option value={3600}>1 hour</option>
            </select>
          </div>

          {/* Max Concurrent Requests */}
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="maxConcurrentRequests" className="text-sm font-medium text-gray-700">
                Max Concurrent Requests
              </label>
              <p className="text-xs text-gray-500">Number of simultaneous API requests</p>
            </div>
            <select
              id="maxConcurrentRequests"
              value={settings.maxConcurrentRequests}
              onChange={(e) => handleSettingChange('maxConcurrentRequests', parseInt(e.target.value))}
              className="rounded border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              <option value={1}>1</option>
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
          </div>

          {/* Enable Rate Limiting */}
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="enableRateLimit" className="text-sm font-medium text-gray-700">
                Enable Rate Limiting
              </label>
              <p className="text-xs text-gray-500">Prevent API abuse and ensure stability</p>
            </div>
            <input
              id="enableRateLimit"
              type="checkbox"
              checked={settings.enableRateLimit}
              onChange={(e) => handleSettingChange('enableRateLimit', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>

          {/* Auto Cleanup */}
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="autoCleanup" className="text-sm font-medium text-gray-700">
                Auto Cleanup
              </label>
              <p className="text-xs text-gray-500">Automatically clean expired cache entries</p>
            </div>
            <input
              id="autoCleanup"
              type="checkbox"
              checked={settings.autoCleanup}
              onChange={(e) => handleSettingChange('autoCleanup', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>

          {/* Prefetch Results */}
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="prefetchResults" className="text-sm font-medium text-gray-700">
                Prefetch Results
              </label>
              <p className="text-xs text-gray-500">Load related content in advance</p>
            </div>
            <input
              id="prefetchResults"
              type="checkbox"
              checked={settings.prefetchResults}
              onChange={(e) => handleSettingChange('prefetchResults', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
        </div>
      </div>

      {/* Cache Statistics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Cache Statistics</h3>
          </div>
          <button
            onClick={clearCache}
            disabled={isLoading}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            title="Clear all cached data"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear Cache</span>
          </button>
        </div>

        {cacheStats && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded p-3">
              <div className="text-sm text-gray-600">Cached Entries</div>
              <div className="text-2xl font-bold text-gray-900">{cacheStats.size}</div>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <div className="text-sm text-gray-600">Memory Usage</div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(cacheStats.size * 0.1)}KB
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rate Limit Statistics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Rate Limit Status</h3>
          </div>
          <button
            onClick={resetRateLimits}
            disabled={isLoading}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded transition-colors"
            title="Reset rate limit counters"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Limits</span>
          </button>
        </div>

        {rateLimitStats && (
          <div className="space-y-3">
            {Object.entries(rateLimitStats).map(([key, stats]: [string, any]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="text-sm font-medium text-gray-900 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stats.activeIdentifiers} active • Max: {stats.maxRequests}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    {stats.maxRequests - (stats.entries[0]?.count || 0)} remaining
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Info className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={resetAllSettings}
            className="flex items-center space-x-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset to Defaults</span>
          </button>
          
          <button
            onClick={loadStats}
            className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
          >
            <Database className="h-4 w-4" />
            <span>Refresh Stats</span>
          </button>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-2">Performance Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Enable caching for faster repeat searches</li>
              <li>• Lower concurrent requests if experiencing timeouts</li>
              <li>• Use longer cache timeouts for stable research topics</li>
              <li>• Enable auto cleanup to prevent memory buildup</li>
              <li>• Monitor rate limits to avoid API restrictions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
