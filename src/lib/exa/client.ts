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