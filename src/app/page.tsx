'use client';

import React, { useState } from 'react';
import SearchInput from '@/components/research/SearchInput';
import ResultsDisplay from '@/components/research/ResultsDisplay';
import LoadingStates from '@/components/research/LoadingStates';
import ResearchReport from '@/components/research/ResearchReport';

interface SearchResponse {
  success: boolean;
  data?: {
    originalQuery: string;
    generatedQueries: string[];
    results: { id: string; title: string; description: string; url: string; text?: string }[];
    totalResults: number;
  };
  error?: string;
}

interface ResearchReport {
  executive_summary: string;
  key_findings: string[];
  detailed_analysis: string;
  sources_analysis: string;
  recommendations: string[];
  credibility_assessment: {
    high_credibility: Array<{
      title: string;
      url: string;
      text?: string;
      publishedDate?: string;
      author?: string;
      score?: number;
    }>;
    medium_credibility: Array<{
      title: string;
      url: string;
      text?: string;
      publishedDate?: string;
      author?: string;
      score?: number;
    }>;
    needs_verification: Array<{
      title: string;
      url: string;
      text?: string;
      publishedDate?: string;
      author?: string;
      score?: number;
    }>;
  };
  gaps_and_limitations: string[];
}

interface ResearchResponse {
  success: boolean;
  report?: ResearchReport;
  followUpQuestions?: string[];
  error?: string;
}

type ViewMode = 'search' | 'research';

export default function HomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('search');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [researchResponse, setResearchResponse] = useState<ResearchResponse | null>(null);
  const [loadingStage, setLoadingStage] = useState<'analyzing' | 'searching' | 'processing' | 'synthesizing'>('analyzing');

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setSearchResponse(null);
    setResearchResponse(null);
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

  const handleGenerateResearch = async () => {
    if (!searchResponse?.success || !searchResponse.data) return;

    setIsLoading(true);
    setLoadingStage('synthesizing');

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate',
          query: searchResponse.data.originalQuery,
          results: searchResponse.data.results
        }),
      });

      const data: ResearchResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Research generation failed');
      }

      setResearchResponse(data);
      setViewMode('research');
    } catch (error) {
      console.error('Research generation error:', error);
      setResearchResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Research generation failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUpQuestion = (question: string) => {
    handleSearch(question);
    setViewMode('search');
    setResearchResponse(null);
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
            
            {/* Mode Toggle */}
            {(searchResponse?.success || researchResponse) && (
              <div className="flex justify-center mt-4">
                <div className="bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('search')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'search'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Search Results
                  </button>
                  <button
                    onClick={() => setViewMode('research')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'research'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    disabled={!researchResponse?.success}
                  >
                    Research Report
                  </button>
                </div>
              </div>
            )}
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

          {/* Content based on mode */}
          {!isLoading && (
            <>
              {viewMode === 'search' && searchResponse && (
                <>
                  {searchResponse.success && searchResponse.data ? (
                    <>
                      <ResultsDisplay
                        results={searchResponse.data.results}
                        originalQuery={searchResponse.data.originalQuery}
                        generatedQueries={searchResponse.data.generatedQueries}
                      />
                      
                      {/* Generate Research Button */}
                      <div className="text-center">
                        <button
                          onClick={handleGenerateResearch}
                          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Generate Research Report
                        </button>
                      </div>
                    </>
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

              {viewMode === 'research' && researchResponse && (
                <>
                  {researchResponse.success && researchResponse.report ? (
                    <ResearchReport
                      report={researchResponse.report}
                      originalQuery={searchResponse?.data?.originalQuery || ''}
                      followUpQuestions={researchResponse.followUpQuestions}
                      onFollowUpQuestion={handleFollowUpQuestion}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-red-600">
                        <p className="text-lg font-medium">Research Generation Error</p>
                        <p className="text-sm mt-2">{researchResponse.error}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Welcome State */}
          {!isLoading && !searchResponse && !researchResponse && (
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
                      Comprehensive Research Reports
                    </h3>
                    <p className="text-sm text-gray-600">
                      Generate detailed analysis with credibility assessment and recommendations
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