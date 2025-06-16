import { NextRequest, NextResponse } from 'next/server';
import { searchWithExa } from '@/lib/exa/client';
import { generateSearchQueries } from '@/lib/openai/client';

export async function POST(request: NextRequest) {
  try {
    const { query, options = {} } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    // Generate multiple search strategies using OpenAI
    const queryGeneration = await generateSearchQueries(query);
    
    let searchQueries = [query]; // Default to original query
    if (queryGeneration.success && queryGeneration.queries.length > 0) {
      searchQueries = queryGeneration.queries.slice(0, 3); // Use top 3 generated queries
    }

    // Execute searches in parallel
    const searchPromises = searchQueries.map(searchQuery => 
      searchWithExa(searchQuery, options)
    );

    const searchResults = await Promise.all(searchPromises);

    // Combine and deduplicate results
    const allResults = [];
    const seenUrls = new Set();

    for (const result of searchResults) {
      if (result.success && result.data?.results) {
        for (const item of result.data.results) {
          if (!seenUrls.has(item.url)) {
            seenUrls.add(item.url);
            allResults.push({
              ...item,
              searchQuery: searchQueries[searchResults.indexOf(result)]
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        originalQuery: query,
        generatedQueries: queryGeneration.success ? queryGeneration.queries : [],
        results: allResults,
        totalResults: allResults.length
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

export async function GET() {
  return NextResponse.json({ 
    message: 'HEXA Search API is running',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
  });
}