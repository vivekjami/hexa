import React from 'react';
import { Card } from '@/components/ui/card';

interface SourceQuality {
  credibilityScore: number;
  domainAuthority: 'high' | 'medium' | 'low';
  contentFreshness: 'fresh' | 'recent' | 'dated';
  sourceType: 'academic' | 'news' | 'government' | 'commercial' | 'blog' | 'social' | 'unknown';
  factualityIndicators: string[];
  biasIndicators: string[];
}

interface DiscoveryData {
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
}

interface DiscoveryDisplayProps {
  data: DiscoveryData;
}

export default function DiscoveryDisplay({ data }: DiscoveryDisplayProps) {
  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getAuthorityBadge = (authority: string) => {
    const colors = {
      high: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-red-100 text-red-800'
    };
    return colors[authority as keyof typeof colors] || colors.low;
  };

  const getFreshnessBadge = (freshness: string) => {
    const colors = {
      fresh: 'bg-green-100 text-green-800',
      recent: 'bg-blue-100 text-blue-800',
      dated: 'bg-gray-100 text-gray-800'
    };
    return colors[freshness as keyof typeof colors] || colors.dated;
  };

  return (
    <div className="space-y-6">
      {/* Quality Metrics Overview */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">🎯 Discovery Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {data.qualityMetrics.sourcesProcessed}
            </div>
            <div className="text-sm text-gray-600">Sources Processed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {data.qualityMetrics.highQualitySources}
            </div>
            <div className="text-sm text-gray-600">High Quality</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(data.qualityMetrics.diversityScore * 100)}%
            </div>
            <div className="text-sm text-gray-600">Diversity Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(data.qualityMetrics.averageCredibilityScore * 100)}%
            </div>
            <div className="text-sm text-gray-600">Avg Credibility</div>
          </div>
        </div>
      </Card>

      {/* Parallel Execution Summary */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">⚡ Parallel Search Execution</h2>
        <div className="mb-4">
          <div className="text-sm text-gray-600">
            Executed {data.parallelExecution.results.length} parallel searches in {data.parallelExecution.executionTime}ms
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.parallelExecution.results.map((result, idx) => (
            <div key={idx} className="bg-gray-50 p-3 rounded-lg">
              <div className="font-medium text-sm">{result.strategy.toUpperCase()}</div>
              <div className="text-xs text-gray-600 truncate">{result.query}</div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {result.results.length} results
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {result.success ? 'Success' : 'Failed'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Content Synthesis */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">🧠 Content Synthesis</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Overall Summary</h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
              {data.contentSynthesis.overallSummary}
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Topic Clusters</h3>
            <div className="flex flex-wrap gap-2">
              {data.contentSynthesis.topicClusters.map((topic, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Key Aggregated Facts</h3>
            <div className="space-y-2">
              {data.contentSynthesis.aggregatedFacts.slice(0, 5).map((fact, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm">{fact.fact}</div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs text-gray-600">
                      Sources: {fact.sources.length}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${getQualityColor(fact.confidence)}`}>
                      {Math.round(fact.confidence * 100)}% confidence
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Source Quality Analysis */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">📊 Source Quality Analysis</h2>
        <div className="space-y-4">
          {data.sourceAnalysis.slice(0, 10).map((source, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {new URL(source.url).hostname}
                  </a>
                </div>
                <div className="flex gap-2 ml-4">
                  <span className={`text-xs px-2 py-1 rounded ${getQualityColor(source.quality.credibilityScore)}`}>
                    {Math.round(source.quality.credibilityScore * 100)}%
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${getAuthorityBadge(source.quality.domainAuthority)}`}>
                    {source.quality.domainAuthority}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${getFreshnessBadge(source.quality.contentFreshness)}`}>
                    {source.quality.contentFreshness}
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                {source.structuredData.summary}
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {source.quality.sourceType} • {source.structuredData.keyFacts.length} key facts
                </div>
                <div className="flex gap-1">
                  {source.quality.factualityIndicators.map((indicator, i) => (
                    <span key={i} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {indicator}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
