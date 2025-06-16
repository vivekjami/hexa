import Exa from 'exa-js'
import { ExaSearchOptions, ExaResponse, ExaError } from './types'

// Define proper types for Exa API responses
interface ExaSearchResult {
  id?: string;
  title?: string;
  url: string;
  publishedDate?: string;
  author?: string;
  score?: number;
  text?: string;
  highlights?: string[];
  summary?: string;
  [key: string]: unknown;
}

interface ExaApiResponse {
  results: ExaSearchResult[];
  autopromptString?: string;
  requestId?: string;
}

class ExaClient {
  private client: Exa
  private isInitialized: boolean = false

  constructor() {
    const apiKey = process.env.EXA_API_KEY
    if (!apiKey) {
      throw new Error('EXA_API_KEY is required but not found in environment variables')
    }
    
    try {
      this.client = new Exa(apiKey)
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize Exa client:', error)
      throw new Error('Failed to initialize Exa client')
    }
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Exa client is not properly initialized')
    }
  }

  async search(options: ExaSearchOptions): Promise<ExaResponse> {
    this.ensureInitialized()

    try {
      const searchOptions = {
        numResults: options.numResults || 10,
        includeDomains: options.includeDomains,
        excludeDomains: options.excludeDomains,
        startCrawlDate: options.startCrawlDate,
        endCrawlDate: options.endCrawlDate,
        useAutoprompt: options.useAutoprompt || true,
        type: options.type || 'neural'
      }

      console.log(`🔍 Searching with Exa: "${options.query}"`)
      // Pass query as first parameter, options as second
      const response = await this.client.searchAndContents(options.query, searchOptions) as ExaApiResponse

      return {
        results: response.results.map((result: ExaSearchResult) => ({
          id: result.id || Math.random().toString(36),
          title: result.title || 'Untitled',
          url: result.url,
          publishedDate: result.publishedDate,
          author: result.author,
          score: result.score,
          text: result.text,
          highlights: result.highlights || [],
          summary: result.summary
        })),
        autopromptString: response.autopromptString,
        requestId: response.requestId
      }
    } catch (error: unknown) {
      console.error('Exa search error:', error)
      
      const exaError: ExaError = {
        message: error instanceof Error ? error.message : 'Search failed',
        status: (error as Record<string, unknown>)?.status as number || 500,
        code: (error as Record<string, unknown>)?.code as string || 'SEARCH_ERROR'
      }
      
      throw exaError
    }
  }

  async getContents(urls: string[]): Promise<ExaSearchResult[]> {
    this.ensureInitialized()

    try {
      console.log(`📄 Fetching contents for ${urls.length} URLs`)
      const response = await this.client.getContents(urls) as { results: ExaSearchResult[] }
      return response.results || []
    } catch (error: unknown) {
      console.error('Exa get contents error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to get contents: ${errorMessage}`)
    }
  }

  async findSimilar(url: string, numResults: number = 5): Promise<ExaResponse> {
    this.ensureInitialized()

    try {
      console.log(`🔗 Finding similar content for: ${url}`)
      const response = await this.client.findSimilarAndContents(url, { numResults }) as ExaApiResponse
      
      return {
        results: response.results.map((result: ExaSearchResult) => ({
          id: result.id || Math.random().toString(36),
          title: result.title || 'Untitled',
          url: result.url,
          publishedDate: result.publishedDate,
          author: result.author,
          score: result.score,
          text: result.text,
          highlights: result.highlights || []
        }))
      }
    } catch (error: unknown) {
      console.error('Exa find similar error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to find similar content: ${errorMessage}`)
    }
  }
}

// Export singleton instance
export const exaClient = new ExaClient()