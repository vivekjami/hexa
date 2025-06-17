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

// Day 3: Enhanced source quality assessment interface
export interface SourceQuality {
  credibilityScore: number;
  domainAuthority: 'high' | 'medium' | 'low';
  contentFreshness: 'fresh' | 'recent' | 'dated';
  sourceType: 'academic' | 'news' | 'government' | 'commercial' | 'blog' | 'social' | 'unknown';
  factualityIndicators: string[];
  biasIndicators: string[];
}

// Day 3: Structured information extraction interface
export interface ExtractedFact {
  claim: string;
  confidence: number;
  evidence: string;
  category: 'statistic' | 'claim' | 'quote' | 'definition' | 'relationship';
  entities: string[];
}

export interface StructuredContent {
  keyFacts: ExtractedFact[];
  mainTopics: string[];
  namedEntities: { [category: string]: string[] };
  summary: string;
  citations: string[];
}

// Day 3: Parallel search execution interface
export interface ParallelSearchResult {
  query: string;
  results: SearchResult[];
  strategy: string;
  executionTime: number;
  success: boolean;
  error?: string;
}

// Search result interface
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

// Day 3: Parallel search execution with improved performance and aggregation
export async function executeParallelSearch(queries: string[], options: SearchOptions = {}): Promise<{
  success: boolean;
  data?: {
    results: ParallelSearchResult[];
    aggregatedResults: SearchResult[];
    totalSources: number;
    executionTime: number;
  };
  error?: string;
}> {
  try {
    const startTime = Date.now();
    
    // Execute searches in parallel with different strategies
    const searchPromises = queries.map(async (query, index): Promise<ParallelSearchResult> => {
      const searchStartTime = Date.now();
      
      // Assign different strategies to different queries
      const strategies = ['neural', 'keyword', 'recent', 'academic'];
      const strategy = strategies[index % strategies.length];
      
      let searchOptions: SearchOptions = { ...options };
      
      // Apply strategy-specific options
      switch (strategy) {
        case 'neural':
          searchOptions = { ...searchOptions, useAutoprompt: false };
          break;
        case 'keyword':
          searchOptions = { ...searchOptions, useAutoprompt: true };
          break;
        case 'recent':
          searchOptions = {
            ...searchOptions,
            startPublishedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          };
          break;
        case 'academic':
          searchOptions = {
            ...searchOptions,
            category: 'research paper' as ExaCategory,
            includeDomains: ['arxiv.org', 'scholar.google.com', 'pubmed.ncbi.nlm.nih.gov']
          };
          break;
      }
      
      try {
        const response = await exaClient.searchAndContents(query, {
          numResults: 8,
          text: true as const,
          ...searchOptions
        });
        
        const results = response.results?.map(result => ({
          ...result,
          searchQuery: query,
          strategy,
          relevanceScore: calculateRelevanceScore(result, query)
        })) || [];
        
        return {
          query,
          results,
          strategy,
          executionTime: Date.now() - searchStartTime,
          success: true
        };
      } catch (error) {
        return {
          query,
          results: [],
          strategy,
          executionTime: Date.now() - searchStartTime,
          success: false,
          error: error instanceof Error ? error.message : 'Search failed'
        };
      }
    });
    
    // Wait for all searches to complete
    const searchResults = await Promise.all(searchPromises);
    
    // Aggregate and deduplicate results
    const aggregatedResults = aggregateAndDeduplicateResults(searchResults);
    
    const totalExecutionTime = Date.now() - startTime;
    
    return {
      success: true,
      data: {
        results: searchResults,
        aggregatedResults,
        totalSources: aggregatedResults.length,
        executionTime: totalExecutionTime
      }
    };
    
  } catch (error) {
    console.error('Parallel search execution error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Parallel search failed'
    };
  }
}

