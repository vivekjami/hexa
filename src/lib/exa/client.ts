import Exa from 'exa-js';

if (!process.env.EXA_API_KEY) {
  throw new Error('EXA_API_KEY is required');
}

export const exaClient = new Exa(process.env.EXA_API_KEY);

// Define types that match Exa API expectations
type ExaCategory = 
  | "company" 
  | "research paper" 
  | "news" 
  | "pdf" 
  | "github" 
  | "tweet" 
  | "personal site" 
  | "linkedin profile" 
  | "financial report";

// Define text content options interface
interface TextContentsOptions {
  maxCharacters?: number;
  includeHtmlTags?: boolean;
}

// Define interfaces that match the actual Exa API
interface SearchOptions {
  numResults?: number;
  useAutoprompt?: boolean;
  text?: true | TextContentsOptions;
  startCrawlDate?: string;
  endCrawlDate?: string;
  startPublishedDate?: string;
  endPublishedDate?: string;
  includeDomains?: string[];
  excludeDomains?: string[];
  category?: ExaCategory;
}

interface SimilarContentOptions {
  numResults?: number;
  text?: true | TextContentsOptions;
  startCrawlDate?: string;
  endCrawlDate?: string;
  startPublishedDate?: string;
  endPublishedDate?: string;
  includeDomains?: string[];
  excludeDomains?: string[];
  category?: ExaCategory;
}

// Exa search wrapper with error handling
export async function searchWithExa(query: string, options: SearchOptions = {}) {
  try {
    const defaultOptions = {
      numResults: 10,
      useAutoprompt: true,
      text: true as const,
      ...options
    };

    const response = await exaClient.searchAndContents(query, defaultOptions);
    return {
      success: true,
      data: response,
      error: null
    };
  } catch (error) {
    console.error('Exa search error:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Neural similarity search
export async function findSimilarContent(url: string, options: SimilarContentOptions = {}) {
  try {
    const defaultOptions = {
      numResults: 5,
      text: true as const,
      ...options
    };

    const response = await exaClient.findSimilarAndContents(url, defaultOptions);
    return {
      success: true,
      data: response,
      error: null
    };
  } catch (error) {
    console.error('Exa similarity search error:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Multi-strategy search with different approaches
export async function multiStrategySearch(queries: string[], options: SearchOptions = {}) {
  try {
    const searchStrategies = [
      // Neural search strategy
      { type: 'neural', queries: queries.slice(0, 3), options: { useAutoprompt: false, ...options } },
      // Keyword search strategy  
      { type: 'keyword', queries: queries.slice(1, 4), options: { useAutoprompt: true, ...options } },
      // Recent content strategy
      { 
        type: 'recent', 
        queries: queries.slice(0, 2), 
        options: { 
          ...options,
          startPublishedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Last 90 days
        } 
      }
    ];

    const allResults = [];
    const seenUrls = new Set();

    for (const strategy of searchStrategies) {
      for (const query of strategy.queries) {
        try {
          const response = await exaClient.searchAndContents(query, {
            numResults: 5,
            text: true as const,
            ...strategy.options
          });

          if (response.results) {
            for (const result of response.results) {
              if (!seenUrls.has(result.url)) {
                seenUrls.add(result.url);
                allResults.push({
                  ...result,
                  searchQuery: query,
                  strategy: strategy.type,
                  relevanceScore: calculateRelevanceScore(result, query)
                });
              }
            }
          }
        } catch (error) {
          console.error(`Search error for query "${query}":`, error);
        }
      }
    }

    // Sort by relevance score
    allResults.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    return {
      success: true,
      data: {
        results: allResults.slice(0, 20), // Top 20 results
        totalFound: allResults.length,
        strategies: searchStrategies.map(s => s.type)
      },
      error: null
    };

  } catch (error) {
    console.error('Multi-strategy search error:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Search failed'
    };
  }
}

// Enhanced similarity search with content extraction
export async function findSimilarWithExtraction(urls: string[], options: SimilarContentOptions = {}) {
  try {
    const allSimilar = [];
    const seenUrls = new Set();

    for (const url of urls) {
      try {
        const response = await exaClient.findSimilarAndContents(url, {
          numResults: 8,
          text: true as const,
          ...options
        });

        if (response.results) {
          for (const result of response.results) {
            if (!seenUrls.has(result.url)) {
              seenUrls.add(result.url);
              allSimilar.push({
                ...result,
                sourceUrl: url,
                similarityType: 'content'
              });
            }
          }
        }
      } catch (error) {
        console.error(`Similarity search error for URL "${url}":`, error);
      }
    }

    return {
      success: true,
      data: {
        results: allSimilar,
        totalFound: allSimilar.length
      },
      error: null
    };

  } catch (error) {
    console.error('Similarity search error:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Similarity search failed'
    };
  }
}

// Content extraction and enrichment
export async function extractAndEnrichContent(urls: string[]) {
  try {
    const enrichedContent = [];

    for (const url of urls.slice(0, 10)) { // Limit to prevent API overuse
      try {
        const response = await exaClient.getContents([url], {
          text: true
        });

        if (response.results && response.results[0]) {
          const content = response.results[0];
          enrichedContent.push({
            ...content,
            wordCount: content.text?.split(/\s+/).length || 0,
            readingTime: Math.ceil((content.text?.split(/\s+/).length || 0) / 200), // Average reading speed
            extractedAt: new Date().toISOString(),
            contentQuality: assessContentQuality(content.text || '')
          });
        }
      } catch (error) {
        console.error(`Content extraction error for URL "${url}":`, error);
      }
    }

    return {
      success: true,
      data: enrichedContent,
      error: null
    };

  } catch (error) {
    console.error('Content extraction error:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Content extraction failed'
    };
  }
}

// Helper function to calculate relevance score
function calculateRelevanceScore(result: {
  title?: string | null;
  description?: string | null;
  text?: string | null;
  publishedDate?: string | null;
}, query: string): number {
  let score = 0.5; // Base score

  const queryTerms = query.toLowerCase().split(/\s+/);
  const title = (result.title || '').toLowerCase();
  const description = (result.description || '').toLowerCase();
  const text = (result.text || '').toLowerCase();

  // Title relevance (highest weight)
  queryTerms.forEach(term => {
    if (title.includes(term)) score += 0.3;
  });

  // Description relevance
  queryTerms.forEach(term => {
    if (description.includes(term)) score += 0.2;
  });

  // Text content relevance
  queryTerms.forEach(term => {
    if (text.includes(term)) score += 0.1;
  });

  // Recency bonus
  if (result.publishedDate) {
    const publishedDate = new Date(result.publishedDate);
    const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePublished < 30) score += 0.2;
    else if (daysSincePublished < 90) score += 0.1;
  }

  return Math.min(score, 1.0); // Cap at 1.0
}

// Helper function to assess content quality
function assessContentQuality(text: string): 'high' | 'medium' | 'low' {
  if (!text) return 'low';
  
  const wordCount = text.split(/\s+/).length;
  const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);

  // Quality indicators
  const hasGoodLength = wordCount >= 200 && wordCount <= 5000;
  const hasGoodStructure = avgWordsPerSentence >= 10 && avgWordsPerSentence <= 25;
  const hasVariety = new Set(text.toLowerCase().split(/\s+/)).size / wordCount > 0.3;

  if (hasGoodLength && hasGoodStructure && hasVariety) return 'high';
  if (hasGoodLength || hasGoodStructure) return 'medium';
  return 'low';
}