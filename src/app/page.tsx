'use client';

import React, { useState, useEffect } from 'react';
import SearchInput from '@/components/research/SearchInput';
import ResultsDisplay from '@/components/research/ResultsDisplay';
import LoadingStates from '@/components/research/LoadingStates';
import ResearchReport from '@/components/research/ResearchReport';
import DiscoveryDisplay from '@/components/research/DiscoveryDisplay';
import FactVerificationDisplay from '@/components/research/FactVerificationDisplay';
import CitationManager from '@/components/research/CitationManager';
import KnowledgeVisualization from '@/components/research/KnowledgeVisualization';
import EnhancedReportComponent from '@/components/research/EnhancedReportComponent';
import AdvancedSearchOptions from '@/components/research/AdvancedSearchOptions';
import SearchHistory from '@/components/research/SearchHistory';
import ResearchTemplates from '@/components/research/ResearchTemplates';
import RealTimeProgress from '@/components/research/RealTimeProgress';
import { 
  Search, 
  FileText, 
  Network,
  CheckSquare,
  BookOpen,
  FileCheck,
  Settings,
  History,
  Layers,
  Clock,
  Filter
} from 'lucide-react';

// Day 6: New interfaces for advanced features
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

interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  mode: 'standard' | 'discovery';
  options?: AdvancedSearchOptions;
  resultCount?: number;
  starred?: boolean;
}

interface ResearchTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  searchQueries: string[];
  advancedOptions: AdvancedSearchOptions;
  reportSections: string[];
  tags: string[];
}

interface ResearchSession {
  id: string;
  name: string;
  createdAt: string;
  lastModified: string;
  query: string;
  searchResponse?: SearchResponse;
  discoveryResponse?: DiscoveryResponse;
  researchResponse?: ResearchResponse;
  verificationData?: VerificationResponse;
  citationData?: CitationResponse;
  knowledgeGraphData?: KnowledgeGraphResponse;
  enhancedReportData?: EnhancedReportResponse;
  notes?: string;
  tags?: string[];
  starred?: boolean;
}

interface RealTimeUpdate {
  type: 'progress' | 'status' | 'result' | 'error';
  stage: string;
  message: string;
  progress?: number;
  data?: any;
  timestamp: string;
}

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

// Day 4: Interfaces for new features
interface VerificationResponse {
  success: boolean;
  data?: {
    totalClaims: number;
    verifiedClaims: Array<{
      claim: string;
      sources: Array<{
        url: string;
        title: string;
        agreement: 'agree' | 'disagree' | 'partial' | 'neutral';
        confidence: number;
        evidence: string;
      }>;
      reliabilityScore: number;
      consensus: 'strong_agreement' | 'weak_agreement' | 'conflicted' | 'insufficient_data';
      contradictions: string[];
    }>;
    contradictions: Array<{
      claim: string;
      sources: Array<{
        url: string;
        position: string;
        confidence: number;
      }>;
    }>;
    overallReliability: number;
    needsVerification: string[];
  };
  error?: string;
}

interface CitationResponse {
  success: boolean;
  data?: {
    citations: Array<{
      id: string;
      url: string;
      title: string;
      author?: string;
      publishedDate?: string;
      accessedDate: string;
      sourceType: 'academic' | 'news' | 'government' | 'commercial' | 'blog' | 'social' | 'unknown';
      facts: Array<{
        claim: string;
        pageNumber?: number;
        quote?: string;
      }>;
      credibilityScore: number;
      format: {
        apa: string;
        mla: string;
        chicago: string;
        harvard: string;
      };
    }>;
    totalSources: number;
    highCredibilitySources: number;
    factsCited: number;
    duplicatesRemoved: number;
  };
  error?: string;
}

interface KnowledgeGraphResponse {
  success: boolean;
  data?: {
    nodes: Array<{
      id: string;
      type: 'source' | 'concept' | 'entity' | 'fact';
      label: string;
      data: {
        url?: string;
        confidence?: number;
        category?: string;
        description?: string;
        credibilityScore?: number;
      };
      size: number;
      color: string;
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      type: 'cites' | 'relates_to' | 'contradicts' | 'supports' | 'contains';
      weight: number;
      label?: string;
    }>;
    metadata: {
      totalNodes: number;
      totalEdges: number;
      sourceNodes: number;
      conceptNodes: number;
      entityNodes: number;
      factNodes: number;
      totalRelationships: number;
      averageConnectivity: number;
      clusters: Array<{
        id: string;
        label: string;
        nodes: string[];
        centroid: { x: number; y: number };
      }>;
    };
  };
  error?: string;
}

