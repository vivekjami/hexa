import Exa from 'exa-js'
import { ExaSearchOptions, ExaResponse, ExaError } from './types'

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
        query: options.query,
        numResults: options.numResults || 10,
        includeDomains: options.includeDomains,
        excludeDomains: options.excludeDomains,
        startCrawlDate: options.startCrawlDate,
        endCrawlDate: options.endCrawlDate,
        useAutoprompt: options.useAutoprompt || true,
        type: options.type || 'neural'
      }

      console.log(`🔍 Searching with Exa: "${options.query}"`)
      const response = await this.client.searchAndContents(searchOptions)

      return {
        results: response.results.map((result: any) => ({
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
    } catch (error: any) {
      console.error('Exa search error:', error)
      
      const exaError: ExaError = {
        message: error.message || 'Search failed',
        status: error.status || 500,
        code: error.code || 'SEARCH_ERROR'
      }
      
      throw exaError
    }
  }

  async getContents(urls: string[]): Promise<any[]> {
    this.ensureInitialized()

    try {
      console.log(`📄 Fetching contents for ${urls.length} URLs`)
      const response = await this.client.getContents(urls)
      return response.results || []
    } catch (error: any) {
      console.error('Exa get contents error:', error)
      throw new Error(`Failed to get contents: ${error.message}`)
    }
  }

  async findSimilar(url: string, numResults: number = 5): Promise<ExaResponse> {
    this.ensureInitialized()

    try {
      console.log(`🔗 Finding similar content for: ${url}`)
      const response = await this.client.findSimilarAndContents(url, { numResults })
      
      return {
        results: response.results.map((result: any) => ({
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
    } catch (error: any) {
      console.error('Exa find similar error:', error)
      throw new Error(`Failed to find similar content: ${error.message}`)
    }
  }
}

// Export singleton instance
export const exaClient = new ExaClient()