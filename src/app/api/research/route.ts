import { NextRequest, NextResponse } from 'next/server'
import { openaiClient } from '@/lib/openai/client'
import { exaClient } from '@/lib/exa/client'
import { generateId } from '@/lib/utils'

// Define proper types for search results
interface SearchResult {
  id: string;
  title: string;
  url: string;
  text?: string;  // Make text optional
  score?: number; // Make score optional
  sourceQuery: string;
  publishedDate?: string;
  author?: string;
  highlights?: string[];
  summary?: string;
  [key: string]: unknown; // For any additional properties
}

interface ResearchSession {
  id: string
  topic: string
  queries: string[]
  results: SearchResult[] // Replace any[] with SearchResult[]
  status: 'pending' | 'processing' | 'completed' | 'error'
  createdAt: Date
  updatedAt: Date
}

// In-memory storage for demo (replace with database in production)
const sessions = new Map<string, ResearchSession>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, action = 'create' } = body

    if (action === 'create') {
      // Validate input
      if (!topic || typeof topic !== 'string') {
        return NextResponse.json(
          { error: 'Topic is required and must be a string' },
          { status: 400 }
        )
      }

      if (topic.trim().length === 0) {
        return NextResponse.json(
          { error: 'Topic cannot be empty' },
          { status: 400 }
        )
      }

      console.log(`🔬 API: Starting research session for "${topic}"`)

      // Create research session
      const sessionId = generateId()
      const session: ResearchSession = {
        id: sessionId,
        topic: topic.trim(),
        queries: [],
        results: [],
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      sessions.set(sessionId, session)

      // Generate search queries using OpenAI
      session.status = 'processing'
      session.updatedAt = new Date()

      try {
        console.log(`🧠 API: Generating search queries for "${topic}"`)
        const queries = await openaiClient.generateSearchQueries(topic)
        session.queries = queries
        
        console.log(`📝 API: Generated ${queries.length} queries:`, queries)

        // Execute searches for each query
        const searchPromises = queries.map(async (query) => {
          try {
            const response = await exaClient.search({
              query,
              numResults: 5,
              useAutoprompt: true,
              type: 'neural'
            })
            return {
              query,
              results: response.results,
              success: true
            }
          } catch (error) {
            console.error(`❌ API: Search failed for query "${query}":`, error)
            return {
              query,
              results: [],
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }
        })

        const searchResults = await Promise.all(searchPromises)
        
        // Combine all results
        const allResults = searchResults.flatMap(result => 
          result.results.map(r => ({ ...r, sourceQuery: result.query }))
        )

        session.results = allResults
        session.status = 'completed'
        session.updatedAt = new Date()

        console.log(`✅ API: Research session completed with ${allResults.length} total results`)

        return NextResponse.json({
          success: true,
          sessionId,
          session: {
            id: session.id,
            topic: session.topic,
            queries: session.queries,
            resultCount: session.results.length,
            status: session.status,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt
          }
        })

      } catch (error: unknown) {
        console.error('❌ API: Research processing error:', error)
        session.status = 'error'
        session.updatedAt = new Date()
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        return NextResponse.json(
          { 
            error: 'Failed to process research request',
            sessionId,
            details: errorMessage
          },
          { status: 500 }
        )
      }
    }

    // Handle other actions (get session, etc.)
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error: unknown) {
    console.error('❌ API: Research error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('id')

  if (sessionId) {
    const session = sessions.get(sessionId)
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        topic: session.topic,
        queries: session.queries,
        results: session.results,
        status: session.status,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }
    })
  }

  // Return all sessions (for debugging)
  const allSessions = Array.from(sessions.values()).map(session => ({
    id: session.id,
    topic: session.topic,
    status: session.status,
    resultCount: session.results.length,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt
  }))

  return NextResponse.json({
    success: true,
    sessions: allSessions,
    message: 'HEXA Research API is running'
  })
}