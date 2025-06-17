'use client';

import React, { useState } from 'react';
import SearchInput from '@/components/research/SearchInput';
import ResultsDisplay from '@/components/research/ResultsDisplay';
import LoadingStates from '@/components/research/LoadingStates';
import ResearchReport from '@/components/research/ResearchReport';
import DiscoveryDisplay from '@/components/research/DiscoveryDisplay';

// Day 3: Enhanced interfaces for discovery functionality
interface SourceQuality {
  credibilityScore: number;
  domainAuthority: 'high' | 'medium' | 'low';
  contentFreshness: 'fresh' | 'recent' | 'dated';
  sourceType: 'academic' | 'news' | 'government' | 'commercial' | 'blog' | 'social' | 'unknown';
  factualityIndicators: string[];
  biasIndicators: string[];
}

interface DiscoveryResponse {
  success: boolean;
  data?: {
    originalQuery: string;
    parallelExecution: {
      results: Array<{
        query: string;
        results: Array<{
          url: string;
          title: string;
          text: string;
        }>;
        strategy: string;
        executionTime: number;
        success: boolean;
      }>;
      aggregatedResults: Array<{
        url: string;
        title: string;
        text: string;
      }>;
      totalSources: number;
      executionTime: number;
    };
    sourceAnalysis: Array<{
      url: string;
      quality: SourceQuality;
      structuredData: {
        keyFacts: Array<{
          claim: string;
          confidence: number;
          category: string;
        }>;
        mainTopics: string[];
        namedEntities: { [category: string]: string[] };
        summary: string;
        citations: string[];
      };
      aiAnalysis?: {
        keyFacts: Array<{
          claim: string;
          confidence: number;
          category: string;
        }>;
        summary: string;
        credibilityAssessment: string;
        mainTopics: string[];
        sentimentAnalysis: 'positive' | 'neutral' | 'negative';
      };
    }>;
    contentSynthesis: {
      processedSources: number;
      aggregatedFacts: Array<{
        fact: string;
        sources: string[];
        confidence: number;
        category: string;
      }>;
      topicClusters: string[];
      diversityScore: number;
      overallSummary: string;
    };
    qualityMetrics: {
      averageCredibilityScore: number;
      diversityScore: number;
      sourcesProcessed: number;
      highQualitySources: number;
      domainVariety: number;
      contentTypeVariety: number;
    };
  };
  error?: string;
}

