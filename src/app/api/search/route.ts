import { NextRequest, NextResponse } from 'next/server';
import { 
  multiStrategySearch, 
  findSimilarWithExtraction, 
  extractAndEnrichContent,
  executeParallelSearch,
  assessSourceQuality,
  extractStructuredInformation
} from '@/lib/exa/client';
import { 
  generateAdvancedSearchStrategy, 
  refineQueriesBasedOnResults,
  processBatchContent
} from '@/lib/gemini/client';

// Define interfaces for proper typing
interface SearchResult {
  url: string;
  title?: string | null;
  description?: string | null;
  text?: string | null;
  publishedDate?: string | null;
  author?: string;
  score?: number;
  searchQuery?: string;
  strategy?: string;
  relevanceScore?: number;
}

interface EnrichedContent {
  url: string;
  title?: string | null;
  text?: string | null;
  publishedDate?: string | null;
  wordCount?: number;
  readingTime?: number;
  extractedAt?: string;
  contentQuality?: string;
}

interface SourceQualityScore {
  url: string;
  quality: {
    credibilityScore: number;
    domainAuthority: 'high' | 'medium' | 'low';
    contentFreshness: 'fresh' | 'recent' | 'dated';
    sourceType: string;
    factualityIndicators: string[];
    biasIndicators: string[];
  };
  structuredData: {
    keyFacts: Array<{
      claim: string;
      confidence: number;
      category: string;
      entities: string[];
    }>;
    mainTopics: string[];
    namedEntities: { [category: string]: string[] };
    summary: string;
    citations: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const { query, options = {}, mode = 'comprehensive' } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    // Generate advanced search strategy
    const strategyGeneration = await generateAdvancedSearchStrategy(query);
    
    if (!strategyGeneration.success) {
      return NextResponse.json(
        { error: 'Failed to generate search strategy' },
        { status: 500 }
      );
    }

    const { analysis, strategy, prioritizedQueries } = strategyGeneration;

    let searchResults;
    let enrichedContent: EnrichedContent[] = [];
    let similarContent: unknown[] = [];
    let parallelResults = null;
    let contentAnalysis = null;
    let sourceQualityScores: SourceQualityScore[] = [];

    // Day 3: Execute parallel search for better coverage
    if (mode === 'comprehensive' && prioritizedQueries && prioritizedQueries.length > 1) {
      const parallelSearch = await executeParallelSearch(prioritizedQueries, options);
      if (parallelSearch.success) {
        parallelResults = parallelSearch.data;
        searchResults = {
          success: true,
          data: {
            results: parallelSearch.data?.aggregatedResults || [],
            totalFound: parallelSearch.data?.totalSources || 0,
            strategies: parallelSearch.data?.results?.map(r => r.strategy) || []
          }
        };
      } else {
        // Fallback to regular multi-strategy search
        searchResults = await multiStrategySearch(prioritizedQueries, options);
      }
    } else {
      // Fallback to simple search
      searchResults = await multiStrategySearch([query], options);
    }

    if (!searchResults.success) {
      return NextResponse.json(
        { error: 'Search execution failed' },
        { status: 500 }
      );
    }

    // Day 3: Enhanced content extraction and analysis
    const topUrls = searchResults.data?.results?.slice(0, 8).map(r => r.url) || [];
    if (topUrls.length > 0) {
      const enrichmentResult = await extractAndEnrichContent(topUrls);
      if (enrichmentResult.success) {
        enrichedContent = enrichmentResult.data || [];
        
        // Day 3: Assess source quality for each source
        sourceQualityScores = enrichedContent.map((content: EnrichedContent) => ({
          url: content.url,
          quality: assessSourceQuality(content.url, content.text || '', content.publishedDate),
          structuredData: extractStructuredInformation(content.text || '', content.url)
        }));

        // Day 3: Batch content analysis
        const contentBatch = enrichedContent.slice(0, 5).map((content: EnrichedContent) => ({
          url: content.url,
          text: content.text || '',
          title: content.title || ''
        }));
        
        if (contentBatch.length > 0) {
          const batchAnalysis = await processBatchContent(contentBatch);
          if (batchAnalysis.success) {
            contentAnalysis = batchAnalysis.data;
          }
        }
      }

      // Find similar content for diversity
      const similarityResult = await findSimilarWithExtraction(topUrls.slice(0, 3));
      if (similarityResult.success) {
        similarContent = similarityResult.data?.results?.slice(0, 5) || [];
      }
    }

    // Analyze results for potential gaps
    const resultTitles = searchResults.data?.results?.map(r => r.title || '') || [];
    const gaps = identifyInformationGaps(query, resultTitles);

    // Generate refined queries if gaps are found
    let refinedQueries: string[] = [];
    if (gaps.length > 0 && searchResults.data?.results) {
      const refinementResult = await refineQueriesBasedOnResults(
        query, 
        searchResults.data.results.slice(0, 3).map((r: SearchResult) => ({
          title: r.title || '',
          url: r.url,
          text: r.text || undefined,
          publishedDate: r.publishedDate || undefined,
          author: r.author || undefined,
          score: r.score || undefined
        })), 
        gaps
      );
      if (refinementResult.success) {
        refinedQueries = refinementResult.refinedQueries || [];
      }
    }

    // Day 3: Calculate diversity and quality metrics
    const diversityScore = calculateDiversityScore(searchResults.data?.results || []);
    const avgQualityScore = sourceQualityScores.length > 0 
      ? sourceQualityScores.reduce((sum, s) => sum + s.quality.credibilityScore, 0) / sourceQualityScores.length 
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        originalQuery: query,
        analysis: analysis,
        searchStrategy: strategy,
        prioritizedQueries: prioritizedQueries || [query],
        results: searchResults.data?.results || [],
        enrichedContent,
        similarContent,
        totalResults: searchResults.data?.results?.length || 0,
        searchStrategies: searchResults.data?.strategies || [],
        gaps,
        refinedQueries,
        
        // Day 3: Enhanced analytics
        parallelExecution: parallelResults,
        contentAnalysis,
        sourceQuality: sourceQualityScores,
        qualityMetrics: {
          averageCredibilityScore: avgQualityScore,
          diversityScore,
          sourcesProcessed: sourceQualityScores.length,
          highQualitySources: sourceQualityScores.filter(s => s.quality.credibilityScore > 0.7).length
        },
        
        metadata: {
          complexity: analysis?.complexity || 'moderate',
          domains: analysis?.domains || [],
          timestamp: new Date().toISOString(),
          processingTime: parallelResults?.executionTime || 0
        }
      }
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// Helper function to identify information gaps
function identifyInformationGaps(query: string, resultTitles: string[]): string[] {
  const gaps = [];
  const queryLower = query.toLowerCase();
  const titlesText = resultTitles.join(' ').toLowerCase();

  // Check for common information types
  const infoTypes = [
    { type: 'statistics', keywords: ['statistics', 'data', 'numbers', 'percentage'] },
    { type: 'expert opinions', keywords: ['expert', 'opinion', 'analysis', 'perspective'] },
    { type: 'recent developments', keywords: ['recent', 'latest', 'new', '2024', '2025'] },
    { type: 'case studies', keywords: ['case study', 'example', 'implementation'] },
    { type: 'research findings', keywords: ['research', 'study', 'findings', 'results'] }
  ];

  for (const info of infoTypes) {
    const hasKeywords = info.keywords.some(keyword => titlesText.includes(keyword));
    const isRelevant = info.keywords.some(keyword => queryLower.includes(keyword.split(' ')[0]));
    
    if (isRelevant && !hasKeywords) {
      gaps.push(`Missing ${info.type}`);
    }
  }

  // Check for temporal gaps
  if (queryLower.includes('trend') || queryLower.includes('evolution')) {
    const hasHistorical = titlesText.includes('history') || titlesText.includes('evolution');
    if (!hasHistorical) gaps.push('Missing historical context');
  }

  return gaps;
}

// Day 3: Calculate diversity score for search results
function calculateDiversityScore(results: SearchResult[]): number {
  if (!results.length) return 0;
  
  const domains = new Set<string>();
  const contentTypes = new Set<string>();
  
  results.forEach(result => {
    try {
      const domain = new URL(result.url).hostname;
      domains.add(domain);
      
      // Determine content type based on URL or title
      const url = result.url.toLowerCase();
      const title = (result.title || '').toLowerCase();
      
      if (url.includes('arxiv') || url.includes('scholar') || title.includes('research')) {
        contentTypes.add('academic');
      } else if (url.includes('news') || url.includes('reuters') || url.includes('bbc')) {
        contentTypes.add('news');
      } else if (url.includes('gov')) {
        contentTypes.add('government');
      } else if (url.includes('blog') || url.includes('medium')) {
        contentTypes.add('blog');
      } else {
        contentTypes.add('general');
      }
    } catch {
      // Skip invalid URLs
    }
  });
  
  // Calculate diversity based on domain and content type variety
  const domainDiversity = Math.min(domains.size / Math.min(results.length, 10), 1);
  const typeDiversity = Math.min(contentTypes.size / 5, 1);
  
  return (domainDiversity + typeDiversity) / 2;
}

export async function GET() {
  return NextResponse.json({ 
    message: 'HEXA Search API v2.0 - Smart Query Generation',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '2.0.0',
    features: [
      'Advanced query decomposition',
      'Multi-strategy search',
      'Content enrichment',
      'Similarity discovery',
      'Gap analysis',
      'Query refinement'
    ]
  });
}