// Day 5: Enhanced report generation interface
interface EnhancedReportResponse {
  success: boolean;
  data?: {
    report: {
      title: string;
      executiveSummary: string;
      sections: Array<{
        id: string;
        title: string;
        content: string;
        citations: string[];
        confidence: number;
        subsections?: any[];
      }>;
      metadata: {
        generatedAt: string;
        query: string;
        sourceCount: number;
        confidenceScore: number;
        wordCount: number;
        estimatedReadingTime: number;
      };
    };
    synthesis: {
      keyThemes: Array<{
        theme: string;
        evidence: Array<{
          sourceId: string;
          claim: string;
          confidence: number;
        }>;
        consensus: 'strong' | 'moderate' | 'weak' | 'conflicting';
      }>;
      timeline?: Array<{
        date: string;
        event: string;
        sources: string[];
      }>;
      statistics: Array<{
        metric: string;
        value: string;
        source: string;
        confidence: number;
      }>;
      controversies: Array<{
        topic: string;
        conflictingSources: Array<{
          sourceId: string;
          position: string;
        }>;
      }>;
    };
    bibliography: {
      style: string;
      entries: Array<{
        id: string;
        formatted: string;
      }>;
    };
    export?: {
      content: string;
      fileName: string;
      mimeType: string;
    };
  };
  error?: string;
}

type ViewMode = 'search' | 'research' | 'verification' | 'citations' | 'knowledge_graph' | 'enhanced_report' | 'history' | 'templates' | 'settings';

