'use client';

import React from 'react';
import { ExternalLink, Calendar, Globe } from 'lucide-react';
import { extractDomain, truncateText } from '@/lib/utils';

interface SearchResult {
  title: string;
  url: string;
  text?: string;
  publishedDate?: string;
  author?: string;
  score?: number;
  searchQuery?: string;
}

interface ResultsDisplayProps {
  results: SearchResult[];
  originalQuery: string;
  generatedQueries?: string[];
  isLoading?: boolean;
  session?: any;
  onSaveSession?: (session: any) => void;
  onGenerateResearch?: () => void;
}

export default function ResultsDisplay({ 
  results, 
  originalQuery, 
  generatedQueries = [],
  isLoading = false 
}: ResultsDisplayProps) {
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg p-6 space-y-3">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-300 rounded"></div>
                <div className="h-3 bg-gray-300 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center py-12">
        <div className="text-gray-500">
          <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No results found</p>
          <p className="text-sm mt-2">Try refining your search query</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Search Strategy Info */}
      {generatedQueries.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Search Strategy</h3>
          <p className="text-sm text-blue-700 mb-2">
            Generated {generatedQueries.length} targeted searches for: &quot;{originalQuery}&quot;
          </p>
          <div className="flex flex-wrap gap-2">
            {generatedQueries.map((query, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
              >
                {query}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Found {results.length} sources
        </h2>
        
        {results.map((result, index) => (
          <div
            key={`${result.url}-${index}`}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="space-y-3">
              {/* Title and URL */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors duration-200"
                  >
                    {result.title}
                  </a>
                </h3>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {extractDomain(result.url)}
                  </a>
                  
                  {result.publishedDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(result.publishedDate).toLocaleDateString()}
                    </div>
                  )}
                  
                  {result.author && (
                    <span>by {result.author}</span>
                  )}
                </div>
              </div>

              {/* Content Preview */}
              {result.text && (
                <p className="text-gray-700 leading-relaxed">
                  {truncateText(result.text, 300)}
                </p>
              )}

              {/* Metadata */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                {result.searchQuery && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Found via: {truncateText(result.searchQuery, 50)}
                  </span>
                )}
                
                {result.score && (
                  <span className="text-xs text-gray-500">
                    Relevance: {Math.round(result.score * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}