// Day 3: Enhanced source quality assessment
export function assessSourceQuality(url: string, content: string, publishedDate?: string | null): SourceQuality {
  const domain = new URL(url).hostname.toLowerCase();
  
  // Domain authority assessment
  const highAuthorityDomains = [
    'edu', 'gov', 'org', 'nature.com', 'science.org', 'arxiv.org', 
    'pubmed.ncbi.nlm.nih.gov', 'scholar.google.com', 'ieee.org',
    'nytimes.com', 'wsj.com', 'reuters.com', 'bbc.com', 'economist.com'
  ];
  
  const mediumAuthorityDomains = [
    'wikipedia.org', 'medium.com', 'linkedin.com', 'forbes.com',
    'techcrunch.com', 'wired.com', 'mit.edu', 'stanford.edu'
  ];
  
  let domainAuthority: 'high' | 'medium' | 'low' = 'low';
  if (highAuthorityDomains.some(d => domain.includes(d))) {
    domainAuthority = 'high';
  } else if (mediumAuthorityDomains.some(d => domain.includes(d))) {
    domainAuthority = 'medium';
  }
  
  // Content freshness
  let contentFreshness: 'fresh' | 'recent' | 'dated' = 'dated';
  if (publishedDate) {
    const daysSincePublished = (Date.now() - new Date(publishedDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePublished <= 7) contentFreshness = 'fresh';
    else if (daysSincePublished <= 90) contentFreshness = 'recent';
  }
  
  // Source type detection
  let sourceType: SourceQuality['sourceType'] = 'unknown';
  if (domain.includes('.edu') || domain.includes('arxiv') || domain.includes('scholar')) {
    sourceType = 'academic';
  } else if (domain.includes('.gov')) {
    sourceType = 'government';
  } else if (domain.includes('news') || ['nytimes', 'bbc', 'reuters', 'wsj'].some(d => domain.includes(d))) {
    sourceType = 'news';
  } else if (['twitter', 'facebook', 'linkedin'].some(d => domain.includes(d))) {
    sourceType = 'social';
  } else if (['medium', 'blog', 'wordpress'].some(d => domain.includes(d))) {
    sourceType = 'blog';
  } else {
    sourceType = 'commercial';
  }
  
  // Factuality indicators
  const factualityIndicators: string[] = [];
  if (content.includes('study') || content.includes('research')) factualityIndicators.push('research-based');
  if (content.includes('data') || content.includes('statistics')) factualityIndicators.push('data-driven');
  if (content.includes('citation') || content.includes('reference')) factualityIndicators.push('cited');
  if (content.includes('peer-review') || content.includes('published')) factualityIndicators.push('peer-reviewed');
  
  // Bias indicators
  const biasIndicators: string[] = [];
  const opinionWords = ['opinion', 'editorial', 'believe', 'think', 'feel', 'controversial'];
  if (opinionWords.some(word => content.toLowerCase().includes(word))) {
    biasIndicators.push('opinion-based');
  }
  if (content.includes('sponsored') || content.includes('advertisement')) {
    biasIndicators.push('commercial-bias');
  }
  
  // Calculate credibility score
  let credibilityScore = 0.5; // Base score
  if (domainAuthority === 'high') credibilityScore += 0.3;
  else if (domainAuthority === 'medium') credibilityScore += 0.15;
  
  if (sourceType === 'academic') credibilityScore += 0.2;
  else if (sourceType === 'government') credibilityScore += 0.15;
  else if (sourceType === 'news') credibilityScore += 0.1;
  
  credibilityScore += factualityIndicators.length * 0.05;
  credibilityScore -= biasIndicators.length * 0.1;
  
  credibilityScore = Math.max(0, Math.min(1, credibilityScore)); // Clamp between 0 and 1
  
  return {
    credibilityScore,
    domainAuthority,
    contentFreshness,
    sourceType,
    factualityIndicators,
    biasIndicators
  };
}

// Day 3: Advanced information extraction for structured data
export function extractStructuredInformation(content: string, url: string): StructuredContent {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  // Extract key facts
  const keyFacts: ExtractedFact[] = [];
  
  sentences.forEach(sentence => {
    const trimmed = sentence.trim();
    if (!trimmed) return;
    
    // Detect statistics
    if (/\d+%|\d+\s*(percent|million|billion|thousand)|\$\d+/.test(trimmed)) {
      keyFacts.push({
        claim: trimmed,
        confidence: 0.8,
        evidence: url,
        category: 'statistic',
        entities: extractEntities(trimmed)
      });
    }
    
    // Detect quotes
    if (/"[^"]*"/.test(trimmed) || /'[^']*'/.test(trimmed)) {
      keyFacts.push({
        claim: trimmed,
        confidence: 0.7,
        evidence: url,
        category: 'quote',
        entities: extractEntities(trimmed)
      });
    }
    
    // Detect definitions
    if (/is defined as|refers to|means that|is the process of/.test(trimmed.toLowerCase())) {
      keyFacts.push({
        claim: trimmed,
        confidence: 0.75,
        evidence: url,
        category: 'definition',
        entities: extractEntities(trimmed)
      });
    }
    
    // Detect relationships
    if (/leads to|causes|results in|due to|because of/.test(trimmed.toLowerCase())) {
      keyFacts.push({
        claim: trimmed,
        confidence: 0.65,
        evidence: url,
        category: 'relationship',
        entities: extractEntities(trimmed)
      });
    }
  });
  
  // Extract main topics (simple approach using frequency)
  const words = content.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  const wordFreq: { [key: string]: number } = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  
  const mainTopics = Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
  
  // Extract named entities (basic implementation)
  const namedEntities: { [category: string]: string[] } = {
    organizations: extractPatterns(content, /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Inc|Corp|LLC|Ltd|Company|Group)\b/g),
    locations: extractPatterns(content, /\b(?:[A-Z][a-z]+\s+)*[A-Z][a-z]+(?:\s+City|\s+State|\s+Country)?\b/g),
    dates: extractPatterns(content, /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/g),
    numbers: extractPatterns(content, /\b\d+(?:,\d{3})*(?:\.\d+)?\s*(?:%|percent|million|billion|thousand)?\b/g)
  };
  
  // Generate summary (first few sentences)
  const summary = sentences.slice(0, 3).join('. ') + (sentences.length > 3 ? '.' : '');
  
  return {
    keyFacts: keyFacts.slice(0, 20), // Limit to top 20 facts
    mainTopics,
    namedEntities,
    summary,
    citations: [url]
  };
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