interface SearchResponse {
  success: boolean;
  data?: {
    originalQuery: string;
    analysis: {
      complexity: 'simple' | 'moderate' | 'complex';
      domains: string[];
      timeframe?: string;
      entityTypes: string[];
      searchAngles: string[];
    };
    searchStrategy: {
      primary: string[];
      secondary: string[];
      exploratory: string[];
      validation: string[];
    };
    prioritizedQueries: string[];
    results: Array<{
      title: string;
      url: string;
      text?: string;
      publishedDate?: string;
      author?: string;
      score?: number;
      searchQuery?: string;
      strategy?: string;
      relevanceScore?: number;
    }>;
    enrichedContent: unknown[];
    similarContent: unknown[];
    totalResults: number;
    searchStrategies: string[];
    gaps: string[];
    refinedQueries: string[];
    metadata: {
      complexity: string;
      domains: string[];
      timestamp: string;
    };
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
  const [discoveryResponse, setDiscoveryResponse] = useState<DiscoveryResponse | null>(null);
  const [loadingStage, setLoadingStage] = useState<'analyzing' | 'searching' | 'processing' | 'synthesizing'>('analyzing');
  const [discoveryMode, setDiscoveryMode] = useState<'standard' | 'discovery'>('standard');

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setSearchResponse(null);
    setResearchResponse(null);
    setDiscoveryResponse(null);
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
        body: JSON.stringify({ 
          query, 
          mode: 'comprehensive',
          options: {
            numResults: 15
          }
        }),
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

  const handleGenerateDiscoveryResearch = async () => {
    if (!discoveryResponse?.success || !discoveryResponse.data) return;

    setIsLoading(true);
    setLoadingStage('synthesizing');

    try {
      // Convert discovery data to results format for research generation
      const discoveryData = discoveryResponse.data;
      const convertedResults = discoveryData.parallelExecution.aggregatedResults.map((result, idx) => ({
        title: result.title,
        url: result.url,
        text: result.text,
        score: discoveryData.sourceAnalysis[idx]?.quality.credibilityScore || 0.5,
        strategy: 'discovery'
      }));

      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate',
          query: discoveryData.originalQuery,
          results: convertedResults
        }),
      });

      const data: ResearchResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Research generation failed');
      }

      setResearchResponse(data);
      setViewMode('research');
    } catch (error) {
      console.error('Discovery research generation error:', error);
      setResearchResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Research generation failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUpQuestion = (question: string) => {
    if (discoveryMode === 'discovery') {
      handleDiscoverySearch(question);
    } else {
      handleSearch(question);
    }
    setViewMode('search');
    setResearchResponse(null);
  };

  const handleRefineSearch = (refinedQuery: string) => {
    if (discoveryMode === 'discovery') {
      handleDiscoverySearch(refinedQuery);
    } else {
      handleSearch(refinedQuery);
    }
  };

  // Day 3: Enhanced discovery search
  const handleDiscoverySearch = async (query: string) => {
    setIsLoading(true);
    setDiscoveryResponse(null);
    setSearchResponse(null);
    setResearchResponse(null);
    setLoadingStage('analyzing');

    try {
      setTimeout(() => setLoadingStage('searching'), 500);
      setTimeout(() => setLoadingStage('processing'), 2000);
      setTimeout(() => setLoadingStage('synthesizing'), 4000);

      const response = await fetch('/api/discovery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          maxSources: 15,
          analysisDepth: 'comprehensive'
        }),
      });

      const data: DiscoveryResponse = await response.json();
      
      if (data.success) {
        setDiscoveryResponse(data);
        console.log('✅ Discovery completed:', data.data?.qualityMetrics);
      } else {
        console.error('Discovery failed:', data.error);
        setDiscoveryResponse(data);
      }
    } catch (error) {
      console.error('Discovery error:', error);
      setDiscoveryResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Discovery failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get the appropriate query source for research generation
  const getQueryForResearch = () => {
    if (discoveryMode === 'discovery' && discoveryResponse?.data) {
      return discoveryResponse.data.originalQuery;
    }
    return searchResponse?.data?.originalQuery || '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                HEXA Research Copilot v3.0
              </h1>
              <p className="mt-2 text-gray-600">
                AI-powered research with multi-source discovery and advanced content analysis
              </p>
            </div>
            
            {/* Discovery Mode Toggle */}
            <div className="flex justify-center mt-4">
              <div className="bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setDiscoveryMode('standard')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    discoveryMode === 'standard'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Standard Search
                </button>
                <button
                  onClick={() => setDiscoveryMode('discovery')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    discoveryMode === 'discovery'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Multi-Source Discovery
                </button>
              </div>
            </div>
            
            {/* View Mode Toggle */}
            {(searchResponse?.success || researchResponse || discoveryResponse?.success) && (
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
                    {discoveryMode === 'discovery' ? 'Discovery Results' : 'Search Results'}
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
            onSearch={discoveryMode === 'discovery' ? handleDiscoverySearch : handleSearch}
            isLoading={isLoading}
            mode={discoveryMode}
          />

          {/* Loading States */}
          {isLoading && (
            <LoadingStates stage={loadingStage} />
          )}

          {/* Content based on mode and view */}
          {!isLoading && (
            <>
              {/* Discovery Mode Results */}
              {discoveryMode === 'discovery' && viewMode === 'search' && discoveryResponse && (
                <>
                  {discoveryResponse.success && discoveryResponse.data ? (
                    <DiscoveryDisplay 
                      data={discoveryResponse.data} 
                      onGenerateResearch={handleGenerateDiscoveryResearch}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-red-600">
                        <p className="text-lg font-medium">Discovery Error</p>
                        <p className="text-sm mt-2">{discoveryResponse.error}</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Standard Search Results */}
              {discoveryMode === 'standard' && viewMode === 'search' && searchResponse && (
                <>
                  {searchResponse.success && searchResponse.data ? (
                    <>
                      {/* Search Strategy Overview */}
                      {searchResponse.data.analysis && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Search Strategy Analysis
                          </h3>
                          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <span className="text-sm font-medium text-gray-500">Complexity</span>
                              <p className="text-lg capitalize">{searchResponse.data.analysis.complexity}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500">Search Angles</span>
                              <p className="text-lg">{searchResponse.data.analysis.searchAngles.length}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500">Domains</span>
                              <p className="text-lg">{searchResponse.data.analysis.domains.length}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500">Strategies Used</span>
                              <p className="text-lg">{searchResponse.data.searchStrategies.length}</p>
                            </div>
                          </div>
                          
                          {/* Gaps and Refinements */}
                          {searchResponse.data.gaps.length > 0 && (
                            <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                              <h4 className="font-medium text-amber-800 mb-2">Information Gaps Identified</h4>
                              <ul className="text-sm text-amber-700 space-y-1">
                                {searchResponse.data.gaps.map((gap, idx) => (
                                  <li key={idx}>• {gap}</li>
                                ))}
                              </ul>
                              {searchResponse.data.refinedQueries.length > 0 && (
                                <div className="mt-3">
                                  <h5 className="font-medium text-amber-800 mb-2">Suggested Refinements</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {searchResponse.data.refinedQueries.slice(0, 3).map((query, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => handleRefineSearch(query)}
                                        className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs hover:bg-amber-200 transition-colors"
                                      >
                                        {query}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <ResultsDisplay
                        results={searchResponse.data.results}
                        originalQuery={searchResponse.data.originalQuery}
                        generatedQueries={searchResponse.data.prioritizedQueries || []}
                      />
                      
                      {/* Generate Research Button */}
                      <div className="text-center">
                        <button
                          onClick={handleGenerateResearch}
                          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Generate Comprehensive Research Report
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

              {/* Research Report (available for both modes) */}
              {viewMode === 'research' && researchResponse && (
                <>
                  {researchResponse.success && researchResponse.report ? (
                    <ResearchReport
                      report={researchResponse.report}
                      originalQuery={getQueryForResearch()}
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
          {!isLoading && !searchResponse && !researchResponse && !discoveryResponse && (
            <div className="text-center py-12">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Welcome to HEXA Research v3.0
                </h2>
                <p className="text-gray-600 mb-8">
                  Experience next-generation research with multi-source discovery, 
                  advanced content analysis, and comprehensive quality assessment. 
                  Choose between standard search or our new multi-source discovery mode 
                  for in-depth analysis across diverse, high-quality sources.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 text-left mb-8">
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      🧠 Smart Query Decomposition
                    </h3>
                    <p className="text-sm text-gray-600">
                      AI analyzes complexity and generates targeted search strategies with multiple angles
                    </p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      ⚡ Parallel Multi-Source Discovery
                    </h3>
                    <p className="text-sm text-gray-600">
                      Execute searches simultaneously across neural, keyword, and temporal strategies
                    </p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      📊 Advanced Content Analysis
                    </h3>
                    <p className="text-sm text-gray-600">
                      Source quality assessment, fact extraction, and comprehensive credibility scoring
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">
                    🚀 New: Multi-Source Discovery Mode
                  </h3>
                  <p className="text-sm text-purple-700">
                    Switch to Discovery mode above to experience our latest Day 3 features: 
                    parallel search execution, source quality assessment, structured information 
                    extraction, and comprehensive content synthesis.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
