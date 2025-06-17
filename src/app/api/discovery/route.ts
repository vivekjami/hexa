import { NextRequest, NextResponse } from 'next/server';
import { 
  executeParallelSearch,
  assessSourceQuality,
  extractStructuredInformation,
  type ParallelSearchResult,
  type SourceQuality,
  type StructuredContent
} from '@/lib/exa/client';
import { 
  generateAdvancedSearchStrategy, 
  analyzeContentForFacts,
  processBatchContent
} from '@/lib/gemini/client';

interface SearchResult {
  url: string;
  title?: string | null;
  description?: string | null;
  text?: string | null;
  publishedDate?: string | null;
  relevanceScore?: number;
  searchQuery?: string;
  strategy?: string;
}

interface DiscoveryResult {
  originalQuery: string;
  parallelExecution: {
    results: ParallelSearchResult[];
    aggregatedResults: SearchResult[];
    totalSources: number;
    executionTime: number;
  };
  sourceAnalysis: Array<{
    url: string;
    quality: SourceQuality;
    structuredData: StructuredContent;
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

// Day 3: Multi-Source Discovery & Analysis API
export async function POST(request: NextRequest) {
  try {
    const { query, maxSources = 15, analysisDepth = 'comprehensive' } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    console.log(`🔍 Starting multi-source discovery for: "${query}"`);

    // Step 1: Generate advanced search strategy
    const strategyGeneration = await generateAdvancedSearchStrategy(query);
    
    if (!strategyGeneration.success) {
      return NextResponse.json(
        { error: 'Failed to generate search strategy' },
        { status: 500 }
      );
    }

    const { prioritizedQueries } = strategyGeneration;
    console.log(`📋 Generated ${prioritizedQueries?.length || 0} prioritized queries`);

    // Step 2: Execute parallel search across multiple strategies
    const parallelSearch = await executeParallelSearch(
      prioritizedQueries?.slice(0, 8) || [query], 
      { numResults: Math.ceil(maxSources / 4) }
    );

    if (!parallelSearch.success) {
      return NextResponse.json(
        { error: 'Parallel search execution failed' },
        { status: 500 }
      );
    }

    const parallelResults = parallelSearch.data!;
    console.log(`⚡ Parallel search completed: ${parallelResults.totalSources} sources found`);

    // Step 3: Source quality assessment and content extraction
    const sourceAnalysis: DiscoveryResult['sourceAnalysis'] = [];
    const topSources = parallelResults.aggregatedResults.slice(0, maxSources);

    for (const source of topSources) {
      if (!source.text) continue;

      // Assess source quality
      const quality = assessSourceQuality(source.url, source.text, source.publishedDate);
      
      // Extract structured information
      const structuredData = extractStructuredInformation(source.text, source.url);
      
      // AI-powered content analysis (for high-quality sources)
      let aiAnalysis: DiscoveryResult['sourceAnalysis'][0]['aiAnalysis'] = undefined;
      if (analysisDepth === 'comprehensive' && quality.credibilityScore > 0.6) {
        const analysis = await analyzeContentForFacts(source.text, source.url);
        if (analysis.success && analysis.data) {
          aiAnalysis = analysis.data;
        }
      }

      sourceAnalysis.push({
        url: source.url,
        quality,
        structuredData,
        aiAnalysis
      });
    }

    console.log(`📊 Analyzed ${sourceAnalysis.length} sources for quality and structure`);

    // Step 4: Batch content synthesis
    const contentBatch = topSources
      .filter(s => s.text && s.text.length > 200)
      .slice(0, 10)
      .map(s => ({
        url: s.url,
        text: s.text!,
        title: s.title || ''
      }));

    let contentSynthesis: DiscoveryResult['contentSynthesis'];
    
    if (contentBatch.length > 0) {
      const batchAnalysis = await processBatchContent(contentBatch);
      if (batchAnalysis.success) {
        contentSynthesis = batchAnalysis.data!;
      } else {
        contentSynthesis = {
          processedSources: contentBatch.length,
          aggregatedFacts: [],
          topicClusters: ['general'],
          diversityScore: 0.5,
          overallSummary: 'Content synthesis unavailable'
        };
      }
    } else {
      contentSynthesis = {
        processedSources: 0,
        aggregatedFacts: [],
        topicClusters: [],
        diversityScore: 0,
        overallSummary: 'Insufficient content for synthesis'
      };
    }

    console.log(`🧠 Synthesized content from ${contentSynthesis.processedSources} sources`);

    // Step 5: Calculate comprehensive quality metrics
    const qualityScores = sourceAnalysis.map(s => s.quality.credibilityScore);
    const averageCredibilityScore = qualityScores.length > 0 
      ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length 
      : 0;

    const domains = new Set(sourceAnalysis.map(s => {
      try {
        return new URL(s.url).hostname;
      } catch {
        return 'unknown';
      }
    }));

    const contentTypes = new Set(sourceAnalysis.map(s => s.quality.sourceType));
    const diversityScore = calculateSourceDiversity(sourceAnalysis);

    const qualityMetrics: DiscoveryResult['qualityMetrics'] = {
      averageCredibilityScore,
      diversityScore,
      sourcesProcessed: sourceAnalysis.length,
      highQualitySources: sourceAnalysis.filter(s => s.quality.credibilityScore > 0.7).length,
      domainVariety: domains.size,
      contentTypeVariety: contentTypes.size
    };

    console.log(`✅ Discovery complete: ${qualityMetrics.sourcesProcessed} sources, ${qualityMetrics.highQualitySources} high-quality`);

    // Step 6: Return comprehensive discovery results
    const result: DiscoveryResult = {
      originalQuery: query,
      parallelExecution: parallelResults,
      sourceAnalysis,
      contentSynthesis,
      qualityMetrics
    };

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        executionTime: parallelResults.executionTime,
        timestamp: new Date().toISOString(),
        version: '3.0.0-discovery'
      }
    });

  } catch (error) {
    console.error('Discovery API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Discovery failed' 
      },
      { status: 500 }
    );
  }
}

