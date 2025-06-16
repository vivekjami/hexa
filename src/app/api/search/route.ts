import { NextRequest, NextResponse } from 'next/server'
import { exaClient } from '@/lib/exa/client'
import { ExaSearchOptions } from '@/lib/exa/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, numResults = 10, options = {} } = body

    // Validate input
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      )
    }

    if (query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query cannot be empty' },
        { status: 400 }
      )
    }

    // Prepare search options
    const searchOptions: ExaSearchOptions = {
      query: query.trim(),
      numResults: Math.min(Math.max(numResults, 1), 20), // Limit between 1-20
      useAutoprompt: true,
      type: 'neural',
      ...options
    }

    console.log(`🔍 API: Searching for "${searchOptions.query}"`)

    // Perform search
    const startTime = Date.now()
    const response = await exaClient.search(searchOptions)
    const duration = Date.now() - startTime

    console.log(`✅ API: Search completed in ${duration}ms, found ${response.results.length} results`)

    // Return results
    return NextResponse.json({
      success: true,
      query: searchOptions.query,
      results: response.results,
      autopromptString: response.autopromptString,
      requestId: response.requestId,
      metadata: {
        duration,
        timestamp: new Date().toISOString(),
        resultsCount: response.results.length
      }
    })

  } catch (error: unknown) {
    console.error('❌ API: Search error:', error)

    // Handle different types of errors
    let statusCode = 500
    let errorMessage = 'Internal server error'

    // Type guard for error objects
    if (typeof error === 'object' && error !== null) {
      const err = error as {
        status?: number;
        message?: string;
        code?: string;
      }

      if (err.status) {
        statusCode = err.status
        errorMessage = err.message || errorMessage
      } else if (err.message?.includes('API key')) {
        statusCode = 401
        errorMessage = 'Invalid or missing API key'
      } else if (err.message?.includes('rate limit')) {
        statusCode = 429
        errorMessage = 'Rate limit exceeded'
      } else if (err.message) {
        errorMessage = err.message
      }

      return NextResponse.json(
        { 
          error: errorMessage,
          code: err.code || 'SEARCH_ERROR',
          timestamp: new Date().toISOString()
        },
        { status: statusCode }
      )
    }

    // Fallback for non-object errors
    return NextResponse.json(
      { 
        error: errorMessage,
        code: 'SEARCH_ERROR',
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    )
  }
}
export async function GET() {
  return NextResponse.json({
    message: 'HEXA Search API is running',
    version: '1.0.0',
    endpoints: {
      search: 'POST /api/search',
      research: 'POST /api/research'
    }
  })
}