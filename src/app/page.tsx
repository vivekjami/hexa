'use client';

import React, { useState } from 'react';
import SearchInput from '@/components/research/SearchInput';
import ResultsDisplay from '@/components/research/ResultsDisplay';
import LoadingStates from '@/components/research/LoadingStates';

interface SearchResponse {
  success: boolean;
  data?: {
    originalQuery: string;
    generatedQueries: string[];
    results: { id: string; title: string; description: string; url: string }[];
    totalResults: number;
  };
  error?: string;
}

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [loadingStage, setLoadingStage] = useState<'analyzing' | 'searching' | 'processing' | 'synthesizing'>('analyzing');

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setSearchResponse(null);
    setLoadingStage('analyzing');

    try {
      // Simulate progression through stages
      setTimeout(() => setLoadingStage('searching'), 500);
      setTimeout(() => setLoadingStage('processing'), 2000);

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data: SearchResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setSearchResponse(data);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Search failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                HEXA Research Copilot
              </h1>
              <p className="mt-2 text-gray-600">
                AI-powered research assistant built on Exa.ai
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Search Input */}
          <SearchInput 
            onSearch={handleSearch}
            isLoading={isLoading}
          />

          {/* Loading States */}
          {isLoading && (
            <LoadingStates stage={loadingStage} />
          )}

          {/* Results */}
          {!isLoading && searchResponse && (
            <>
              {searchResponse.success && searchResponse.data ? (
                <ResultsDisplay
                  results={searchResponse.data.results}
                  originalQuery={searchResponse.data.originalQuery}
                  generatedQueries={searchResponse.data.generatedQueries}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="text-red-600">
                    <p className="text-lg font-medium">Search Error</p>
                    <p className="text-sm mt-2">{searchResponse.error}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Welcome State */}
          {!isLoading && !searchResponse && (
            <div className="text-center py-12">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Welcome to HEXA Research
                </h2>
                <p className="text-gray-600 mb-8">
                  Transform any research question into comprehensive, cited intelligence reports. 
                  HEXA uses advanced AI to discover, analyze, and synthesize information from 
                  across the web.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Smart Query Decomposition
                    </h3>
                    <p className="text-sm text-gray-600">
                      AI breaks complex topics into targeted search strategies
                    </p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Neural Search Discovery
                    </h3>
                    <p className="text-sm text-gray-600">
                      Find diverse, high-quality sources using Exa&apos;s neural search
                    </p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Cross-Source Verification
                    </h3>
                    <p className="text-sm text-gray-600">
                      Validate claims across multiple sources automatically
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}