export default function HomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('search');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [researchResponse, setResearchResponse] = useState<ResearchResponse | null>(null);
  const [discoveryResponse, setDiscoveryResponse] = useState<DiscoveryResponse | null>(null);
  const [loadingStage, setLoadingStage] = useState<'analyzing' | 'searching' | 'processing' | 'synthesizing'>('analyzing');
  const [discoveryMode, setDiscoveryMode] = useState<'standard' | 'discovery'>('standard');
  
  // Day 4: New state for fact verification, citations, and knowledge graph
  const [verificationData, setVerificationData] = useState<VerificationResponse | null>(null);
  const [citationData, setCitationData] = useState<CitationResponse | null>(null);
  const [knowledgeGraphData, setKnowledgeGraphData] = useState<KnowledgeGraphResponse | null>(null);
  const [isProcessingDay4, setIsProcessingDay4] = useState(false);

  // Day 5: Enhanced report generation state
  const [enhancedReportData, setEnhancedReportData] = useState<EnhancedReportResponse | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Day 6: New state for advanced features
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [advancedSearchOptions, setAdvancedSearchOptions] = useState<AdvancedSearchOptions>({});
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [researchSessions, setResearchSessions] = useState<ResearchSession[]>([]);
  const [realTimeUpdates, setRealTimeUpdates] = useState<RealTimeUpdate[]>([]);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [researchTemplates, setResearchTemplates] = useState<ResearchTemplate[]>([]);
  const [showRealTimePanel, setShowRealTimePanel] = useState(false);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket(process.env.NODE_ENV === 'production' 
        ? 'wss://your-domain.com/api/ws' 
        : 'ws://localhost:3000/api/ws'
      );
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setWsConnection(ws);
      };
      
      ws.onmessage = (event) => {
        const update: RealTimeUpdate = JSON.parse(event.data);
        setRealTimeUpdates(prev => [...prev.slice(-49), update]); // Keep last 50 updates
        
        // Update loading stage based on real-time updates
        if (update.type === 'progress') {
          setLoadingStage(update.stage as any);
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setWsConnection(null);
        // Reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };

    connectWebSocket();
    
    return () => {
      setWsConnection(prev => {
        if (prev) {
          prev.close();
        }
        return null;
      });
    };
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('hexa-search-history');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
    
    const savedSessions = localStorage.getItem('hexa-research-sessions');
    if (savedSessions) {
      setResearchSessions(JSON.parse(savedSessions));
    }
    
    const savedTemplates = localStorage.getItem('hexa-research-templates');
    if (savedTemplates) {
      setResearchTemplates(JSON.parse(savedTemplates));
    } else {
      // Load default templates
      setResearchTemplates(getDefaultTemplates());
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('hexa-search-history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    localStorage.setItem('hexa-research-sessions', JSON.stringify(researchSessions));
  }, [researchSessions]);

  useEffect(() => {
    localStorage.setItem('hexa-research-templates', JSON.stringify(researchTemplates));
  }, [researchTemplates]);

  const getDefaultTemplates = (): ResearchTemplate[] => [
    {
      id: 'academic-research',
      name: 'Academic Research',
      description: 'Comprehensive academic research with peer-reviewed sources',
      category: 'Academic',
      searchQueries: [],
      advancedOptions: {
        sourceTypes: ['academic', 'government'],
        sortBy: 'credibility',
        maxResults: 20
      },
      reportSections: ['Abstract', 'Introduction', 'Literature Review', 'Methodology', 'Findings', 'Conclusion'],
      tags: ['academic', 'research', 'peer-reviewed']
    },
    {
      id: 'market-analysis',
      name: 'Market Analysis',
      description: 'Business and market research template',
      category: 'Business',
      searchQueries: [],
      advancedOptions: {
        sourceTypes: ['commercial', 'news', 'government'],
        dateRange: { start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        sortBy: 'date',
        maxResults: 25
      },
      reportSections: ['Executive Summary', 'Market Overview', 'Competitive Analysis', 'Trends', 'Recommendations'],
      tags: ['business', 'market', 'analysis']
    },
    {
      id: 'news-investigation',
      name: 'News Investigation',
      description: 'Journalistic research with fact-checking focus',
      category: 'Journalism',
      searchQueries: [],
      advancedOptions: {
        sourceTypes: ['news', 'government', 'academic'],
        dateRange: { start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        sortBy: 'date',
        maxResults: 30
      },
      reportSections: ['Summary', 'Background', 'Key Facts', 'Sources', 'Verification', 'Timeline'],
      tags: ['journalism', 'investigation', 'fact-check']
    }
  ];

  // Enhanced search function with advanced options
  const handleAdvancedSearch = async (query: string, options: AdvancedSearchOptions = {}) => {
    setIsLoading(true);
    setSearchResponse(null);
    setResearchResponse(null);
    setDiscoveryResponse(null);
    setLoadingStage('analyzing');
    setShowRealTimePanel(true);

    // Add to search history
    const historyItem: SearchHistoryItem = {
      id: Date.now().toString(),
      query,
      timestamp: new Date().toISOString(),
      mode: discoveryMode,
      options,
      starred: false
    };

    try {
      // Send WebSocket message to start real-time updates
      if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
        wsConnection.send(JSON.stringify({
          action: 'start_search',
          query,
          options,
          mode: discoveryMode
        }));
      }

      const endpoint = discoveryMode === 'discovery' ? '/api/discovery' : '/api/search';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          mode: 'comprehensive',
          options: {
            numResults: options.maxResults || 15,
            dateRange: options.dateRange,
            domains: options.domains,
            sourceTypes: options.sourceTypes,
            language: options.language,
            region: options.region,
            excludeTerms: options.excludeTerms,
            sortBy: options.sortBy
          }
        }),
      });

      const data = await response.json();
      
      if (discoveryMode === 'discovery') {
        setDiscoveryResponse(data);
      } else {
        setSearchResponse(data);
      }

      // Update history with result count
      historyItem.resultCount = data.data?.results?.length || data.data?.parallelExecution?.totalSources || 0;
      setSearchHistory(prev => [historyItem, ...prev.slice(0, 49)]); // Keep last 50 searches

      // Create or update research session
      createOrUpdateSession(query, data);

    } catch (error) {
      console.error('Search error:', error);
      const errorResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed'
      };
      
      if (discoveryMode === 'discovery') {
        setDiscoveryResponse(errorResponse);
      } else {
        setSearchResponse(errorResponse);
      }
    } finally {
      setIsLoading(false);
      
      // Send WebSocket message to end search
      if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
        wsConnection.send(JSON.stringify({
          action: 'end_search',
          query
        }));
      }
    }
  };

  const createOrUpdateSession = (query: string, searchData: any) => {
    const sessionId = Date.now().toString();
    const session: ResearchSession = {
      id: sessionId,
      name: query.slice(0, 50) + (query.length > 50 ? '...' : ''),
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      query,
      searchResponse: discoveryMode === 'standard' ? searchData : undefined,
      discoveryResponse: discoveryMode === 'discovery' ? searchData : undefined,
      tags: [],
      starred: false
    };

    setResearchSessions(prev => [session, ...prev.slice(0, 19)]); // Keep last 20 sessions
  };

  // Updated handleSearch to use advanced search
  const handleSearch = async (query: string) => {
    return handleAdvancedSearch(query, advancedSearchOptions);
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

  // Day 4: Fact Cross-Verification
  const handleFactVerification = async () => {
    if (!discoveryResponse?.data) return;

    setIsProcessingDay4(true);
    try {
      const response = await fetch('/api/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sources: discoveryResponse.data.sourceAnalysis.map(source => ({
            url: source.url,
            title: source.structuredData.summary,
            text: source.structuredData.keyFacts.map(f => f.claim).join(' '),
          })),
          claims: discoveryResponse.data.contentSynthesis.aggregatedFacts.map(f => f.fact)
        }),
      });

      const data: VerificationResponse = await response.json();
      setVerificationData(data);
      setViewMode('verification');
    } catch (error) {
      console.error('Fact verification error:', error);
    } finally {
      setIsProcessingDay4(false);
    }
  };

  // Day 4: Citation Management
  const handleCitationGeneration = async () => {
    if (!discoveryResponse?.data) return;

    setIsProcessingDay4(true);
    try {
      const response = await fetch('/api/citations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sources: discoveryResponse.data.sourceAnalysis.map(source => ({
            url: source.url,
            title: source.structuredData.summary,
            author: null,
            publishedDate: null,
            sourceType: source.quality.sourceType,
            facts: source.structuredData.keyFacts,
            credibilityScore: source.quality.credibilityScore
          }))
        }),
      });

      const data: CitationResponse = await response.json();
      setCitationData(data);
      setViewMode('citations');
    } catch (error) {
      console.error('Citation generation error:', error);
    } finally {
      setIsProcessingDay4(false);
    }
  };

  // Day 4: Knowledge Graph Creation
  const handleKnowledgeGraphGeneration = async () => {
    if (!discoveryResponse?.data) return;

    setIsProcessingDay4(true);
    try {
      const response = await fetch('/api/knowledge-graph', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sources: discoveryResponse.data.sourceAnalysis,
          verificationData: verificationData?.data
        }),
      });

      const data: KnowledgeGraphResponse = await response.json();
      setKnowledgeGraphData(data);
      setViewMode('knowledge_graph');
    } catch (error) {
      console.error('Knowledge graph generation error:', error);
    } finally {
      setIsProcessingDay4(false);
    }
  };

  // Day 5: Enhanced Report Generation
  const handleEnhancedReportGeneration = async (options?: any) => {
    if (!discoveryResponse?.data) return;

    setIsGeneratingReport(true);
    try {
      const sources = discoveryResponse.data.sourceAnalysis.map(source => ({
        id: source.url,
        url: source.url,
        title: source.structuredData.summary,
        content: source.structuredData.keyFacts.map(fact => fact.claim).join('. '),
        author: null,
        publishedDate: null,
        credibilityScore: source.quality.credibilityScore,
        sourceType: source.quality.sourceType,
        keyFacts: source.structuredData.keyFacts.map(fact => ({
          claim: fact.claim,
          confidence: fact.confidence,
          category: fact.category
        }))
      }));

      const response = await fetch('/api/report-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: discoveryResponse.data.originalQuery,
          sources,
          options: {
            citationStyle: options?.citationStyle || 'apa',
            exportFormat: options?.exportFormat,
            template: options?.template || 'academic',
            includeMetadata: options?.includeMetadata ?? true,
            includeBibliography: options?.includeBibliography ?? true,
            includeTableOfContents: options?.includeTableOfContents ?? true
          }
        }),
      });

      const data: EnhancedReportResponse = await response.json();
      
      if (data.success) {
        setEnhancedReportData(data);
        setViewMode('enhanced_report');
      } else {
        console.error('Enhanced report generation failed:', data.error);
      }
    } catch (error) {
      console.error('Enhanced report generation error:', error);
    } finally {
      setIsGeneratingReport(false);
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
                HEXA Research Copilot v6.0
              </h1>
              <p className="mt-2 text-gray-600">
                Premium AI research with real-time updates, advanced search, and session management
              </p>
              <div className="mt-2 flex justify-center gap-2 text-sm flex-wrap">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">Day 6 Complete</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Real-Time Updates</span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">Advanced Search</span>
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">Session Management</span>
                <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full">Smart Templates</span>
                <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full">Premium UX</span>
              </div>
            </div>
            
            {/* Enhanced Controls */}
            <div className="flex justify-center mt-4 space-x-4">
              {/* Discovery Mode Toggle */}
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

              {/* Quick Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setAdvancedSearchOpen(!advancedSearchOpen)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    advancedSearchOpen
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="h-4 w-4 mr-2 inline" />
                  Advanced
                </button>
                <button
                  onClick={() => setViewMode('history')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    viewMode === 'history'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <History className="h-4 w-4 mr-2 inline" />
                  History ({searchHistory.length})
                </button>
                <button
                  onClick={() => setViewMode('templates')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    viewMode === 'templates'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Layers className="h-4 w-4 mr-2 inline" />
                  Templates
                </button>
                <button
                  onClick={() => setViewMode('settings')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    viewMode === 'settings'
                      ? 'bg-gray-50 text-gray-700 border-gray-300'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="h-4 w-4 mr-2 inline" />
                  Settings
                </button>
                {realTimeUpdates.length > 0 && (
                  <button
                    onClick={() => setShowRealTimePanel(!showRealTimePanel)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      showRealTimePanel
                        ? 'bg-orange-50 text-orange-700 border-orange-200'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Clock className="h-4 w-4 mr-2 inline" />
                    Live Updates
                  </button>
                )}
              </div>
            </div>
            
            {/* View Mode Toggle */}
            {(searchResponse?.success || researchResponse || discoveryResponse?.success) && (
              <div className="flex justify-center mt-4">
                <div className="bg-gray-100 p-1 rounded-lg flex flex-wrap gap-1">
                  <button
                    onClick={() => setViewMode('search')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'search'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Search className="h-4 w-4 mr-2 inline" />
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
                    <FileText className="h-4 w-4 mr-2 inline" />
                    Research Report
                  </button>
                  
                  {/* Day 4: Advanced Analysis Tabs */}
                  {discoveryResponse?.success && (
                    <>
                      <button
                        onClick={() => {
                          if (!verificationData) handleFactVerification();
                          setViewMode('verification');
                        }}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          viewMode === 'verification'
                            ? 'bg-white text-green-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        disabled={isProcessingDay4}
                      >
                        <CheckSquare className="h-4 w-4 mr-2 inline" />
                        {isProcessingDay4 && viewMode === 'verification' ? 'Processing...' : 'Fact Check'}
                      </button>
                      <button
                        onClick={() => {
                          if (!citationData) handleCitationGeneration();
                          setViewMode('citations');
                        }}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          viewMode === 'citations'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        disabled={isProcessingDay4}
                      >
                        <BookOpen className="h-4 w-4 mr-2 inline" />
                        {isProcessingDay4 && viewMode === 'citations' ? 'Processing...' : 'Citations'}
                      </button>
                      <button
                        onClick={() => {
                          if (!knowledgeGraphData) handleKnowledgeGraphGeneration();
                          setViewMode('knowledge_graph');
                        }}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          viewMode === 'knowledge_graph'
                            ? 'bg-white text-purple-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        disabled={isProcessingDay4}
                      >
                        <Network className="h-4 w-4 mr-2 inline" />
                        {isProcessingDay4 && viewMode === 'knowledge_graph' ? 'Processing...' : 'Knowledge Graph'}
                      </button>
                      <button
                        onClick={() => handleEnhancedReportGeneration()}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          viewMode === 'enhanced_report'
                            ? 'bg-white text-orange-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        disabled={isGeneratingReport}
                      >
                        <FileCheck className="h-4 w-4 mr-2 inline" />
                        {isGeneratingReport ? 'Generating...' : 'Enhanced Report'}
                      </button>
                    </>
                  )}
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

          {/* Day 6: Advanced Search Options Panel */}
          {advancedSearchOpen && (
            <div className="mb-6">
              <AdvancedSearchOptions
                options={advancedSearchOptions}
                onChange={setAdvancedSearchOptions}
                onClose={() => setAdvancedSearchOpen(false)}
              />
            </div>
          )}

          {/* Day 6: Real-time Progress Panel */}
          {showRealTimePanel && realTimeUpdates.length > 0 && (
            <div className="mb-6">
              <RealTimeProgress
                updates={realTimeUpdates}
                isConnected={!!wsConnection}
                onClose={() => setShowRealTimePanel(false)}
              />
            </div>
          )}

          {/* Loading States */}
          {isLoading && (
            <LoadingStates stage={loadingStage} />
          )}

          {/* Content based on mode and view */}
          {!isLoading && (
            <>
              {/* Day 6: History View */}
              {viewMode === 'history' && (
                <SearchHistory
                  history={searchHistory}
                  sessions={researchSessions}
                  onLoadFromHistory={(item: SearchHistoryItem) => {
                    if (item.mode === 'discovery') {
                      setDiscoveryMode('discovery');
                      handleDiscoverySearch(item.query);
                    } else {
                      setDiscoveryMode('standard');
                      handleSearch(item.query);
                    }
                    setViewMode('search');
                  }}
                  onStarItem={(id: string) => {
                    setSearchHistory(prev => prev.map(item => 
                      item.id === id ? { ...item, starred: !item.starred } : item
                    ));
                  }}
                  onDeleteItem={(id: string) => {
                    setSearchHistory(prev => prev.filter(item => item.id !== id));
                  }}
                  onLoadSession={(session: ResearchSession) => {
                    // Load session data
                    setSearchResponse(session.searchResponse || null);
                    setDiscoveryResponse(session.discoveryResponse || null);
                    setResearchResponse(session.researchResponse || null);
                    setVerificationData(session.verificationData || null);
                    setViewMode('search');
                  }}
                  onSaveSession={(session: ResearchSession) => {
                    setResearchSessions(prev => 
                      prev.map(s => s.id === session.id ? session : s)
                    );
                  }}
                />
              )}

              {/* Day 6: Templates View */}
              {viewMode === 'templates' && (
                <ResearchTemplates
                  templates={researchTemplates}
                  onApplyTemplate={(template: ResearchTemplate) => {
                    setAdvancedSearchOptions(template.advancedOptions);
                    // Apply template to current search if available
                    if (searchResponse?.data?.originalQuery || discoveryResponse?.data?.originalQuery) {
                      const query = searchResponse?.data?.originalQuery || discoveryResponse?.data?.originalQuery || '';
                      if (discoveryMode === 'discovery') {
                        handleDiscoverySearch(query);
                      } else {
                        handleSearch(query);
                      }
                    }
                    setViewMode('search');
                  }}
                  onSaveTemplate={(template: ResearchTemplate) => {
                    if (template.id) {
                      // Update existing template
                      setResearchTemplates(prev => prev.map(t => 
                        t.id === template.id ? template : t
                      ));
                    } else {
                      // Create new template
                      const newTemplate = {
                        ...template,
                        id: Date.now().toString()
                      };
                      setResearchTemplates(prev => [newTemplate, ...prev]);
                    }
                  }}
                  onDeleteTemplate={(id: string) => {
                    setResearchTemplates(prev => prev.filter(t => t.id !== id));
                  }}
                />
              )}

              {/* Day 6: Settings View */}
              {viewMode === 'settings' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">WebSocket Connection</h3>
                      <div className="flex items-center space-x-4">
                        <div className={`flex items-center space-x-2 ${wsConnection ? 'text-green-600' : 'text-red-600'}`}>
                          <div className={`w-3 h-3 rounded-full ${wsConnection ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-sm font-medium">
                            {wsConnection ? 'Connected' : 'Disconnected'}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            if (wsConnection) {
                              wsConnection.close();
                            } else {
                              // Reconnect logic would go here
                              window.location.reload();
                            }
                          }}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          {wsConnection ? 'Disconnect' : 'Reconnect'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Data Management</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Search History ({searchHistory.length} items)</span>
                          <button
                            onClick={() => {
                              setSearchHistory([]);
                              localStorage.removeItem('hexa-search-history');
                            }}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Research Sessions ({researchSessions.length} items)</span>
                          <button
                            onClick={() => {
                              setResearchSessions([]);
                              localStorage.removeItem('hexa-research-sessions');
                            }}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Custom Templates ({researchTemplates.filter(t => !['academic-research', 'market-analysis', 'news-investigation'].includes(t.id)).length} items)</span>
                          <button
                            onClick={() => {
                              setResearchTemplates(getDefaultTemplates());
                              localStorage.removeItem('hexa-research-templates');
                            }}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                          >
                            Reset to Defaults
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Real-time Updates</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Update History ({realTimeUpdates.length} items)</span>
                          <button
                            onClick={() => setRealTimeUpdates([])}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                          >
                            Clear History
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Discovery Mode Results */}
              {discoveryMode === 'discovery' && viewMode === 'search' && discoveryResponse && (
                <>
                  {discoveryResponse.success && discoveryResponse.data ? (
                    <DiscoveryDisplay 
                      data={discoveryResponse.data} 
                      onGenerateResearch={handleGenerateDiscoveryResearch}
                      onFactVerification={handleFactVerification}
                      onCitationGeneration={handleCitationGeneration}
                      onKnowledgeGraph={handleKnowledgeGraphGeneration}
                      onEnhancedReport={handleEnhancedReportGeneration}
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

              {/* Day 4: Fact Verification Display */}
              {viewMode === 'verification' && verificationData && (
                <>
                  {verificationData.success && verificationData.data ? (
                    <FactVerificationDisplay
                      data={verificationData.data}
                      onClaimClick={(claim) => console.log('Investigate claim:', claim)}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-red-600">
                        <p className="text-lg font-medium">Fact Verification Error</p>
                        <p className="text-sm mt-2">{verificationData.error}</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Day 4: Citation Manager */}
              {viewMode === 'citations' && citationData && (
                <>
                  {citationData.success && citationData.data ? (
                    <CitationManager
                      data={citationData.data}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-red-600">
                        <p className="text-lg font-medium">Citation Generation Error</p>
                        <p className="text-sm mt-2">{citationData.error}</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Day 4: Knowledge Graph Visualization */}
              {viewMode === 'knowledge_graph' && knowledgeGraphData && (
                <>
                  {knowledgeGraphData.success && knowledgeGraphData.data ? (
                    <KnowledgeVisualization
                      data={knowledgeGraphData.data as any}
                      width={1200}
                      height={800}
                      onNodeClick={(node: any) => console.log('Node clicked:', node)}
                      onEdgeClick={(edge: any) => console.log('Edge clicked:', edge)}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-red-600">
                        <p className="text-lg font-medium">Knowledge Graph Error</p>
                        <p className="text-sm mt-2">{knowledgeGraphData.error}</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Day 5: Enhanced Report Generation */}
              {viewMode === 'enhanced_report' && enhancedReportData && (
                <>
                  {enhancedReportData.success && enhancedReportData.data ? (
                    <EnhancedReportComponent
                      data={enhancedReportData.data}
                      originalQuery={discoveryResponse?.data?.originalQuery || ''}
                      onRegenerateReport={handleEnhancedReportGeneration}
                      isLoading={isGeneratingReport}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-red-600">
                        <p className="text-lg font-medium">Enhanced Report Generation Error</p>
                        <p className="text-sm mt-2">{enhancedReportData.error}</p>
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
              <div className="max-w-3xl mx-auto">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Welcome to HEXA Research v6.0
                </h2>
                <p className="text-gray-600 mb-8">
                  Experience next-generation premium research with real-time progress tracking, advanced search filters, 
                  session management, and smart templates. Our Day 6 implementation brings professional-grade research 
                  capabilities with WebSocket-powered live updates, comprehensive search history, and intelligent templates 
                  for different research domains.
                </p>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-left mb-8">
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
                      Simultaneous searches across diverse sources with quality assessment and content synthesis
                    </p>
                  </div>
                  
                  <div className="p-6 rounded-lg border border-green-200 bg-green-50">
                    <h3 className="font-semibold text-green-900 mb-2">
                      ✅ Fact Cross-Verification
                    </h3>
                    <p className="text-sm text-green-700">
                      Automatically verify claims across sources and detect contradictions
                    </p>
                  </div>
                  
                  <div className="p-6 rounded-lg border border-blue-200 bg-blue-50">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      📚 Citation Management
                    </h3>
                    <p className="text-sm text-blue-700">
                      Generate properly formatted citations in APA, MLA, Chicago, and Harvard styles
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-left mb-8">
                  <div className="p-6 rounded-lg border border-purple-200 bg-purple-50">
                    <h3 className="font-semibold text-purple-900 mb-2">
                      🕸️ Knowledge Graph Visualization
                    </h3>
                    <p className="text-sm text-purple-700">
                      Interactive D3.js-powered graphs showing connections between sources, concepts, and entities
                    </p>
                  </div>
                  
                  <div className="p-6 rounded-lg border border-orange-200 bg-orange-50">
                    <h3 className="font-semibold text-orange-900 mb-2">
                      📊 Enhanced Report Generation
                    </h3>
                    <p className="text-sm text-orange-700">
                      Publication-ready reports with content synthesis, multiple export formats, and proper citations
                    </p>
                  </div>

                  <div className="p-6 rounded-lg border border-teal-200 bg-teal-50">
                    <h3 className="font-semibold text-teal-900 mb-2">
                      📝 Content Synthesis Engine
                    </h3>
                    <p className="text-sm text-teal-700">
                      Intelligent combination of multiple sources with narrative generation and proper attribution
                    </p>
                  </div>
                </div>

                {/* Day 6 Features */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-left mb-8">
                  <div className="p-6 rounded-lg border border-indigo-200 bg-indigo-50">
                    <h3 className="font-semibold text-indigo-900 mb-2">
                      🔍 Advanced Search Options
                    </h3>
                    <p className="text-sm text-indigo-700">
                      Date range filters, domain-specific searches, source type selection, and language/region targeting
                    </p>
                  </div>

                  <div className="p-6 rounded-lg border border-pink-200 bg-pink-50">
                    <h3 className="font-semibold text-pink-900 mb-2">
                      📚 Search History & Sessions
                    </h3>
                    <p className="text-sm text-pink-700">
                      Comprehensive search history with session management, starring, and easy reload functionality
                    </p>
                  </div>

                  <div className="p-6 rounded-lg border border-cyan-200 bg-cyan-50">
                    <h3 className="font-semibold text-cyan-900 mb-2">
                      📋 Research Templates
                    </h3>
                    <p className="text-sm text-cyan-700">
                      Pre-built templates for Academic, Business, and Journalism research with customizable options
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 text-left mb-8">
                  <div className="p-6 rounded-lg border border-red-200 bg-red-50">
                    <h3 className="font-semibold text-red-900 mb-2">
                      🔄 Real-Time Progress Tracking
                    </h3>
                    <p className="text-sm text-red-700">
                      WebSocket-powered live updates showing search progress, status changes, and real-time results
                    </p>
                  </div>

                  <div className="p-6 rounded-lg border border-yellow-200 bg-yellow-50">
                    <h3 className="font-semibold text-yellow-900 mb-2">
                      ⚙️ Premium User Experience
                    </h3>
                    <p className="text-sm text-yellow-700">
                      Persistent data storage, advanced settings, data management, and professional-grade UI/UX
                    </p>
                  </div>
                </div>

                <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    🚀 Day 6 Complete: Premium Research Platform
                  </h3>
                  <p className="text-sm text-blue-700">
                    Use advanced search options, manage your research sessions, apply intelligent templates, and track 
                    real-time progress. Experience the complete premium research workflow with persistent data and 
                    professional-grade features.
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