// Helper function to calculate source diversity
function calculateSourceDiversity(sources: DiscoveryResult['sourceAnalysis']): number {
  if (!sources.length) return 0;
  
  const domains = new Set<string>();
  const contentTypes = new Set<string>();
  const freshness = { fresh: 0, recent: 0, dated: 0 };
  const authority = { high: 0, medium: 0, low: 0 };
  
  sources.forEach(source => {
    try {
      const domain = new URL(source.url).hostname;
      domains.add(domain);
      contentTypes.add(source.quality.sourceType);
      freshness[source.quality.contentFreshness]++;
      authority[source.quality.domainAuthority]++;
    } catch {
      // Skip invalid URLs
    }
  });
  
  // Calculate diversity components
  const domainDiversity = Math.min(domains.size / Math.min(sources.length, 15), 1);
  const typeDiversity = Math.min(contentTypes.size / 7, 1); // 7 possible source types
  const freshnessBalance = 1 - Math.abs(0.33 - freshness.fresh / sources.length);
  const authorityBalance = 1 - Math.abs(0.5 - authority.high / sources.length);
  
  return (domainDiversity * 0.3 + typeDiversity * 0.3 + freshnessBalance * 0.2 + authorityBalance * 0.2);
}

export async function GET() {
  return NextResponse.json({ 
    message: 'HEXA Discovery API v3.0 - Multi-Source Discovery & Analysis',
    version: '3.0.0',
    features: [
      'Parallel search execution',
      'Source quality assessment',  
      'Content processing pipeline',
      'Structured information extraction',
      'Batch content synthesis',
      'Comprehensive quality metrics'
    ],
    endpoints: {
      'POST /': 'Execute multi-source discovery and analysis',
      'GET /': 'API information and capabilities'
    }
  });
}
