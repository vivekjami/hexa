'use client';

import React, { useState } from 'react';
import { X, Calendar, Globe, Tag, Filter, Settings } from 'lucide-react';

interface AdvancedSearchOptions {
  dateRange?: {
    start?: string;
    end?: string;
  };
  domains?: string[];
  sourceTypes?: ('academic' | 'news' | 'government' | 'commercial' | 'blog' | 'social')[];
  language?: string;
  region?: string;
  categories?: string[];
  excludeTerms?: string[];
  sortBy?: 'relevance' | 'date' | 'credibility';
  maxResults?: number;
}

interface Props {
  options: AdvancedSearchOptions;
  onChange: (options: AdvancedSearchOptions) => void;
  onClose: () => void;
}

const AdvancedSearchOptionsComponent: React.FC<Props> = ({ options, onChange, onClose }) => {
  const [localOptions, setLocalOptions] = useState<AdvancedSearchOptions>(options);

  const sourceTypeOptions = [
    { value: 'academic', label: 'Academic Papers', icon: '🎓', color: 'blue' },
    { value: 'news', label: 'News Articles', icon: '📰', color: 'green' },
    { value: 'government', label: 'Government Sources', icon: '🏛️', color: 'red' },
    { value: 'commercial', label: 'Commercial Sites', icon: '🏢', color: 'purple' },
    { value: 'blog', label: 'Blogs & Opinions', icon: '✍️', color: 'orange' },
    { value: 'social', label: 'Social Media', icon: '📱', color: 'pink' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ar', label: 'Arabic' },
    { value: 'ru', label: 'Russian' }
  ];

  const regionOptions = [
    { value: 'global', label: 'Global' },
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
    { value: 'jp', label: 'Japan' },
    { value: 'cn', label: 'China' }
  ];

  const categoryOptions = [
    'Technology', 'Science', 'Health', 'Business', 'Politics', 'Education',
    'Environment', 'Culture', 'Sports', 'Entertainment', 'History', 'Economics'
  ];

  const handleApply = () => {
    onChange(localOptions);
    onClose();
  };

  const handleReset = () => {
    const resetOptions: AdvancedSearchOptions = {};
    setLocalOptions(resetOptions);
    onChange(resetOptions);
  };

  const updateLocalOptions = (key: keyof AdvancedSearchOptions, value: any) => {
    setLocalOptions(prev => ({ ...prev, [key]: value }));
  };

  const addDomain = (domain: string) => {
    if (domain.trim() && !localOptions.domains?.includes(domain.trim())) {
      updateLocalOptions('domains', [...(localOptions.domains || []), domain.trim()]);
    }
  };

  const removeDomain = (domain: string) => {
    updateLocalOptions('domains', localOptions.domains?.filter(d => d !== domain) || []);
  };

  const addExcludeTerm = (term: string) => {
    if (term.trim() && !localOptions.excludeTerms?.includes(term.trim())) {
      updateLocalOptions('excludeTerms', [...(localOptions.excludeTerms || []), term.trim()]);
    }
  };

  const removeExcludeTerm = (term: string) => {
    updateLocalOptions('excludeTerms', localOptions.excludeTerms?.filter(t => t !== term) || []);
  };

  const toggleSourceType = (type: string) => {
    const current = localOptions.sourceTypes || [];
    const updated = current.includes(type as any)
      ? current.filter(t => t !== type)
      : [...current, type as any];
    updateLocalOptions('sourceTypes', updated);
  };

  const toggleCategory = (category: string) => {
    const current = localOptions.categories || [];
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    updateLocalOptions('categories', updated);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Settings className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Advanced Search Options</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close advanced search options"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Date Range */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="date-start" className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  id="date-start"
                  type="date"
                  value={localOptions.dateRange?.start || ''}
                  onChange={(e) => updateLocalOptions('dateRange', {
                    ...localOptions.dateRange,
                    start: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Start date for search results"
                />
              </div>
              <div>
                <label htmlFor="date-end" className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  id="date-end"
                  type="date"
                  value={localOptions.dateRange?.end || ''}
                  onChange={(e) => updateLocalOptions('dateRange', {
                    ...localOptions.dateRange,
                    end: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="End date for search results"
                />
              </div>
            </div>
          </div>

          {/* Language & Region */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Globe className="h-4 w-4 mr-2" />
              Language & Region
            </label>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={localOptions.language || 'en'}
                onChange={(e) => updateLocalOptions('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Select language for search results"
                aria-label="Language selection"
              >
                {languageOptions.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
              <select
                value={localOptions.region || 'global'}
                onChange={(e) => updateLocalOptions('region', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Select region for search results"
                aria-label="Region selection"
              >
                {regionOptions.map(region => (
                  <option key={region.value} value={region.value}>{region.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Source Types */}
          <div className="space-y-3 lg:col-span-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Filter className="h-4 w-4 mr-2" />
              Source Types
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {sourceTypeOptions.map(type => (
                <button
                  key={type.value}
                  onClick={() => toggleSourceType(type.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    localOptions.sourceTypes?.includes(type.value as any)
                      ? `border-${type.color}-200 bg-${type.color}-50 text-${type.color}-700`
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{type.icon}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3 lg:col-span-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Tag className="h-4 w-4 mr-2" />
              Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map(category => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    localOptions.categories?.includes(category)
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Domains */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Specific Domains</label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="e.g., arxiv.org, nature.com"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addDomain((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {localOptions.domains && localOptions.domains.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {localOptions.domains.map(domain => (
                    <span
                      key={domain}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700"
                    >
                      {domain}
                      <button
                        onClick={() => removeDomain(domain)}
                        className="ml-1 text-blue-500 hover:text-blue-700"
                        aria-label={`Remove domain ${domain}`}
                        title={`Remove ${domain}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Exclude Terms */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Exclude Terms</label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Terms to exclude from results"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addExcludeTerm((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {localOptions.excludeTerms && localOptions.excludeTerms.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {localOptions.excludeTerms.map(term => (
                    <span
                      key={term}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-700"
                    >
                      -{term}
                      <button
                        onClick={() => removeExcludeTerm(term)}
                        className="ml-1 text-red-500 hover:text-red-700"
                        aria-label={`Remove exclude term ${term}`}
                        title={`Remove ${term}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sort & Results */}
          <div className="space-y-3 lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  id="sort-by"
                  value={localOptions.sortBy || 'relevance'}
                  onChange={(e) => updateLocalOptions('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Select sorting criteria"
                  aria-label="Sort by"
                >
                  <option value="relevance">Relevance</option>
                  <option value="date">Date (Newest First)</option>
                  <option value="credibility">Credibility Score</option>
                </select>
              </div>
              <div>
                <label htmlFor="max-results" className="block text-sm font-medium text-gray-700 mb-2">Max Results</label>
                <select
                  id="max-results"
                  value={localOptions.maxResults || 15}
                  onChange={(e) => updateLocalOptions('maxResults', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Select maximum number of results"
                  aria-label="Maximum results"
                >
                  <option value={10}>10 Results</option>
                  <option value={15}>15 Results</option>
                  <option value={25}>25 Results</option>
                  <option value={50}>50 Results</option>
                  <option value={100}>100 Results</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Reset All
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchOptionsComponent;
