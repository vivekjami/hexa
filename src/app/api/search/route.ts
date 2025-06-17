import { NextRequest, NextResponse } from 'next/server';
import { multiStrategySearch, findSimilarWithExtraction, extractAndEnrichContent } from '@/lib/exa/client';
import { generateAdvancedSearchStrategy, refineQueriesBasedOnResults } from '@/lib/gemini/client';

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
    let enrichedContent: unknown[] = [];
    let similarContent: unknown[] = [];

    // Execute multi-strategy search
    if (mode === 'comprehensive' && prioritizedQueries) {
      searchResults = await multiStrategySearch(prioritizedQueries, options);
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

    // Extract and enrich content from top results
    const topUrls = searchResults.data?.results?.slice(0, 5).map(r => r.url) || [];
    if (topUrls.length > 0) {
      const enrichmentResult = await extractAndEnrichContent(topUrls);
      if (enrichmentResult.success) {
        enrichedContent = enrichmentResult.data || [];
      }

      // Find similar content for diversity
      const similarityResult = await findSimilarWithExtraction(topUrls.slice(0, 2));
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
        searchResults.data.results.slice(0, 3).map(r => ({
          title: r.title || '',
          url: r.url,
          text: r.text,
          publishedDate: r.publishedDate,
          author: r.author,
          score: r.score
        })), 
        gaps
      );
      if (refinementResult.success) {
        refinedQueries = refinementResult.refinedQueries || [];
      }
    }

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
        metadata: {
          complexity: analysis?.complexity || 'moderate',
          domains: analysis?.domains || [],
          timestamp: new Date().toISOString()
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