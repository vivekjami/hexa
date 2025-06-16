import Exa from 'exa-js';

// Exa client configuration
const exa = new Exa(process.env.EXA_API_KEY);

export interface ExaSearchOptions {
  numResults?: number;
  includeDomains?: string[];
  excludeDomains?: string[];
  startCrawlDate?: string;
  endCrawlDate?: string;
  startPublishedDate?: string;
  endPublishedDate?: string;
  useAutoprompt?: boolean;
  type?: 'neural' | 'keyword';
  category?: 'company' | 'research paper' | 'news' | 'github' | 'tweet' | 'movie' | 'song' | 'personal site' | 'pdf';
}

export interface ExaSearchResult {
  id: string;
  url: string;
  title: string;
  score: number;
  publishedDate?: string;
  author?: string;
  text?: string;
  highlights?: string[];
  highlightScores?: number[];
}

export interface ExaSearchResponse {
  results: ExaSearchResult[];
  autopromptString?: string;
  requestId: string;
}

export class ExaClient {
  private client: Exa;

  constructor() {
    if (!process.env.EXA_API_KEY) {
      throw new Error('EXA_API_KEY environment variable is required');
    }
    this.client = new Exa(process.env.EXA_API_KEY);
  }

  /**
   * Perform a neural search using Exa
   */
  async search(
    query: string,
    options: ExaSearchOptions = {}
  ): Promise<ExaSearchResponse> {
    try {
      const searchOptions = {
        numResults: options.numResults || 10,
        includeDomains: options.includeDomains,
        excludeDomains: options.excludeDomains,
        startCrawlDate: options.startCrawlDate,
        endCrawlDate: options.endCrawlDate,
        startPublishedDate: options.startPublishedDate,
        endPublishedDate: options.endPublishedDate,
        useAutoprompt: options.useAutoprompt ?? true,
        type: options.type || 'neural',
        category: options.category,
      };

      const response = await this.client.search(query, searchOptions);
      
      return {
        results: response.results.map((result: any) => ({
          id: result.id,
          url: result.url,
          title: result.title,
          score: result.score,
          publishedDate: result.publishedDate,
          author: result.author,
          text: result.text,
          highlights: result.highlights,
          highlightScores: result.highlightScores,
        })),
        autopromptString: response.autopromptString,
        requestId: response.requestId || 'unknown',
      };
    } catch (error) {
      console.error('Exa search error:', error);
      throw new Error(
        error instanceof Error 
          ? `Search failed: ${error.message}`
          : 'Search failed: Unknown error'
      );
    }
  }

  /**
   * Find similar content to a given URL
   */
  async findSimilar(
    url: string,
    numResults: number = 5
  ): Promise<ExaSearchResponse> {
    try {
      const response = await this.client.findSimilar(url, {
        numResults,
      });

      return {
        results: response.results.map((result: any) => ({
          id: result.id,
          url: result.url,
          title: result.title,
          score: result.score,
          publishedDate: result.publishedDate,
          author: result.author,
        })),
        requestId: response.requestId || 'unknown',
      };
    } catch (error) {
      console.error('Exa findSimilar error:', error);
      throw new Error(
        error instanceof Error
          ? `Find similar failed: ${error.message}`
          : 'Find similar failed: Unknown error'
      );
    }
  }

  /**
   * Get full content from URLs
   */
  async getContents(
    ids: string[],
    options: { text?: boolean; highlights?: boolean } = {}
  ): Promise<any> {
    try {
      const response = await this.client.getContents(ids, {
        text: options.text ?? true,
        highlights: options.highlights ?? false,
      });

      return response;
    } catch (error) {
      console.error('Exa getContents error:', error);
      throw new Error(
        error instanceof Error
          ? `Get contents failed: ${error.message}`
          : 'Get contents failed: Unknown error'
      );
    }
  }

  /**
   * Perform multiple searches with different strategies
   */
  async multiSearch(queries: string[], options: ExaSearchOptions = {}): Promise<{
    [key: string]: ExaSearchResponse;
  }> {
    try {
      const searchPromises = queries.map(async (query, index) => {
        const result = await this.search(query, {
          ...options,
          numResults: options.numResults || 5,
        });
        return { query, result };
      });

      const results = await Promise.allSettled(searchPromises);
      const successResults: { [key: string]: ExaSearchResponse } = {};

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successResults[result.value.query] = result.value.result;
        } else {
          console.error(`Search failed for query "${queries[index]}":`, result.reason);
        }
      });

      return successResults;
    } catch (error) {
      console.error('Multi-search error:', error);
      throw new Error('Multi-search failed');
    }
  }

  /**
   * Health check for Exa API
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.search('test', { numResults: 1 });
      return true;
    } catch (error) {
      console.error('Exa health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const exaClient = new ExaClient();