// Helper functions for Day 3 features

// Aggregate and deduplicate search results
function aggregateAndDeduplicateResults(searchResults: ParallelSearchResult[]): SearchResult[] {
  const urlSet = new Set<string>();
  const aggregated: SearchResult[] = [];
  
  // Sort search results by success and execution time
  const sortedResults = searchResults.sort((a, b) => {
    if (a.success && !b.success) return -1;
    if (!a.success && b.success) return 1;
    return a.executionTime - b.executionTime;
  });
  
  for (const searchResult of sortedResults) {
    if (!searchResult.success) continue;
    
    for (const result of searchResult.results) {
      if (!urlSet.has(result.url)) {
        urlSet.add(result.url);
        aggregated.push(result);
      }
    }
  }
  
  // Sort by relevance score
  return aggregated.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
}

// Extract entities from text (basic implementation)
function extractEntities(text: string): string[] {
  const entities: string[] = [];
  
  // Extract capitalized words/phrases (potential proper nouns)
  const capitalizedMatches = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
  if (capitalizedMatches) {
    entities.push(...capitalizedMatches);
  }
  
  // Extract numbers
  const numberMatches = text.match(/\b\d+(?:,\d{3})*(?:\.\d+)?\b/g);
  if (numberMatches) {
    entities.push(...numberMatches);
  }
  
  // Remove duplicates
  return [...new Set(entities)];
}

// Extract patterns from text
function extractPatterns(text: string, pattern: RegExp): string[] {
  const matches = text.match(pattern);
  return matches ? [...new Set(matches)] : [];
}